export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { badge, name, password, rank, department } = await req.json();

    if (!badge || !name || !password) {
      return NextResponse.json({ message: "Rozet no, İsim Soyisim ve Şifre zorunludur." }, { status: 400 });
    }

    const existing = await prisma.officer.findUnique({
      where: { badge: badge.toString().trim() }
    });

    if (existing) {
      if (existing.status === "PENDING") {
        return NextResponse.json({ message: "Bu rozet numarası ile zaten onay bekleyen bir başvuru mevcut!" }, { status: 400 });
      }
      return NextResponse.json({ message: "Bu rozet numarası sisteme zaten kayıtlı!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.officer.create({
      data: {
        badge: badge.toString().trim(),
        name: name.trim(),
        password: hashedPassword,
        rank: rank || "Memur",
        department: department || "Genel Devriye",
        role: "user",
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Hesap başvurunuz başarıyla alındı! Yüksek Komuta onayının ardından rozet numaranız ve şifrenizle giriş yapabilirsiniz." 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ message: error?.message || "Başvuru esnasında sunucu hatası oluştu." }, { status: 500 });
  }
}
