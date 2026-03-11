import type {
  AddressFamily,
  AnswerResult,
  CalculatorResult,
  Difficulty,
  PowerTableRow,
  QuizQuestion,
} from "@/app/types";

type WasmModule = {
  generateQuestion(seed: number, difficulty: Difficulty, addressFamily: AddressFamily): string;
  evaluateAnswer(questionJson: string, answerText: string): string;
  calculateSubnet(inputText: string, addressFamily: AddressFamily): string;
  getPowerTable(maxBits: number): string;
};

let modulePromise: Promise<WasmModule> | null = null;

function getModuleUrl() {
  const base = import.meta.env.BASE_URL;
  return `${base}wasm/subnet_engine.js`;
}

async function loadModule(): Promise<WasmModule> {
  const moduleUrl = getModuleUrl();
  const resolvedModuleUrl = new URL(moduleUrl, window.location.href);
  const response = await fetch(resolvedModuleUrl);

  if (!response.ok) {
    throw new Error(`Failed to load subnet engine module: ${response.status} ${response.statusText}`);
  }

  const source = await response.text();
  const blobUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

  let imported: { default: (options?: { locateFile: (file: string) => string }) => Promise<WasmModule> };

  try {
    imported = (await import(/* @vite-ignore */ blobUrl)) as typeof imported;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }

  const createModule = imported.default;

  return createModule({
    locateFile: (file) => new URL(file, resolvedModuleUrl).toString(),
  });
}

async function getModule() {
  if (!modulePromise) {
    modulePromise = loadModule();
  }

  return modulePromise;
}

function parsePayload<T>(payload: string): T {
  const parsed = JSON.parse(payload) as T & { error?: string };
  if (typeof parsed === "object" && parsed !== null && "error" in parsed && parsed.error) {
    throw new Error(parsed.error);
  }
  return parsed;
}

export async function generateQuestion(
  seed: number,
  difficulty: Difficulty,
  addressFamily: AddressFamily,
) {
  const module = await getModule();
  return parsePayload<QuizQuestion>(module.generateQuestion(seed, difficulty, addressFamily));
}

export async function evaluateAnswer(question: QuizQuestion, answerText: string) {
  const module = await getModule();
  return parsePayload<AnswerResult>(module.evaluateAnswer(JSON.stringify(question), answerText));
}

export async function calculateSubnet(inputText: string, addressFamily: AddressFamily) {
  const module = await getModule();
  return parsePayload<CalculatorResult>(module.calculateSubnet(inputText, addressFamily));
}

export async function getPowerTable(maxBits: number) {
  const module = await getModule();
  return parsePayload<PowerTableRow[]>(module.getPowerTable(maxBits));
}
