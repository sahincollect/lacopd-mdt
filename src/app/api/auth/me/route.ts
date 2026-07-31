export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Sistem yapılandırma hatası: JWT_SECRET tanımlanmamış." }, { status: 500 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const officer = await prisma.officer.findUnique({
      where: { id: payload.id as number },
      select: { id: true, badge: true, name: true, rank: true, department: true, role: true, isOnDuty: true, specialRoles: true, discordRoles: true, profileImage: true, createdAt: true }
    });

    if (!officer) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ user: officer }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Geçersiz token." }, { status: 401 });
  }
}
