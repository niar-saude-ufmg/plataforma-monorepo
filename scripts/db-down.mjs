import { rootDir } from "./lib/workspace-paths.mjs";
import { runCommand } from "./lib/run-command.mjs";

runCommand("docker", ["compose", "down"], { cwd: rootDir });
