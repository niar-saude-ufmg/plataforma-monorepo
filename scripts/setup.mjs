import fs from "node:fs";
import { envExamplePath, envPath, rootDir } from "./lib/workspace-paths.mjs";
import { ensureAssistenteApiReady } from "./lib/assistente-api-python.mjs";
import { runCommand } from "./lib/run-command.mjs";

runCommand("pnpm", ["install"], { cwd: rootDir });
ensureAssistenteApiReady();

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log("Arquivo .env criado a partir de .env.example.");
} else {
  console.log("Arquivo .env já existe. Mantendo versão atual.");
}

runCommand("node", ["./scripts/prisma-generate.mjs"], { cwd: rootDir });
