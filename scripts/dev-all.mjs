import net from "node:net";
import { spawn } from "node:child_process";

const API_PORT = 1337;

function getRunCommand() {
  if (process.platform === "win32") {
    return { command: "npm.cmd", argsPrefix: ["run"] };
  }

  return { command: "npm", argsPrefix: ["run"] };
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(true);
        return;
      }

      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(false));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function isApiHealthy(port) {
  const hosts = ["127.0.0.1", "localhost"];

  for (const host of hosts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
      const response = await fetch(`http://${host}:${port}/api/posts`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response) {
        return true;
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }

  return false;
}

function runScript(scriptName) {
  const { command, argsPrefix } = getRunCommand();

  return spawn(command, [...argsPrefix, scriptName], {
    stdio: "inherit",
  });
}

const children = [];

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopChildren();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopChildren();
  process.exit(0);
});

const apiAlreadyRunning = await isPortInUse(API_PORT);

if (apiAlreadyRunning) {
  const apiHealthy = await isApiHealthy(API_PORT);

  if (!apiHealthy) {
    console.error(
      `[dev:all] Port ${API_PORT} deja utilise, mais l'API ne repond pas. Libere ce port puis relance la commande.`
    );
    process.exit(1);
  }

  console.log(`[dev:all] API deja active sur le port ${API_PORT}. Backend non relance.`);
} else {
  children.push(runScript("dev:api"));
}

const frontend = runScript("dev");
children.push(frontend);

frontend.on("exit", (code) => {
  stopChildren();
  process.exit(code ?? 0);
});
