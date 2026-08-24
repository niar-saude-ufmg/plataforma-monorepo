import { rootDir } from "./lib/workspace-paths.mjs";
import { runCommand } from "./lib/run-command.mjs";

runCommand("docker", ["compose", "up", "-d", "mysql"], { cwd: rootDir });
