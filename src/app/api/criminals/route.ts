export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    await jwtVerify(token, secret);

    const criminals = await prisma.criminalRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        officer: {
          select: { badge: true, name: true }
        }
      }
    });
    return NextResponse.json({ criminals });
  } catch (error) {
    return NextResponse.json({ error: 'Suçlu verileri getirilemedi veya yetkisiz erişim.' }, { status: 401 });
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
    
    const body = await req.json();
    const { name, crimes, notes, image } = body;

    if (!name || !crimes) {
      return NextResponse.json({ error: 'İsim ve suç kayıtları zorunludur.' }, { status: 400 });
    }

    const criminal = await prisma.criminalRecord.create({
      data: {
        name,
        crimes,
        notes: notes || '',
        image: image || null,
        officerId: payload.id as number
      }
    });

    return NextResponse.json({ success: true, criminal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Suçlu kaydı eklenirken hata oluştu.' }, { status: 500 });
  }
}
