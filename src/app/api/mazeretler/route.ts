export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });

  const requests = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { officer: { select: { name: true, badge: true, rank: true } } }
  });
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });

  const { badge, fullName, reason, startDate, endDate, dayCount } = await req.json();

  if (!badge || !fullName || !reason || !startDate || !endDate || !dayCount) {
    return NextResponse.json({ message: 'Tüm alanlar zorunludur.' }, { status: 400 });
  }

  const officer = await prisma.officer.findUnique({ where: { id: user.id } });
  if (!officer) return NextResponse.json({ message: 'Memur bulunamadı.' }, { status: 404 });

  const request = await prisma.leaveRequest.create({
    data: {
      officerId: user.id,
      badge,
      fullName,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      dayCount: parseInt(dayCount),
      status: 'Bekliyor'
    }
  });

  return NextResponse.json(request, { status: 201 });
}
