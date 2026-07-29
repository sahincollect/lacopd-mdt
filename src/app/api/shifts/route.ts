export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const officers = await prisma.officer.findMany({
      include: {
        TimeLogs: true
      }
    });

    const leaderboard = officers.map(officer => {
      let totalSeconds = 0;
      let activeLogStart: Date | null = null;

      officer.TimeLogs.forEach(log => {
        if (log.endTime) {
          totalSeconds += Math.floor(
            (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000
          );
        } else {
          // Active shift — count up to now
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

    // Sort by totalSeconds descending
    leaderboard.sort((a, b) => b.totalSeconds - a.totalSeconds);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Shifts GET error:', error);
    return NextResponse.json({ error: 'Mesai verileri getirilemedi.' }, { status: 500 });
  }
}
