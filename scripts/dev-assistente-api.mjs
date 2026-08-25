import { spawn } from "node:child_process";
import { ensureAssistenteApiReady } from "./lib/assistente-api-python.mjs";

const { assistenteApiDir, uvicornBin } = ensureAssistenteApiReady();

const child = spawn(
  uvicornBin,
  ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
  {
    cwd: assistenteApiDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
