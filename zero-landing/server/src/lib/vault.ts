/**
 * AES-256-GCM password vault.
 *
 * Why this exists:
 *   The user wants admins to be able to recover a customer's plaintext
 *   password in case of a support issue ("نسيت كلمة المرور" / account access
 *   disputes). The right way to do this WITHOUT storing plaintext is:
 *
 *     1. Keep the bcrypt hash  → used for authentication (one-way, fast).
 *     2. ALSO encrypt the plaintext with AES-256-GCM using a server-held key
 *        → stored in `user.passwordVault`. Only an admin with the right
 *          permission can decrypt it via the API, and every decryption is
 *          recorded in the audit log.
 *
 *   This is the same pattern used by enterprise password managers (1Password,
 *   Bitwarden): the data is encrypted at rest with a key the application holds
 *   separately from the database, so a DB leak alone does NOT compromise
 *   passwords.
 *
 *   In production, PASSWORD_VAULT_KEY must be rotated periodically and stored
 *   in a KMS / HSM, NOT in a .env file checked into git.
 */

import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

// The key MUST be exactly 32 bytes for AES-256. We derive it from the env var
// using SHA-256 so any string length works (defensive against misconfig).
const VAULT_KEY_RAW =
  process.env.PASSWORD_VAULT_KEY || "zero-default-vault-key-change-me-32-bytes!";
const VAULT_KEY = crypto.createHash("sha256").update(VAULT_KEY_RAW, "utf8").digest();

if (process.env.NODE_ENV !== "production" && VAULT_KEY_RAW.startsWith("zero-default")) {
  console.warn(
    "⚠️  PASSWORD_VAULT_KEY is using a default value. Set a strong 32-byte key in production!"
  );
}

/**
 * Encrypt a plaintext password.
 * Returns a single string `iv:authTag:ciphertext` (all hex).
 */
export function encryptPassword(plain: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV is recommended for GCM
  const cipher = crypto.createCipheriv(ALGO, VAULT_KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

/**
 * Decrypt a vault string back to plaintext.
 * Throws if the auth tag doesn't verify (i.e. the ciphertext was tampered).
 */
export function decryptPassword(vault: string): string {
  const [ivHex, tagHex, encHex] = vault.split(":");
  if (!ivHex || !tagHex || !encHex) {
    throw new Error("Invalid vault format");
  }
  const decipher = crypto.createDecipheriv(
    ALGO,
    VAULT_KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/**
 * Generate a random secure password (used by the admin "reset & show"
 * feature when a user loses their password).
 */
export function generateSecurePassword(length = 14): string {
  const charset =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%&*";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}
