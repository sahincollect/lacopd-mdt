import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=discord_denied`);
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const botToken = process.env.DISCORD_BOT_TOKEN!;
  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_ROLE_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Token error:", await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/?error=discord_token_failed`);
    }

    const tokenData = await tokenRes.json();

    // 2. Fetch User Profile
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/?error=discord_user_failed`);
    }
    const discordUser = await userRes.json();

    // 3. Fetch Guild Member info using Bot Token
    const memberRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUser.id}`, {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!memberRes.ok) {
      if (memberRes.status === 404) {
        return NextResponse.redirect(`${appUrl}/?error=not_in_server`);
      }
      console.error("Member fetch error:", await memberRes.text());
      return NextResponse.redirect(`${appUrl}/?error=member_fetch_failed`);
    }

    const memberData = await memberRes.json();

    // 4. Check for LAPD Role
    if (!memberData.roles.includes(roleId)) {
      return NextResponse.redirect(`${appUrl}/?error=missing_role`);
    }

    // 5. Parse Nickname (e.g. "[101] Ador Vance")
    const nickname = memberData.nick || discordUser.global_name || discordUser.username;
    const badgeMatch = nickname.match(/^\[(.*?)\]\s*(.*)$/);
    
    if (!badgeMatch) {
      return NextResponse.redirect(`${appUrl}/?error=invalid_nickname_format`);
    }

    const badgeStr = badgeMatch[1].trim();
    const nameStr = badgeMatch[2].trim();
    const avatarUrl = discordUser.avatar 
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null;

    // 6. Find or Create Officer
    // Try to find by discordId first, if not, fallback to badge (in case they existed before Discord Auth)
    let officer = await prisma.officer.findFirst({
      where: {
        OR: [
          { discordId: discordUser.id },
          { badge: badgeStr }
        ]
      }
    });

    if (officer) {
      // Update discord info if needed
      officer = await prisma.officer.update({
        where: { id: officer.id },
        data: {
          discordId: discordUser.id,
          profileImage: avatarUrl,
          name: nameStr, // Optionally update name to match Discord
        }
      });
    } else {
      // Create new officer
      officer = await prisma.officer.create({
        data: {
          discordId: discordUser.id,
          badge: badgeStr,
          name: nameStr,
          profileImage: avatarUrl,
          rank: "Memur",
          department: "Genel Devriye",
          role: "user",
          status: "APPROVED", // Auto-approve since they have the Discord role
        }
      });
    }

    if (officer.status !== "APPROVED") {
      return NextResponse.redirect(`${appUrl}/?error=account_not_approved`);
    }

    // 7. Create JWT
    const secretString = process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";
    const secret = new TextEncoder().encode(secretString);
    
    const token = await new SignJWT({
      id: officer.id,
      badge: officer.badge,
      role: officer.role,
      name: officer.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    // 8. Set Cookie & Redirect
    const response = NextResponse.redirect(`${appUrl}/mdt`);
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (err) {
    console.error("Discord Auth Error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=server_error`);
  }
}
