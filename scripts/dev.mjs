import { rootDir } from "./lib/workspace-paths.mjs";
import { runStreamingCommand } from "./lib/run-command.mjs";

await runStreamingCommand(
  "pnpm",
  [
    "exec",
    "concurrently",
    "-n",
    "shell,admin-web,admin-api",
    "-c",
    "green,yellow,blue",
    "pnpm dev:shell",
    "pnpm dev:admin-web",
    "pnpm dev:admin-api"
  ],
  { cwd: rootDir }
);
