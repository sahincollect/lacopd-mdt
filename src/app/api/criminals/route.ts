export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify, getJwtSecret } from '@/lib/session-verify';
import { getOrSetCache, invalidateCache } from '@/lib/api-cache';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = getJwtSecret();
    await jwtVerify(token, secret);

    const criminals = await getOrSetCache('criminals:all', 15_000, async () => {
      return prisma.criminalRecord.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          officer: {
            select: { badge: true, name: true }
          }
        }
      });
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

    const secret = getJwtSecret();
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

    invalidateCache('criminals');

    return NextResponse.json({ success: true, criminal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Suçlu kaydı eklenirken hata oluştu.' }, { status: 500 });
  }
}
