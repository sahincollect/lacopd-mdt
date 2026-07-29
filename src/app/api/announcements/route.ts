export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { badge: true, name: true, rank: true }
        }
      }
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: 'Duyurular getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check Auth Token
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Duyuru yayınlama yetkiniz yok.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik zorunludur.' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || "Normal",
        authorId: parseInt(payload.id as string)
      }
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error: any) {
    console.error("Duyuru Ekleme Hatası:", error);
    return NextResponse.json({ error: 'Duyuru yayınlanırken hata oluştu: ' + (error.message || String(error)) }, { status: 500 });
  }
}
