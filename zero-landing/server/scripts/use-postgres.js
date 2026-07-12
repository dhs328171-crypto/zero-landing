// Switch Prisma provider to PostgreSQL (production mode).
// Usage: node scripts/use-postgres.js
// After running, edit server/.env → DATABASE_URL to point to your Postgres instance.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const schemaPath = join(root, "prisma", "schema.prisma");
const envPath = join(root, ".env");

let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"');
writeFileSync(schemaPath, schema);

let envContent = "";
if (existsSync(envPath)) envContent = readFileSync(envPath, "utf8");

const defaultPg = 'postgresql://postgres:postgres@localhost:5432/zero_db?schema=public';
if (!/DATABASE_URL\s*=/.test(envContent)) {
  envContent += `\nDATABASE_URL="${defaultPg}"\n`;
} else if (!/postgresql:\/\//.test(envContent.split("DATABASE_URL=")[1]?.split("\n")[0] || "")) {
  envContent = envContent.replace(/DATABASE_URL\s*=.*/, `DATABASE_URL="${defaultPg}"`);
}

mkdirSync(root, { recursive: true });
writeFileSync(envPath, envContent);

console.log("✓ Prisma provider = postgresql");
console.log(`✓ DATABASE_URL set to: ${defaultPg}`);
console.log("Edit server/.env if your Postgres credentials are different.");
console.log("Run:  npx prisma generate  &&  npx prisma migrate dev --name init  &&  npm run seed");
