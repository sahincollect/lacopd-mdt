import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const redirectUri = encodeURIComponent(`${appUrl}/api/auth/discord/callback`);
  
  if (!clientId) {
    return NextResponse.json({ error: "Discord OAuth is not configured properly." }, { status: 500 });
  }

  const scope = "identify";
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  
  return NextResponse.redirect(discordLoginUrl);
}
