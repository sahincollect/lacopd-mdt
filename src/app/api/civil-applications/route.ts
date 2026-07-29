export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

// GET - Admin only: fetch all civil applications
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Sistem yapılandırma hatası: JWT_SECRET tanımlanmamış.' }, { status: 500 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Yetki gereklidir.' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const applications = await (prisma as any).civilApplication.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json({ error: 'Başvurular getirilirken hata oluştu.' }, { status: 500 });
  }
}

const rateLimitMap = new Map<string, number>();

// POST - Public: submit a civil application (no auth required)
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const lastRequest = rateLimitMap.get(ip);
    
    // 1 dakika (60000 ms) içerisinde 1'den fazla istek atılmasını engelle
    if (ip !== "unknown" && lastRequest && now - lastRequest < 60000) {
      return NextResponse.json({ error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.' }, { status: 429 });
    }
    
    rateLimitMap.set(ip, now);
    if (rateLimitMap.size > 1000) rateLimitMap.clear();

    const body = await req.json();
    const { type, fullName, discordName, email, phone, age, content } = body;

    if (!type || !fullName || !content) {
      return NextResponse.json({ error: 'Lütfen zorunlu alanları doldurun.' }, { status: 400 });
    }

    const validTypes = ['memur', 'ride-along', 'sikayet'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Geçersiz başvuru türü.' }, { status: 400 });
    }

    const application = await (prisma as any).civilApplication.create({
      data: {
        type,
        fullName,
        discordName: discordName || null,
        email: email || null,
        phone: phone || null,
        age: age ? parseInt(age) : null,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        status: 'Bekliyor',
      }
    });

    return NextResponse.json({ success: true, id: application.id }, { status: 201 });
  } catch (error) {
    console.error('Civil application error:', error);
    return NextResponse.json({ error: 'Başvuru gönderilirken hata oluştu.' }, { status: 500 });
  }
}
