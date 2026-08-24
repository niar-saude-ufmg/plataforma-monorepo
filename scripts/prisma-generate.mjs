import { loadEnvFile } from "./lib/load-env.mjs";
import { getLocalBin, runCommand } from "./lib/run-command.mjs";
import { databaseBinDir, databaseDir, envPath } from "./lib/workspace-paths.mjs";

loadEnvFile(envPath);

runCommand(getLocalBin(databaseBinDir, "prisma"), ["generate", "--schema", "./prisma/schema.prisma"], {
  cwd: databaseDir,
  env: process.env
});
