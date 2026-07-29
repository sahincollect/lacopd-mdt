import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use native crypto for Edge Runtime compatibility — manual JWT verify
async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return false;

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const signingInput = enc.encode(`${headerB64}.${payloadB64}`);
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sig, signingInput);
    if (!valid) return false;

    // Check expiration
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isMdtRoute = request.nextUrl.pathname.startsWith("/mdt");
  const isLoginRoute = request.nextUrl.pathname === "/giris";
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("CRITICAL SECURITY ERROR: JWT_SECRET is not set!");
    return NextResponse.json({ message: "Sistem yapılandırma hatası: JWT_SECRET tanımlanmamış." }, { status: 500 });
  }

  if (isMdtRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    const valid = await verifyToken(token, secret);
    if (!valid) {
      return NextResponse.redirect(new URL("/giris", request.url));
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
  matcher: ["/mdt/:path*", "/giris"],
};
