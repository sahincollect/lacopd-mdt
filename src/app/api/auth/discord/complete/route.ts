export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const regToken = req.cookies.get("discord_reg_token")?.value;
    if (!regToken) {
      return NextResponse.json(
        { error: "Discord oturum süresi doldu. Lütfen tekrar 'Discord ile Giriş Yap' butonuna tıklayın." },
        { status: 401 }
      );
    }

    const secretString = process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";
    const secret = new TextEncoder().encode(secretString);
    const { payload } = await jwtVerify(regToken, secret);

    const discordId = payload.discordId as string;
    const avatarUrl = (payload.avatarUrl as string) || null;

    const body = await req.json();
    const name = (body.name || "").trim();
    const badge = (body.badge || "").trim();
    const rank = (body.rank || "").trim();

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
        redirect: existingByDiscord.status === "APPROVED" ? "/mdt" : undefined,
      });
    }

    // Kurucu Admin (Şahin) henüz Discord hesabını bağlamadıysa, ilk bağlanan kurucu hesabı doğrudan eşleştir
    const unlinkedAdmin = await prisma.officer.findFirst({
      where: {
        role: "admin",
        discordId: null,
      },
    });

    if (unlinkedAdmin) {
      // Rozet çakışması olmaması için güncelle
      const updatedAdmin = await prisma.officer.update({
        where: { id: unlinkedAdmin.id },
        data: {
          discordId,
          name,
          badge,
          rank,
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
    await prisma.officer.create({
      data: {
        discordId,
        name,
        badge,
        rank,
        department: "Genel Devriye",
        role: "user",
        status: "PENDING",
        profileImage: avatarUrl,
      },
    });

    const res = NextResponse.json({
      success: true,
      status: "PENDING",
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
