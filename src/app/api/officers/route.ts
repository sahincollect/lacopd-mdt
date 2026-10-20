export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { jwtVerify, getJwtSecret, getAuthedOfficer } from '@/lib/session-verify';
import { getOrSetCache, invalidateCache } from '@/lib/api-cache';

export async function GET(req: Request) {
  try {
    const viewer = await getAuthedOfficer(req);
    const isAdmin = viewer?.role === 'admin';
    const cacheKey = isAdmin ? 'officers:admin' : 'officers:public';

    const officers = await getOrSetCache(cacheKey, 15_000, async () => {
      return prisma.officer.findMany({
        where: isAdmin ? undefined : { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          badge: true,
          name: true,
          rank: true,
          department: true,
          isOnDuty: true,
          role: true,
          status: true,
          specialRoles: true,
          profileImage: true
        }
      });
    });

    return NextResponse.json({ officers });
  } catch (error) {
    console.error('Officers fetch error:', error);
    return NextResponse.json({ error: 'Memurlar getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için yönetici yetkisi gereklidir.' }, { status: 403 });
    }
    const body = await req.json();
    const { badge, name, password, rank, department, role } = body;

    if (!badge || !name || !password) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik.' }, { status: 400 });
    }

    const existingOfficer = await prisma.officer.findUnique({
      where: { badge }
    });

    if (existingOfficer) {
      return NextResponse.json({ error: 'Bu sicil numarası zaten kullanılıyor.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const officer = await prisma.officer.create({
      data: {
        badge,
        name,
        password: hashedPassword,
        rank: rank || 'Memur',
        department: department || 'Genel Devriye',
        role: role || 'user',
        specialRoles: body.specialRoles || ""
      }
    });

    invalidateCache('officers');
    invalidateCache('shifts');

    return NextResponse.json({ success: true, officer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Memur eklenirken bir hata oluştu.' }, { status: 500 });
  }
}
