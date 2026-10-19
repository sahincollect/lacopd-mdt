export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthBaseUrl } from "@/lib/auth-config";

export async function GET(req: Request) {
  const baseUrl = getAuthBaseUrl(req);
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      `${baseUrl}/giris?error=missing_credentials&detail=${encodeURIComponent("DISCORD_CLIENT_ID çevre değişkeni tanımlanmamış.")}`
    );
  }

  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

  // State parametresi ile redirectUri'yi sakla (Vercel proxy/domain uyumsuzluklarını önler)
  const nonce = randomBytes(24).toString("hex");
  const statePayload = {
    redirectUri,
    origin: baseUrl,
    timestamp: Date.now(),
    nonce,
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const scope = "identify";
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}&prompt=consent`;

  const response = NextResponse.redirect(discordLoginUrl);

  // Yedek çerez olarak da redirectUri'yi kaydet
  response.cookies.set({
    name: "discord_oauth_redirect_uri",
    value: encodeURIComponent(redirectUri),
    httpOnly: true,
    path: "/",
    maxAge: 600, // 10 dakika
    sameSite: "lax",
    secure: !baseUrl.includes("localhost"),
  });

  // CSRF korumasi: state icindeki nonce, ayni tarayiciya ait HttpOnly cerezle callback'te eslestirilir.
  response.cookies.set({
    name: "discord_oauth_state",
    value: nonce,
    httpOnly: true,
    path: "/",
    maxAge: 600,
    sameSite: "lax",
    secure: !baseUrl.includes("localhost"),
  });

  return response;
}
