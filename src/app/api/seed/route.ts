import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// One-time seed endpoint — will be removed after use
export async function GET(req: Request) {
  // Simple security: require a secret key in the query
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  if (key !== 'laco-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const badge = '02200';
    const password = 'Sahin!123';

    const existing = await prisma.officer.findUnique({ where: { badge } });

    if (existing) {
      // Update role and reset password just in case
      const hashed = await bcrypt.hash(password, 12);
      await prisma.officer.update({
        where: { badge },
        data: { role: 'admin', status: 'APPROVED', password: hashed }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Mevcut hesap güncellendi → role: admin, şifre sıfırlandı',
        badge,
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const officer = await prisma.officer.create({
      data: {
        badge,
        password: hashed,
        name: 'Şahin',
        rank: 'Komiser',
        department: 'Yönetim',
        role: 'admin',
        status: 'APPROVED',
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin hesabı oluşturuldu',
      badge: officer.badge,
      name: officer.name,
      role: officer.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
