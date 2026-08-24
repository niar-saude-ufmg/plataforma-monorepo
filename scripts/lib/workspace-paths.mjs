import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const rootDir = path.resolve(currentDir, "..", "..");
export const databaseDir = path.join(rootDir, "packages", "database");
export const shellDir = path.join(rootDir, "apps", "shell");
export const adminWebDir = path.join(rootDir, "apps", "admin-web");
export const adminApiDir = path.join(rootDir, "apps", "admin-api");
export const databaseBinDir = path.join(databaseDir, "node_modules", ".bin");
export const shellBinDir = path.join(shellDir, "node_modules", ".bin");
export const adminWebBinDir = path.join(adminWebDir, "node_modules", ".bin");
export const adminApiBinDir = path.join(adminApiDir, "node_modules", ".bin");
export const envExamplePath = path.join(rootDir, ".env.example");
export const envPath = path.join(rootDir, ".env");
