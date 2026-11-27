import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { resolveProjectDocumentPath } from "../src/storage/project-document-storage.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("armazenamento compartilhado de documentos", () => {
  let directory: string;
  const previousExportsDirectory = process.env.EXPORTS_DIR;

  beforeAll(async () => {
    const parent = join(root, "apps/assistente-api/.local");
    await mkdir(parent, { recursive: true });
    directory = await mkdtemp(join(parent, "storage-test-"));
    await writeFile(join(directory, "report.pdf"), "%PDF-1.4 teste");
    process.env.EXPORTS_DIR = relative(root, directory);
  });

  afterAll(async () => {
    await rm(directory, { recursive: true, force: true });
    if (previousExportsDirectory === undefined) delete process.env.EXPORTS_DIR;
    else process.env.EXPORTS_DIR = previousExportsDirectory;
  });

  it("resolve exports relativo à raiz do monorepo, inclusive a partir de outro diretório", async () => {
    const previousDirectory = process.cwd();
    try {
      process.chdir(tmpdir());
      expect(await resolveProjectDocumentPath(join(directory, "report.pdf"))).toBe(join(directory, "report.pdf"));
      expect(await resolveProjectDocumentPath("report.pdf")).toBe(join(directory, "report.pdf"));
    } finally {
      process.chdir(previousDirectory);
    }
  });

  it("continua bloqueando caminhos que escapam do diretório configurado", async () => {
    await expect(resolveProjectDocumentPath("../outside.pdf")).rejects.toMatchObject({ statusCode: 404 });
  });
});
