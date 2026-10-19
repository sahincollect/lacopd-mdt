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

export function getJwtSecretString(): string {
  return process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";
}

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtSecretString());
}
