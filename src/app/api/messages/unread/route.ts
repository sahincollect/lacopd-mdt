import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ count: 0 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload.id) return NextResponse.json({ count: 0 });
    
    const officer = await prisma.officer.findUnique({ where: { id: payload.id as number } });
    if (!officer) return NextResponse.json({ count: 0 });

    const { searchParams } = new URL(req.url);
    const lastGlobalView = searchParams.get('lastGlobalView');

    const privateCount = await prisma.message.count({
      where: {
        receiverId: officer.id,
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
            senderId: { not: officer.id },
            createdAt: { gt: date }
          }
        });
      }
    }

    return NextResponse.json({ count: privateCount + globalCount });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}
