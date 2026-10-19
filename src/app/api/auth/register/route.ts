export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

// Şifreli kayıt kapatıldı. Kayıt yalnızca Discord doğrulaması + Yüksek Komuta onayı ile yapılır.
export async function POST() {
  return NextResponse.json(
    { message: "Şifreyle kayıt devre dışı. Lütfen Discord ile giriş yapın." },
    { status: 410 }
  );
}
