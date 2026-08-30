import { rootDir } from "./lib/workspace-paths.mjs";
import { runCommand, runStreamingCommand } from "./lib/run-command.mjs";

// Vite Federation serves remotes from their production artifacts during local development.
runCommand("pnpm", ["--filter", "@niar/admin-web", "build"], { cwd: rootDir });
runCommand("pnpm", ["--filter", "@niar/assistente-web", "build"], { cwd: rootDir });

await runStreamingCommand(
  "pnpm",
  [
    "exec",
    "concurrently",
    "-n",
    "shell,admin-build,admin-remote,admin-api,assistente-build,assistente-remote,assistente-api",
    "-c",
    "green,yellow,yellow,blue,magenta,magenta,cyan",
    "pnpm dev:shell",
    "pnpm --filter @niar/admin-web dev:remote:watch",
    "pnpm --filter @niar/admin-web dev:remote:serve",
    "pnpm dev:admin-api",
    "pnpm --filter @niar/assistente-web dev:remote:watch",
    "pnpm --filter @niar/assistente-web dev:remote:serve",
    "pnpm dev:assistente-api"
  ],
  { cwd: rootDir }
);
