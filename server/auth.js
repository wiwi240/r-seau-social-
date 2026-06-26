import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

function hashRaw(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = hashRaw(password, salt);
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedValue) {
  const [salt, existingHash] = String(storedValue || "").split(":");
  if (!salt || !existingHash) {
    return false;
  }

  const computedHash = hashRaw(password, salt);
  return timingSafeEqual(Buffer.from(existingHash, "hex"), Buffer.from(computedHash, "hex"));
}

export function createToken() {
  return randomUUID();
}
