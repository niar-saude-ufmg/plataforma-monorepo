import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";

import pg from "pg";

import { loadEnvFile } from "./lib/load-env.mjs";
import { getLocalBin, runCommand, runStreamingCommand } from "./lib/run-command.mjs";
import { ensurePythonAppReady } from "./lib/python-app.mjs";
import {
  assistenteApiDir,
  databaseBinDir,
  databaseDir,
  envExamplePath,
  envPath,
  ragApiDir,
  rootDir
} from "./lib/workspace-paths.mjs";

const { Client } = pg;
const isWindows = process.platform === "win32";
const infraLockDir = path.join(rootDir, ".local");
const infraLockPath = path.join(infraLockDir, "infra.lock");
const prodComposeArgs = ["-f", "docker-compose.prod.yml", "--env-file", ".env.production"];

function usage() {
  console.error(`Uso: node ./scripts/infra.mjs <comando>

Comandos:
  setup
  assistente-api:dev | assistente-api:check
  rag-api:dev | rag-api:check
  db:up | db:down | db:logs | db:apply:sql
  prisma:generate | prisma:db:pull
  prod:build | prod:up | prod:down | prod:logs | prod:deploy`);
  process.exit(1);
}

function captureCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
    shell: isWindows,
    env: process.env,
    ...options
  });
}

function ensureDockerAvailable() {
  const dockerVersion = captureCommand("docker", ["--version"]);

  if (dockerVersion.error || dockerVersion.status !== 0) {
    console.error("Docker nao encontrado. Instale Docker Desktop/localmente ou Docker Engine na VM antes de continuar.");
    process.exit(1);
  }

  const dockerOutput = `${dockerVersion.stdout ?? ""}${dockerVersion.stderr ?? ""}`;

  if (/podman/i.test(dockerOutput)) {
    console.error("O comando docker deste ambiente aponta para Podman. O projeto esta padronizado apenas em Docker.");
    process.exit(1);
  }

  const composeVersion = captureCommand("docker", ["compose", "version"]);

  if (composeVersion.error || composeVersion.status !== 0) {
    console.error("docker compose nao esta disponivel neste ambiente.");
    process.exit(1);
  }

  const dockerInfo = captureCommand("docker", ["info"]);

  if (dockerInfo.error || dockerInfo.status !== 0) {
    console.error("Docker daemon indisponivel para o usuario atual. Inicie o Docker e confirme as permissoes antes de continuar.");
    process.exit(1);
  }
}

function runCompose(composeArgs, options = {}) {
  ensureDockerAvailable();
  const args = ["compose", ...composeArgs];

  if (options.stream) {
    return runStreamingCommand("docker", args, { cwd: rootDir });
  }

  runCommand("docker", args, { cwd: rootDir });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForDatabase(databaseUrl, options = {}) {
  const retries = options.retries ?? 20;
  const delayMs = options.delayMs ?? 3000;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const client = new Client({ connectionString: databaseUrl });

    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end().catch(() => undefined);
      return;
    } catch (error) {
      await client.end().catch(() => undefined);

      if (attempt === retries) {
        throw new Error(
          `Banco de dados indisponivel apos ${retries} tentativas: ${
            error instanceof Error ? error.message : error
          }`
        );
      }

      console.log(`Aguardando banco de dados ficar pronto (${attempt}/${retries})...`);
      await sleep(delayMs);
    }
  }
}

function ensureLockDirectory() {
  fs.mkdirSync(infraLockDir, { recursive: true });
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function withInfraLock(action) {
  ensureLockDirectory();

  if (fs.existsSync(infraLockPath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(infraLockPath, "utf8"));
      if (isProcessAlive(Number(lock.pid))) {
        console.error(`Ja existe um processo de infraestrutura em execucao (pid ${lock.pid}). Aguarde terminar e tente novamente.`);
        process.exit(1);
      }
    } catch {
      // If the file is unreadable, treat it as stale and replace it.
    }

    fs.rmSync(infraLockPath, { force: true });
  }

  fs.writeFileSync(infraLockPath, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));

  try {
    return await action();
  } finally {
    fs.rmSync(infraLockPath, { force: true });
  }
}

function resolveEnvFile(args, fallbackPath = envPath) {
  const envFlagIndex = args.findIndex((arg) => arg === "--env-file");

  if (envFlagIndex >= 0 && args[envFlagIndex + 1]) {
    return path.resolve(rootDir, args[envFlagIndex + 1]);
  }

  return fallbackPath;
}

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

function ensureEnvFile() {
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("Arquivo .env criado a partir de .env.example.");
    return;
  }

  console.log("Arquivo .env ja existe. Mantendo versao atual.");
}

function runPrisma(command) {
  loadEnvFile(envPath);

  runCommand(getLocalBin(databaseBinDir, "prisma"), command, {
    cwd: databaseDir,
    env: process.env
  });
}

