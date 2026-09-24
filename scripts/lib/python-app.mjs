import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";

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

function findPythonCommand(label) {
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

  console.error(`Nao foi possivel localizar Python para preparar o ${label}.`);
  process.exit(1);
}

function requirementsChanged(requirementsPath, stampPath) {
  if (!fs.existsSync(stampPath)) {
    return true;
  }

  const requirementsStat = fs.statSync(requirementsPath);
  const stampStat = fs.statSync(stampPath);
  return requirementsStat.mtimeMs > stampStat.mtimeMs;
}

export function getPythonAppPaths(appDir) {
  const venvDir = path.join(appDir, ".venv");
  const venvBinDir = path.join(venvDir, isWindows ? "Scripts" : "bin");

  return {
    venvDir,
    pipBin: path.join(venvBinDir, isWindows ? "pip.exe" : "pip"),
    pythonBin: path.join(venvBinDir, isWindows ? "python.exe" : "python"),
    uvicornBin: path.join(venvBinDir, isWindows ? "uvicorn.exe" : "uvicorn"),
    requirementsPath: path.join(appDir, "requirements.txt"),
    stampPath: path.join(venvDir, ".requirements-installed"),
  };
}

export function ensurePythonAppReady(appDir, label) {
  const { venvDir, pipBin, pythonBin, uvicornBin, requirementsPath, stampPath } = getPythonAppPaths(appDir);
  const pythonCommand = findPythonCommand(label);
  const createVenvArgs = pythonCommand === "py" ? ["-3", "-m", "venv", ".venv"] : ["-m", "venv", ".venv"];

  if (!fs.existsSync(venvDir)) {
    console.log(`Criando .venv do ${label}...`);
    runChecked(pythonCommand, createVenvArgs, { cwd: appDir });
  }

  if (!fs.existsSync(pipBin)) {
    console.log(`Recriando dependencias da .venv do ${label}...`);
    runChecked(pythonCommand, createVenvArgs, { cwd: appDir });
  }

  if (requirementsChanged(requirementsPath, stampPath) || !fs.existsSync(uvicornBin)) {
    console.log(`Instalando dependencias Python do ${label}...`);
    runChecked(pipBin, ["install", "-r", "requirements.txt"], { cwd: appDir });
    fs.writeFileSync(stampPath, new Date().toISOString());
  }

  return { appDir, pythonBin, uvicornBin };
}
