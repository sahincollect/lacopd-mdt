import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Use native crypto for Edge Runtime compatibility — manual JWT verify
async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, sigB64] = parts;
    if (!headerB64 || !payloadB64 || !sigB64) return false;

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signingInput = enc.encode(`${headerB64}.${payloadB64}`);
    const sigStr = base64UrlDecode(sigB64);
    const sig = Uint8Array.from(sigStr, (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sig, signingInput);
    if (!valid) return false;

    // Check expiration safely with base64UrlDecode
    const payloadStr = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadStr);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Tuzak rotalar: /mdt/admin, /wp-admin, /administrator, /panel -> /admin easteregg'ine yönlendir
  const trapPaths = ["/mdt/admin", "/wp-admin", "/administrator", "/panel", "/cpanel", "/phpmyadmin"];
  if (trapPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const trapUrl = new URL("/admin", request.url);
    trapUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(trapUrl);
  }

  const token = request.cookies.get("auth_token")?.value;
  const isMdtRoute = pathname.startsWith("/mdt");
  const isLoginRoute = pathname === "/giris";
  const secret = process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";

  if (isMdtRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    const valid = await verifyToken(token, secret);
    if (!valid) {
      const response = NextResponse.redirect(new URL("/giris", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
    return NextResponse.next();
  }

  if (isLoginRoute && token) {
    const valid = await verifyToken(token, secret);
    if (valid) {
      return NextResponse.redirect(new URL("/mdt", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mdt/:path*",
    "/giris",
    "/wp-admin/:path*",
    "/administrator/:path*",
    "/panel/:path*",
    "/cpanel/:path*",
    "/phpmyadmin/:path*",
  ],
};
