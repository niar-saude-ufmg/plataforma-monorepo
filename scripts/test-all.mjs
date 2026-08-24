import {
  adminApiBinDir,
  adminApiDir,
  adminWebBinDir,
  adminWebDir,
  shellBinDir,
  shellDir
} from "./lib/workspace-paths.mjs";
import { getLocalBin, runCommand } from "./lib/run-command.mjs";

runCommand(getLocalBin(shellBinDir, "vitest"), ["run"], { cwd: shellDir });
runCommand(getLocalBin(adminWebBinDir, "vitest"), ["run"], { cwd: adminWebDir });
runCommand(getLocalBin(adminApiBinDir, "jest"), ["--runInBand"], {
  cwd: adminApiDir,
  env: {
    ...process.env,
    NODE_OPTIONS: "--experimental-vm-modules"
  }
});
