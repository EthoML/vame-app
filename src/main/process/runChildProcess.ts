import { app } from "electron";

export function runChildProcess(exec: string, path?: string[]) {
  let stdoutChunks = [], stderrChunks = [];
  const spawn = require("child_process").spawn

  const child = spawn(exec, path, {
    env: {
      ...process.env,
      PATH: process.env.PATH,
      PYTHONFAULTHANDLER: "1",
      PYTHONUNBUFFERED: "1"
    }
  });

  child.on('exit', (code) => {
    console.log(`[${exec}]: Process exited with code ${code}`)
    app.exit(code ?? -1)
  });

  child.stdout.on('data', (data) => {
    console.log(`[${exec}]:`, data.toString());
    stdoutChunks = stdoutChunks.concat(data);
  });

  child.stderr.on('data', (data) => {
    // Print each chunk immediately to avoid truncation
    process.stderr.write(`[${exec} error]: ${data.toString()}`);
    stderrChunks = stderrChunks.concat(data);
  });

  return child
}
