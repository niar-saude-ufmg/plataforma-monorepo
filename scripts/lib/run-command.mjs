import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

export function getLocalBin(binDir, name) {
  return path.join(binDir, process.platform === "win32" ? `${name}.cmd` : name);
}

export function runStreamingCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });
  });
}
