import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const outputDir = path.join(projectRoot, "public", "wasm");
const sourceFile = path.join(projectRoot, "src", "wasm", "subnet_engine.cpp");
const outputFile = path.join(outputDir, "subnet_engine.js");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed with exit code ${code}.`));
    });
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const compileArgs = [
    sourceFile,
    "-O3",
    "-std=c++20",
    "--bind",
    "-s",
    "MODULARIZE=1",
    "-s",
    "EXPORT_ES6=1",
    "-s",
    "ENVIRONMENT=web",
    "-s",
    "FILESYSTEM=0",
    "-s",
    "ALLOW_MEMORY_GROWTH=1",
    "-s",
    "EXPORT_NAME=createSubnetEngineModule",
    "-o",
    outputFile,
  ];

  const command = process.platform === "win32" ? "cmd.exe" : "em++";
  const args = process.platform === "win32" ? ["/c", "em++.bat", ...compileArgs] : compileArgs;

  try {
    await run(command, args);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Emscripten build failure.";
    throw new Error(
      `WASM build failed. Install and activate Emscripten before running this command. ${message}`,
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
