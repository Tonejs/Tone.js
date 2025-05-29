import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

export const execPromise = promisify(exec);

// trim trailing slash
export const ROOT_DIR = fileURLToPath(new URL("../..", import.meta.url)).slice(0, -1);
