export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
    }

    // Mesai kayıtlarını sıfırla (Bütün TimeLog kayıtlarını sil)
    await prisma.timeLog.deleteMany({});
    
    return NextResponse.json({ success: true, message: 'Tüm mesai süreleri başarıyla sıfırlandı.' });
  } catch (error) {
    return NextResponse.json({ error: 'Mesai sıfırlama işlemi başarısız oldu.' }, { status: 500 });
  }
}
