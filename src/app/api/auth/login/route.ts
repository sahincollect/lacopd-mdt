export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { badge, password, rememberMe, recaptchaToken } = await req.json();

    if (!badge || !password) {
      return NextResponse.json({ message: "Sicil no ve şifre zorunludur." }, { status: 400 });
    }

    const officer = await prisma.officer.findUnique({
      where: { badge },
    });

    if (!officer) {
      return NextResponse.json({ message: "Hatalı sicil no veya şifre." }, { status: 401 });
    }

    if (officer.status === "PENDING") {
      return NextResponse.json({ message: "⏳ HESAP BAŞVURUNUZ İNCELENİYOR. Yüksek Komuta onayı verdikten sonra giriş yapabileceksiniz." }, { status: 403 });
    }

    if (officer.status === "REJECTED") {
      return NextResponse.json({ message: "❌ HESAP BAŞVURUNUZ REDDEDİLDİ. Lütfen Yüksek Komuta yetkilileri ile iletişime geçiniz." }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, officer.password);
    
    // Check CF-Connecting-IP first for Cloudflare proxy
    let ipAddress = req.headers.get("cf-connecting-ip");
    if (!ipAddress) {
      ipAddress = req.headers.get("x-real-ip");
    }
    if (!ipAddress) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      if (forwardedFor) {
        ipAddress = forwardedFor.split(',')[0].trim();
      } else {
        ipAddress = "Bilinmiyor";
      }
    }

    if (!isValidPassword) {
      // Increment failed attempts for logging purposes, but no lockout/captcha
      await prisma.officer.update({
        where: { id: officer.id },
        data: { failedLoginAttempts: { increment: 1 } }
      });

      await prisma.loginLog.create({
        data: { badge, ipAddress, success: false }
      });

      return NextResponse.json({ message: "Hatalı sicil no veya şifre." }, { status: 401 });
    }

    // Reset failed attempts on success
    if (officer.failedLoginAttempts > 0) {
      await prisma.officer.update({
        where: { id: officer.id },
        data: { failedLoginAttempts: 0 }
      });
    }

    await prisma.loginLog.create({
      data: { badge, ipAddress, success: true }
    });

    const secretString = process.env.JWT_SECRET || "cok-gizli-LAC-anahtari-123";
    const secret = new TextEncoder().encode(secretString);
    
    // Set token expiration (internal JWT expiration)
    const token = await new SignJWT({
      id: officer.id,
      badge: officer.badge,
      role: officer.role,
      name: officer.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    // Set cookie
    const response = NextResponse.json({ message: "Giriş başarılı" }, { status: 200 });
    
    const cookieOptions: any = {
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
    }

    response.cookies.set(cookieOptions);

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: error?.message || "Sunucu hatası oluştu." }, { status: 500 });
  }
}
