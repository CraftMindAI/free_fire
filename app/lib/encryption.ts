import crypto from "crypto";

// For production, this should be stored securely in process.env.
// It must be exactly 32 bytes for AES-256.
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "titan-arena-encryption-key-12345";
const IV_LENGTH = 16;

function getValidKey() {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypts a string (e.g. user ID) into a URL-safe base64 string.
 */
export function encryptId(id: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", getValidKey(), iv);
  let encrypted = cipher.update(id, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Combine IV and encrypted data, and make URL safe
  const combined = iv.toString("base64") + ":" + encrypted;
  return Buffer.from(combined).toString("base64url");
}

/**
 * Decrypts a URL-safe base64 string back into the original ID.
 */
export function decryptId(encryptedId: string): string | null {
  try {
    const combined = Buffer.from(encryptedId, "base64url").toString("utf8");
    const textParts = combined.split(":");
    if (textParts.length !== 2) return null;

    const iv = Buffer.from(textParts[0], "base64");
    const encryptedText = Buffer.from(textParts[1], "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", getValidKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (e) {
    return null;
  }
}
