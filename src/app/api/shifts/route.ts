export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthedOfficer } from '@/lib/session-verify';
import { getOrSetCache } from '@/lib/api-cache';

export async function GET(req: Request) {
  const me = await getAuthedOfficer(req);
  if (!me) return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
  try {
    const leaderboard = await getOrSetCache('shifts:leaderboard', 10_000, async () => {
      const officers = await prisma.officer.findMany({
        where: { status: 'APPROVED' },
        select: {
          id: true,
          badge: true,
          name: true,
          rank: true,
          department: true,
          isOnDuty: true,
          TimeLogs: {
            select: {
              startTime: true,
              endTime: true
            }
          }
        }
      });

      const lb = officers.map(officer => {
        let totalSeconds = 0;
        let activeLogStart: Date | null = null;

        officer.TimeLogs.forEach(log => {
          if (log.endTime) {
            totalSeconds += Math.floor(
              (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000
            );
          } else {
            totalSeconds += Math.floor(
              (new Date().getTime() - new Date(log.startTime).getTime()) / 1000
            );
            activeLogStart = log.startTime;
          }
        });

        return {
          id: officer.id,
          badge: officer.badge,
          name: officer.name,
          rank: officer.rank,
          department: officer.department,
          isOnDuty: officer.isOnDuty,
          totalSeconds,
          activeLogStart,
        };
      });

      lb.sort((a, b) => b.totalSeconds - a.totalSeconds);
      return lb;
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Shifts GET error:', error);
    return NextResponse.json({ error: 'Mesai verileri getirilemedi.' }, { status: 500 });
  }
}
