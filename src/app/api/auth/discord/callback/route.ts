import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (error) {
    return NextResponse.redirect(`${appUrl}/giris?error=discord_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/giris?error=no_code`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  try {
    // 1. Exchange code for access token (Sadece OAuth2 identify, bot kullanılmaz)
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
      return NextResponse.redirect(`${appUrl}/giris?error=discord_token_failed`);
    }

    const tokenData = await tokenRes.json();

    // 2. Fetch Discord User Profile
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/giris?error=discord_user_failed`);
    }

    const discordUser = await userRes.json();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) >> BigInt(22)) % 6}.png`;

    const secretString = process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";
    const secret = new TextEncoder().encode(secretString);

    // 3. Bu Discord ID ile kayıtlı memur var mı kontrol et
    let officer = await prisma.officer.findUnique({
      where: { discordId: discordUser.id },
    });

    if (officer) {
      // Avatar güncellenmişse senkronize et
      if (avatarUrl && officer.profileImage !== avatarUrl) {
        officer = await prisma.officer.update({
          where: { id: officer.id },
          data: { profileImage: avatarUrl },
        });
      }

      if (officer.status === "PENDING") {
        const params = new URLSearchParams({
          status: "pending",
          dname: discordUser.global_name || discordUser.username || "",
          duser: discordUser.username || "",
          davatar: avatarUrl || "",
          oname: officer.name || "",
          obadge: officer.badge || "",
          orank: officer.rank || "",
        });
        return NextResponse.redirect(`${appUrl}/giris?${params.toString()}`);
      }

      if (officer.status === "REJECTED") {
        return NextResponse.redirect(`${appUrl}/giris?error=account_rejected`);
      }

      // Onaylı hesap -> doğrudan MDT'ye giriş yap
      const token = await new SignJWT({
        id: officer.id,
        badge: officer.badge,
        role: officer.role,
        name: officer.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const response = NextResponse.redirect(`${appUrl}/mdt`);
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    // 4. Kayıtlı değilse -> IC Ad Soyad, Rütbe ve Rozet No doldurma ekranına yönlendir
    const regToken = await new SignJWT({
      discordId: discordUser.id,
      discordUsername: discordUser.username,
      globalName: discordUser.global_name || discordUser.username,
      avatarUrl,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    const params = new URLSearchParams({
      step: "register",
      dname: discordUser.global_name || discordUser.username || "",
      duser: discordUser.username || "",
      did: discordUser.id || "",
      davatar: avatarUrl || "",
    });
    const response = NextResponse.redirect(`${appUrl}/giris?${params.toString()}`);
    response.cookies.set({
      name: "discord_reg_token",
      value: regToken,
      httpOnly: true,
      path: "/",
      maxAge: 3600,
    });

    return response;
  } catch (err) {
    console.error("Discord Auth Error:", err);
    return NextResponse.redirect(`${appUrl}/giris?error=server_error`);
  }
}
