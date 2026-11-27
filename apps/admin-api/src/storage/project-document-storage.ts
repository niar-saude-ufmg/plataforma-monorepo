import { constants, existsSync } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { AppError } from "../errors/app-error.js";

const workspaceRoot = () => {
  let directory = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(directory, "pnpm-workspace.yaml"))) {
    const parent = dirname(directory);
    if (parent === directory) return process.cwd();
    directory = parent;
  }
  return directory;
};

const WORKSPACE_ROOT = workspaceRoot();
const DEFAULT_EXPORTS_DIR = resolve(WORKSPACE_ROOT, "apps/assistente-api/.local/exports");

const exportsDirectory = () => {
  const configured = process.env.EXPORTS_DIR ?? DEFAULT_EXPORTS_DIR;
  const expanded = configured === "~" ? homedir()
    : configured.startsWith("~/") ? join(homedir(), configured.slice(2)) : configured;
  return resolve(WORKSPACE_ROOT, expanded);
};
const isWithinDirectory = (directory: string, candidate: string) => {
  const relativePath = relative(directory, candidate);
  return relativePath !== "" && relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
};

export const resolveProjectDocumentPath = async (storagePath: string) => {
  try {
    const rootPath = await realpath(exportsDirectory());
    const requestedPath = isAbsolute(storagePath)
      ? resolve(storagePath)
      : resolve(rootPath, storagePath);
    const filePath = await realpath(requestedPath);

    if (!isWithinDirectory(rootPath, filePath)) {
      throw new Error("Documento fora do diretório de exports");
    }

    if (!(await stat(filePath)).isFile()) throw new Error("Documento não é um arquivo regular");
    await access(filePath, constants.R_OK);
    return filePath;
  } catch {
    throw new AppError("Arquivo do documento não encontrado", 404);
  }
};
