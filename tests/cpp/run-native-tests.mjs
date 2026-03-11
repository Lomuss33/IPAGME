import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const buildDir = path.join(projectRoot, "build");
const outputFile = path.join(buildDir, process.platform === "win32" ? "subnet_engine_tests.exe" : "subnet_engine_tests");

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
  await mkdir(buildDir, { recursive: true });

  await run("g++", [
    "-std=c++20",
    "-Wall",
    "-Wextra",
    "-pedantic",
    path.join(projectRoot, "src", "wasm", "subnet_engine.cpp"),
    path.join(projectRoot, "tests", "cpp", "test_engine.cpp"),
    "-o",
    outputFile,
  ]);

  await run(outputFile, []);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
