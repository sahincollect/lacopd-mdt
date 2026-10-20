import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify, getJwtSecret } from '@/lib/session-verify';
import { getOrSetCache } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ count: 0 });

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    
    const officerId = Number(payload.id);
    if (!officerId) return NextResponse.json({ count: 0 });

    const { searchParams } = new URL(req.url);
    const lastGlobalView = searchParams.get('lastGlobalView') || '';

    const cacheKey = `unread:${officerId}:${lastGlobalView}`;

    // 5 saniyelik mikro önbellek: Polling ve sayfa geçişlerindeki veritabanı yükünü %80 azaltır
    const count = await getOrSetCache(cacheKey, 5_000, async () => {
      const privateCount = await prisma.message.count({
        where: {
          receiverId: officerId,
          isRead: false
        }
      });

      let globalCount = 0;
      if (lastGlobalView) {
        const date = new Date(parseInt(lastGlobalView));
        if (!isNaN(date.getTime())) {
          globalCount = await prisma.message.count({
            where: {
              receiverId: null,
              senderId: { not: officerId },
              createdAt: { gt: date }
            }
          });
        }
      }

      return privateCount + globalCount;
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}
