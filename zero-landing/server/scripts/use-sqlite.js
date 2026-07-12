// Switch Prisma provider to SQLite (dev mode).
// Usage: node scripts/use-sqlite.js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const schemaPath = join(root, "prisma", "schema.prisma");
const envPath = join(root, ".env");
const envExamplePath = join(root, "..", ".env.example");

let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"');
writeFileSync(schemaPath, schema);

// Make sure .env exists with a SQLite URL
function ensureEnv() {
  let content = "";
  if (existsSync(envPath)) {
    content = readFileSync(envPath, "utf8");
  } else if (existsSync(envExamplePath)) {
    content = readFileSync(envExamplePath, "utf8");
  }
  if (!/DATABASE_URL\s*=/.test(content)) {
    content += `\nDATABASE_URL="file:./dev.db"\n`;
  } else {
    content = content.replace(
      /DATABASE_URL\s*=.*/,
      'DATABASE_URL="file:./dev.db"'
    );
  }
  mkdirSync(root, { recursive: true });
  writeFileSync(envPath, content);
}
ensureEnv();

console.log("✓ Prisma provider = sqlite");
console.log('✓ DATABASE_URL = "file:./dev.db"');
console.log("Run:  npx prisma generate  &&  npx prisma db push");
