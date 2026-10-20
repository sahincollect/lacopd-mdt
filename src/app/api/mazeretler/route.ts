export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify, getJwtSecret } from '@/lib/session-verify';
import { getOrSetCache, invalidateCache } from '@/lib/api-cache';

async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });

  const requests = await getOrSetCache('leaves:all', 15_000, async () => {
    return prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { officer: { select: { name: true, badge: true, rank: true } } }
    });
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

  const request = await prisma.leaveRequest.create({
    data: {
      officerId: Number(user.id),
      badge,
      fullName,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      dayCount: parseInt(dayCount),
      status: 'Bekliyor'
    }
  });

  invalidateCache('leaves');

  return NextResponse.json(request, { status: 201 });
}
