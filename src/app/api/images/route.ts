export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const images = await prisma.siteImage.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: 'Resimler getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
    }

    const body = await req.json();
    const { url, type } = body;

    if (!url || !type) {
      return NextResponse.json({ error: 'Lütfen resim URL\'si ve türünü (GALERI/GIRIS) belirtin.' }, { status: 400 });
    }

    const newImage = await prisma.siteImage.create({
      data: { url, type }
    });
    
    return NextResponse.json({ success: true, image: newImage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Resim eklenemedi.' }, { status: 500 });
  }
}
