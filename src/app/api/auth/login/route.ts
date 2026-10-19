export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

// Şifreyle giriş kalıcı olarak kapatıldı. Kimlik doğrulama yalnızca Discord OAuth2 ile yapılır.
// (Kaba kuvvet, sabit şifre ve hash sızıntısı risklerini ortadan kaldırmak için.)
export async function POST() {
  return NextResponse.json(
    { message: "Şifreyle giriş devre dışı. Lütfen Discord ile giriş yapın." },
    { status: 410 }
  );
}
