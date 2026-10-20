export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthedOfficer } from '@/lib/session-verify';
import { getOrSetCache } from '@/lib/api-cache';

export async function GET(req: Request) {
  const me = await getAuthedOfficer(req);
  if (!me) return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
  try {
    const officers = await getOrSetCache('officers:high-command', 30_000, async () => {
      return prisma.officer.findMany({
        where: {
          OR: [
            { role: 'admin' },
            { rank: { contains: 'Şef' } },
            { rank: { contains: 'Chief' } },
            { rank: { contains: 'Captain' } }
          ]
        },
        select: {
          id: true,
          name: true,
          badge: true,
          rank: true,
          role: true,
          specialRoles: true
        },
        orderBy: { createdAt: 'desc' }
      });
    });
    
    return NextResponse.json({ officers });
  } catch (error) {
    return NextResponse.json({ error: 'Yüksek komuta getirilemedi.' }, { status: 500 });
  }
}
