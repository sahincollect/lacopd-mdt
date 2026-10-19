export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
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

    if (name.length > 60 || badge.length > 12 || rank.length > 40 || department.length > 60) {
      return NextResponse.json({ error: "Girilen bilgiler çok uzun." }, { status: 400 });
    }
    if (!/^[0-9A-Za-z-]{1,12}$/.test(badge)) {
      return NextResponse.json({ error: "Rozet numarası yalnızca harf, rakam ve tire içerebilir." }, { status: 400 });
    }

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
