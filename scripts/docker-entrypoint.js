const { spawn } = require("child_process");
const { Client } = require("pg");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function getTableCount() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const result = await client.query(
      "select count(*)::int as count from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'"
    );
    return result.rows[0]?.count ?? 0;
  } finally {
    await client.end();
  }
}

async function main() {
  const tableCount = await getTableCount();

  if (tableCount === 0) {
    console.log("No tables found. Running prisma db push...");
    await run("npx", ["prisma", "db", "push"]);
  }

  await run("node", ["server.js"]);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
