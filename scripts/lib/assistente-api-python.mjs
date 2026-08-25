import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { assistenteApiDir } from "./workspace-paths.mjs";

const isWindows = process.platform === "win32";
const venvDir = path.join(assistenteApiDir, ".venv");
const venvBinDir = path.join(venvDir, isWindows ? "Scripts" : "bin");
const pipBin = path.join(venvBinDir, isWindows ? "pip.exe" : "pip");
const uvicornBin = path.join(venvBinDir, isWindows ? "uvicorn.exe" : "uvicorn");
const requirementsPath = path.join(assistenteApiDir, "requirements.txt");
const stampPath = path.join(venvDir, ".requirements-installed");

function runChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function findPythonCommand() {
  const candidates = process.platform === "win32" ? ["py", "python"] : ["python3", "python"];

  for (const candidate of candidates) {
    const probeArgs = candidate === "py" ? ["-3", "--version"] : ["--version"];
    const result = spawnSync(candidate, probeArgs, {
      stdio: "ignore",
      shell: process.platform === "win32",
    });

    if (result.status === 0) {
      return candidate;
    }
  }

  console.error("Nao foi possivel localizar Python para preparar o assistente-api.");
  process.exit(1);
}

function requirementsChanged() {
  if (!fs.existsSync(stampPath)) {
    return true;
  }

  const requirementsStat = fs.statSync(requirementsPath);
  const stampStat = fs.statSync(stampPath);
  return requirementsStat.mtimeMs > stampStat.mtimeMs;
}

export function ensureAssistenteApiReady() {
  const pythonCommand = findPythonCommand();
  const createVenvArgs = pythonCommand === "py" ? ["-3", "-m", "venv", ".venv"] : ["-m", "venv", ".venv"];

  if (!fs.existsSync(venvDir)) {
    console.log("Criando .venv do assistente-api...");
    runChecked(pythonCommand, createVenvArgs, { cwd: assistenteApiDir });
  }

  if (!fs.existsSync(pipBin)) {
    console.log("Recriando dependencias da .venv do assistente-api...");
    runChecked(pythonCommand, createVenvArgs, { cwd: assistenteApiDir });
  }

  if (requirementsChanged() || !fs.existsSync(uvicornBin)) {
    console.log("Instalando dependencias Python do assistente-api...");
    runChecked(pipBin, ["install", "-r", "requirements.txt"], { cwd: assistenteApiDir });
    fs.writeFileSync(stampPath, new Date().toISOString());
  }

  return { assistenteApiDir, uvicornBin };
}
