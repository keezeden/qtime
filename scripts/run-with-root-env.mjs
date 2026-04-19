import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node --env-file=.env scripts/run-with-root-env.mjs <command> [...args]");
  process.exit(1);
}

let executable = command;
let executableArgs = args;

if (process.platform === "win32" && command === "npm") {
  const npmCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

  if (existsSync(npmCli)) {
    executable = process.execPath;
    executableArgs = [npmCli, ...args];
  } else {
    executable = "npm.cmd";
  }
}

const child = spawn(executable, executableArgs, {
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