async function applySql(args) {
  const selectedEnvPath = resolveEnvFile(args);
  loadEnvFile(selectedEnvPath);

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL nao definido. Crie o arquivo .env antes de aplicar o SQL.");
    process.exit(1);
  }

  const sqlDir = path.resolve(rootDir, "packages/database/sql");
  const files = collectSqlFiles(sqlDir);

  if (files.length === 0) {
    console.log("Nenhum arquivo SQL encontrado em packages/database/sql.");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await waitForDatabase(databaseUrl);
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
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

// Apps Python do workspace: diretorio, modulo ASGI, porta padrao e pacotes
// compilados no check (que gera o artefato de build esperado pelo turbo).
const pythonApps = {
  "assistente-api": {
    dir: assistenteApiDir,
    asgi: "app.main:app",
    portEnv: "ASSISTENTE_API_PORT",
    defaultPort: "8000",
    packages: ["app"]
  },
  "rag-api": {
    dir: ragApiDir,
    asgi: "api.main:app",
    portEnv: "RAG_API_PORT",
    defaultPort: "8001",
    packages: ["api", "agent"]
  }
};

async function runPythonAppDev(name) {
  const app = pythonApps[name];
  const { uvicornBin } = ensurePythonAppReady(app.dir, name);
  loadEnvFile(envPath);
  const port = process.env[app.portEnv] || app.defaultPort;

  const child = spawn(
    uvicornBin,
    [app.asgi, "--reload", "--host", "0.0.0.0", "--port", port],
    {
      cwd: app.dir,
      stdio: "inherit",
      shell: isWindows
    }
  );

  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

function checkPythonApp(name) {
  const app = pythonApps[name];
  const { pythonBin } = ensurePythonAppReady(app.dir, name);

  runCommand(pythonBin, ["-m", "compileall", ...app.packages], { cwd: app.dir });
  fs.mkdirSync(path.join(app.dir, "build"), { recursive: true });
  fs.writeFileSync(path.join(app.dir, "build", `${name}.compile`), new Date().toISOString());
}

async function runPythonAppTests(name) {
  const app = pythonApps[name];
  const { pythonBin } = ensurePythonAppReady(app.dir, name, { devDependencies: true });

  runCommand(pythonBin, ["-m", "pytest", "tests"], { cwd: app.dir });
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    usage();
  }

  switch (command) {
    case "setup":
      await withInfraLock(() => {
        runCommand("pnpm", ["install"], { cwd: rootDir });
        for (const [name, app] of Object.entries(pythonApps)) {
          ensurePythonAppReady(app.dir, name);
        }
        ensureEnvFile();
        runPrisma(["generate", "--schema", "./prisma/schema.prisma"]);
      });
      return;

    case "assistente-api:dev":
    case "rag-api:dev":
      await runPythonAppDev(command.replace(/:dev$/, ""));
      return;

    case "assistente-api:check":
    case "rag-api:check":
      checkPythonApp(command.replace(/:check$/, ""));
      return;

    case "rag-api:test":
      await runPythonAppTests("rag-api");
      return;

    case "db:up":
      await withInfraLock(() => {
        runCompose(["up", "-d", "postgres"]);
      });
      return;

    case "db:down":
      await withInfraLock(() => {
        runCompose(["down"]);
      });
      return;

    case "db:logs":
      await runCompose(["logs", "-f", "postgres"], { stream: true, maintenance: false });
      return;

    case "db:apply:sql":
      await withInfraLock(async () => {
        await applySql(args);
      });
      return;

    case "prisma:generate":
      runPrisma(["generate", "--schema", "./prisma/schema.prisma"]);
      return;

    case "prisma:db:pull":
      loadEnvFile(envPath);
      runCommand(getLocalBin(databaseBinDir, "prisma"), ["db", "pull", "--schema", "./prisma/schema.prisma"], {
        cwd: databaseDir,
        env: process.env
      });
      return;

    case "prod:build":
      await withInfraLock(() => {
        runCompose([...prodComposeArgs, "build"]);
      });
      return;

    case "prod:up":
      await withInfraLock(() => {
        runCompose([...prodComposeArgs, "up", "-d", "--build", "--force-recreate", "--remove-orphans"]);
      });
      return;

    case "prod:down":
      await withInfraLock(() => {
        runCompose([...prodComposeArgs, "down"]);
      });
      return;

    case "prod:logs":
      await runCompose([...prodComposeArgs, "logs", "-f"], { stream: true, maintenance: false });
      return;

    case "prod:deploy":
      await withInfraLock(() => {
        runCompose([...prodComposeArgs, "up", "-d", "postgres"]);
      });
      await applySql(["--env-file", ".env.production"]);
      await withInfraLock(() => {
        runCompose([...prodComposeArgs, "up", "-d", "--build", "--force-recreate", "--remove-orphans"]);
      });
      return;

    default:
      usage();
  }
}

await main();
