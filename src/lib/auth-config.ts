import { createHash } from "crypto";

export function getAuthBaseUrl(req: Request): string {
  try {
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");

    if (forwardedHost) {
      const isLocal =
        forwardedHost.includes("localhost") ||
        forwardedHost.includes("127.0.0.1") ||
        forwardedHost.startsWith("192.168.") ||
        forwardedHost.startsWith("10.");
      const proto = isLocal ? (forwardedProto || "http") : "https";
      return `${proto}://${forwardedHost}`.replace(/\/+$/, "");
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
      const trimmed = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "");
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }

    const url = new URL(req.url);
    const isLocal =
      url.hostname.includes("localhost") ||
      url.hostname.includes("127.0.0.1");
    const proto = isLocal ? url.protocol.replace(":", "") : "https";
    return `${proto}://${url.host}`.replace(/\/+$/, "");
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") || "https://lacopd.online";
  }
}

export function extractRedirectUriFromState(stateParam: string | null): string | null {
  if (!stateParam) return null;
  try {
    const jsonStr = Buffer.from(stateParam, "base64url").toString("utf8");
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.redirectUri === "string" && parsed.redirectUri.startsWith("http")) {
      return parsed.redirectUri;
    }
  } catch {}
  return null;
}

/**
 * JWT imzalama anahtarı.
 * - JWT_SECRET tanımlıysa onu kullanır (önerilen).
 * - Tanımlı değilse, repoda bulunmayan gizli ortam değişkenlerinden (DATABASE_URL, DISCORD_CLIENT_SECRET)
 *   türetilmiş bir anahtar kullanır. Kaynak koddaki sabit bir yedek anahtar ARTIK YOKTUR.
 * - Hiçbiri yoksa hata fırlatır (fail-closed).
 * Not: middleware.ts aynı türetmeyi yapar; ikisi senkron kalmalıdır.
 */
export function getJwtSecretString(): string {
  const explicit = process.env.JWT_SECRET?.trim();
  if (explicit && explicit.length >= 16) return explicit;

  const material = `${process.env.DATABASE_URL || ""}|${process.env.DISCORD_CLIENT_SECRET || ""}`;
  if (material.length < 20) {
    throw new Error("JWT_SECRET tanımlı değil ve türetilebilecek gizli ortam değişkeni bulunamadı.");
  }
  return createHash("sha256").update(`lapd-mdt-jwt-v1:${material}`).digest("hex");
}

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtSecretString());
}

/** Zamanlama saldırısına dayanıklı string karşılaştırma. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0 && a.length === b.length;
}

export function extractNonceFromState(stateParam: string | null): string | null {
  if (!stateParam) return null;
  try {
    const parsed = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
    return parsed && typeof parsed.nonce === "string" ? parsed.nonce : null;
  } catch {
    return null;
  }
}
