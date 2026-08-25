import { rootDir } from "./lib/workspace-paths.mjs";
import { runStreamingCommand } from "./lib/run-command.mjs";

await runStreamingCommand("docker", ["compose", "logs", "-f", "postgres"], { cwd: rootDir });
