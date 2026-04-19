import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const devCachePath = join(clientRoot, ".next", "dev");

rmSync(devCachePath, { force: true, recursive: true });
