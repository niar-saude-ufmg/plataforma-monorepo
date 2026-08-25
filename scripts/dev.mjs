import { rootDir } from "./lib/workspace-paths.mjs";
import { runStreamingCommand } from "./lib/run-command.mjs";

await runStreamingCommand(
  "pnpm",
  [
    "exec",
    "concurrently",
    "-n",
    "shell,admin-web,admin-api,assistente-web,assistente-api",
    "-c",
    "green,yellow,blue,magenta,cyan",
    "pnpm dev:shell",
    "pnpm dev:admin-web",
    "pnpm dev:admin-api",
    "pnpm dev:assistente-web",
    "pnpm dev:assistente-api"
  ],
  { cwd: rootDir }
);
