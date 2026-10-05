import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "../errors/app-error.js";

const MAX_COEP_DOCUMENT_SIZE = 10 * 1024 * 1024;
const DEFAULT_EXPORTS_DIR = path.resolve(process.cwd(), "apps/assistente-api/.local/exports");

export type UploadedCoepDocument = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

export type StoredCoepDocument = {
  filename: string;
  storagePath: string;
};

const getExportsDirectory = () =>
  path.resolve(process.env.EXPORTS_DIR ?? DEFAULT_EXPORTS_DIR);

const sanitizeFilename = (filename: string) => {
  const basename = path.basename(filename).trim();
  const sanitized = basename.replace(/[^\p{L}\p{N}._-]+/gu, "_");

  if (!sanitized || !sanitized.toLowerCase().endsWith(".pdf")) {
    throw new AppError("O documento do COEP deve ser um arquivo PDF", 400);
  }

  if (sanitized.length > 255) {
    throw new AppError("O nome do documento do COEP é muito longo", 400);
  }

  return sanitized;
};

export const storeCoepDocument = async (
  file: UploadedCoepDocument
): Promise<StoredCoepDocument> => {
  const filename = sanitizeFilename(file.originalname);

  if (file.mimetype !== "application/pdf") {
    throw new AppError("O documento do COEP deve ser um arquivo PDF", 400);
  }

  if (file.buffer.length === 0 || file.buffer.length > MAX_COEP_DOCUMENT_SIZE) {
    throw new AppError("O documento do COEP deve ter entre 1 byte e 10 MB", 400);
  }

  if (file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new AppError("O arquivo enviado não é um PDF válido", 400);
  }

  const directory = path.join(getExportsDirectory(), "coep", "usuarios");
  await mkdir(directory, { recursive: true });

  const storagePath = path.join(directory, `${randomUUID()}.pdf`);
  await writeFile(storagePath, file.buffer, { flag: "wx" });

  return { filename, storagePath };
};

export const removeStoredCoepDocument = async (storagePath: string) => {
  await unlink(storagePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
};
