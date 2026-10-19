export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { getAuthBaseUrl, extractRedirectUriFromState, getJwtSecret } from "@/lib/auth-config";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const state = url.searchParams.get("state");

  const baseUrl = getAuthBaseUrl(req);

  // Kullanıcı Discord ekranında "İptal" dediyse
  if (error) {
    console.warn("Discord OAuth redirect error:", error, errorDescription);
    const detail = errorDescription || error;
    return NextResponse.redirect(`${baseUrl}/giris?error=discord_denied&detail=${encodeURIComponent(detail)}`);
  }

  // Kod yoksa
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/giris?error=no_code`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Discord OAuth credentials missing in environment variables.");
    return NextResponse.redirect(
      `${baseUrl}/giris?error=missing_credentials&detail=${encodeURIComponent("DISCORD_CLIENT_ID veya DISCORD_CLIENT_SECRET eksik.")}`
    );
  }

  // 1. /login anında Discord'a iletilen birebir redirect_uri'yi belirle
  // Öncelik: state parametresi (ters proxy/alan adı değişimlerine karşı %100 dayanıklı) -> cookie -> dinamik
  const stateRedirectUri = extractRedirectUriFromState(state);
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.split("; ").find((c) => c.startsWith("discord_oauth_redirect_uri="));
  const cookieRedirectUri = cookieMatch ? decodeURIComponent(cookieMatch.split("=")[1]) : null;

  const redirectUri = stateRedirectUri || cookieRedirectUri || `${baseUrl}/api/auth/discord/callback`;

  try {
    // 2. Exchange code for access token (Sadece OAuth2 identify, bot kullanılmaz)
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
      const errText = await tokenRes.text();
      console.error("Discord OAuth Token Exchange Failed:", tokenRes.status, errText);
      let detailMsg = `HTTP ${tokenRes.status}`;
      try {
        const j = JSON.parse(errText);
        detailMsg = j.error_description || j.error || errText;
      } catch {
        detailMsg = errText.slice(0, 120);
      }
      return NextResponse.redirect(
        `${baseUrl}/giris?error=discord_token_failed&detail=${encodeURIComponent(detailMsg)}&uri=${encodeURIComponent(redirectUri)}`
      );
    }

    const tokenData = await tokenRes.json();

    // 3. Fetch Discord User Profile
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Discord /users/@me fetch failed:", userRes.status, errText);
      return NextResponse.redirect(
        `${baseUrl}/giris?error=discord_user_failed&detail=${encodeURIComponent(errText.slice(0, 100))}`
      );
    }

    const discordUser = await userRes.json();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) >> BigInt(22)) % 6}.png`;

    const secret = getJwtSecret();

    // 4. Veritabanından memuru sorgula (olası anlık bağlantı kopmasına karşı yeniden deneme ile)
    let officer = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        officer = await prisma.officer.findUnique({
          where: { discordId: discordUser.id },
        });
        break;
      } catch (dbErr) {
        attempts++;
        if (attempts >= 2) throw dbErr;
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (officer) {
      // Avatar güncellenmişse senkronize et
      if (avatarUrl && officer.profileImage !== avatarUrl) {
        try {
          officer = await prisma.officer.update({
            where: { id: officer.id },
            data: { profileImage: avatarUrl },
          });
        } catch (e) {
          console.warn("Avatar sync error:", e);
        }
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
        return NextResponse.redirect(`${baseUrl}/giris?${params.toString()}`);
      }

      if (officer.status === "REJECTED") {
        return NextResponse.redirect(`${baseUrl}/giris?error=account_rejected`);
      }

      // Onaylı memur hesabı -> doğrudan MDT oturumu aç
      const token = await new SignJWT({
        id: officer.id,
        badge: officer.badge,
        role: officer.role,
        name: officer.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const response = NextResponse.redirect(`${baseUrl}/mdt`);
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: !baseUrl.includes("localhost"),
      });
      response.cookies.delete("discord_reg_token");
      response.cookies.delete("discord_oauth_redirect_uri");
      return response;
    }

    // 5. Kayıtlı değilse -> IC Ad Soyad, Rütbe ve Rozet No doldurma ekranına yönlendir
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
    const response = NextResponse.redirect(`${baseUrl}/giris?${params.toString()}`);
    response.cookies.set({
      name: "discord_reg_token",
      value: regToken,
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
      secure: !baseUrl.includes("localhost"),
    });
    response.cookies.delete("discord_oauth_redirect_uri");
    return response;
  } catch (err: any) {
    console.error("Discord Auth Callback Error:", err);
    const detailMsg = err?.message || String(err);
    return NextResponse.redirect(
      `${baseUrl}/giris?error=server_error&detail=${encodeURIComponent(detailMsg.slice(0, 160))}`
    );
  }
}
