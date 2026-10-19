export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || 'Bilinmeyen IP');
    const ua = req.headers.get('user-agent') || 'Bilinmeyen Cihaz';

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const targetPath = body?.path || '/admin';
    const screenInfo = body?.screen ? ` [${body.screen}]` : '';
    const shortUa = ua.length > 140 ? ua.slice(0, 140) + '...' : ua;

    // LoginLog tablosuna HONEYPOT kaydı olarak işle
    await prisma.loginLog.create({
      data: {
        badge: `HONEYPOT:${targetPath}${screenInfo} | ${shortUa}`,
        ipAddress: ip,
        success: false,
      },
    });

    const totalFans = await prisma.loginLog.count({
      where: {
        badge: {
          startsWith: 'HONEYPOT:',
        },
      },
    });

    return NextResponse.json({
      ip,
      userAgent: ua,
      fanNumber: totalFans,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      ip: 'Kaydedildi',
      userAgent: req.headers.get('user-agent') || 'Tespit Edildi',
      fanNumber: 1,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jwtVerify(token, secret);

    const requester = await prisma.officer.findUnique({ where: { id: payload.id as number } });
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json({ error: 'Yönetici yetkisi gereklidir.' }, { status: 403 });
    }

    const logs = await prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 250,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Loglar getirilemedi.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jwtVerify(token, secret);

    const requester = await prisma.officer.findUnique({ where: { id: payload.id as number } });
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json({ error: 'Yönetici yetkisi gereklidir.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    if (mode === 'honeypot') {
      await prisma.loginLog.deleteMany({
        where: { badge: { startsWith: 'HONEYPOT:' } },
      });
    } else {
      await prisma.loginLog.deleteMany({});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Loglar temizlenemedi.' }, { status: 500 });
  }
}
