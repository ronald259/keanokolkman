import { createHash, randomBytes } from "node:crypto";

/** Cryptografisch sterk random id, geschikt als primary key. */
export function generateId(prefix = ""): string {
  return prefix + randomBytes(9).toString("base64url");
}

/**
 * Cliëntcode in formaat AGN-YYYY-XXX, conform de behandelaren-app
 * (TRAJECTEN.client_id). Bewust met een 4-cijferig randomdeel om collisions
 * over een jaar te vermijden — bij echte productie moet dit een database-
 * sequence worden.
 */
export function generateClientCode(year = new Date().getFullYear()): string {
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `AGN-${year}-${seq}`;
}

/**
 * Stabiele, niet-omkeerbare fingerprint van een IP. Wordt opgeslagen ipv het
 * volledige IP om rate-limit en fraude-onderzoek mogelijk te maken zonder
 * onnodige persoonsdata.
 */
export function fingerprintIp(ip: string, salt = process.env.IP_HASH_SALT || ""): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}
