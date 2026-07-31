import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = encodeURIComponent(`${appUrl}/api/auth/discord/callback`);
  
  if (!clientId) {
    return NextResponse.json({ error: "Discord OAuth is not configured properly." }, { status: 500 });
  }

  // Sadece identify yetkisi yeterli, rolleri bot üzerinden kontrol edeceğiz
  const scope = "identify";
  
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  
  return NextResponse.redirect(discordLoginUrl);
}
