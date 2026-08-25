import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import pg from "pg";

import { loadEnvFile } from "./lib/load-env.mjs";
import { envPath } from "./lib/workspace-paths.mjs";

loadEnvFile(envPath);

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL nao definido. Crie o arquivo .env antes de aplicar o SQL.");
  process.exit(1);
}

const sqlDir = path.resolve(process.cwd(), "packages/database/sql");

function collectSqlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSqlFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".sql")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = collectSqlFiles(sqlDir);

if (files.length === 0) {
  console.log("Nenhum arquivo SQL encontrado em packages/database/sql.");
  process.exit(0);
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();

  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(sqlDir, file);

    console.log(`Aplicando ${relativePath}...`);
    await client.query(sql);
  }

  console.log("SQL aplicado com sucesso.");
} catch (error) {
  console.error("Falha ao aplicar o SQL versionado.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
