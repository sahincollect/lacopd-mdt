export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";
import { getJwtSecret } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  try {
    const regToken = req.cookies.get("discord_reg_token")?.value;
    if (!regToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(regToken, secret);

    return NextResponse.json({
      authenticated: true,
      discordId: payload.discordId,
      discordUsername: payload.discordUsername,
      globalName: payload.globalName || payload.discordUsername,
      avatarUrl: payload.avatarUrl,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const regToken = req.cookies.get("discord_reg_token")?.value;
    if (!regToken) {
      return NextResponse.json(
        { error: "Discord oturum süresi doldu. Lütfen tekrar 'Discord ile Giriş Yap' butonuna tıklayın." },
        { status: 401 }
      );
    }

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(regToken, secret);

    const discordId = payload.discordId as string;
    const avatarUrl = (payload.avatarUrl as string) || null;

    const body = await req.json();
    const name = (body.name || "").trim();
    const badge = (body.badge || "").trim();
    const rank = (body.rank || "").trim();
    const department = (body.department || "Patrol Division").trim();

    if (!name || !badge || !rank) {
      return NextResponse.json(
        { error: "IC Ad Soyad, Rozet Numarası ve Rütbe alanlarının tamamı zorunludur." },
        { status: 400 }
      );
    }

    // Zaten bu discordId ile kayıt varsa kontrol et
    const existingByDiscord = await prisma.officer.findUnique({
      where: { discordId },
    });
    if (existingByDiscord) {
      return NextResponse.json({
        status: existingByDiscord.status,
        officer: {
          name: existingByDiscord.name,
          badge: existingByDiscord.badge,
          rank: existingByDiscord.rank,
        },
        redirect: existingByDiscord.status === "APPROVED" ? "/mdt" : undefined,
      });
    }

    // Kurucu Admin henüz Discord hesabını bağlamadıysa, ilk bağlanan kurucu hesabı doğrudan eşleştir
    const unlinkedAdmin = await prisma.officer.findFirst({
      where: {
        role: "admin",
        discordId: null,
      },
    });

    if (unlinkedAdmin) {
      const updatedAdmin = await prisma.officer.update({
        where: { id: unlinkedAdmin.id },
        data: {
          discordId,
          name,
          badge,
          rank,
          department: department || unlinkedAdmin.department,
          profileImage: avatarUrl,
          role: "admin",
          status: "APPROVED",
        },
      });

      const authToken = await new SignJWT({
        id: updatedAdmin.id,
        badge: updatedAdmin.badge,
        role: updatedAdmin.role,
        name: updatedAdmin.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("30d")
        .sign(secret);

      const res = NextResponse.json({
        success: true,
        status: "APPROVED",
        redirect: "/mdt",
      });
      res.cookies.set({
        name: "auth_token",
        value: authToken,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.cookies.delete("discord_reg_token");
      return res;
    }

    // Rozet numarası başka bir memurda var mı kontrol et
    const existingBadge = await prisma.officer.findUnique({
      where: { badge },
    });
    if (existingBadge) {
      return NextResponse.json(
        { error: "Bu rozet numarası sistemde zaten kayıtlı veya onay bekliyor." },
        { status: 400 }
      );
    }

    // Standart memur kaydı -> Admin onayı bekler (PENDING)
    const createdOfficer = await prisma.officer.create({
      data: {
        discordId,
        name,
        badge,
        rank,
        department,
        role: "user",
        status: "PENDING",
        profileImage: avatarUrl,
      },
    });

    const res = NextResponse.json({
      success: true,
      status: "PENDING",
      officer: {
        name: createdOfficer.name,
        badge: createdOfficer.badge,
        rank: createdOfficer.rank,
      },
    });
    res.cookies.delete("discord_reg_token");
    return res;
  } catch (error: any) {
    console.error("Discord complete registration error:", error);
    return NextResponse.json(
      { error: "Kayıt tamamlanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
