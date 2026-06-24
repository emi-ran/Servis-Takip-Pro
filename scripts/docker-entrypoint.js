const { spawn } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");

const prismaBin = join(__dirname, "..", "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");

if (!existsSync(prismaBin)) {
  console.error("Prisma CLI bulunamadı. Veritabanı migrasyonları uygulanamadı.");
  process.exit(1);
}

const migrate = spawn(prismaBin, ["migrate", "deploy"], { stdio: "inherit", shell: false });

migrate.on("error", (error) => {
  console.error(error.message || error);
  process.exit(1);
});

migrate.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  if (code !== 0) {
    process.exit(code ?? 1);
    return;
  }

  const server = spawn("node", ["server.js"], { stdio: "inherit", shell: false });

  server.on("error", (error) => {
    console.error(error.message || error);
    process.exit(1);
  });

  server.on("exit", (serverCode, serverSignal) => {
    if (serverSignal) {
      process.kill(process.pid, serverSignal);
      return;
    }

    process.exit(serverCode ?? 1);
  });
});
