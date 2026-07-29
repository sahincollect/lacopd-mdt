export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    await jwtVerify(token, secret);

    const reports = await prisma.report.findMany({
      where: {
        NOT: {
          title: {
            startsWith: '[APP]'
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        officer: {
          select: { id: true, badge: true, name: true, rank: true }
        }
      }
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Raporlar getirilemedi veya yetkisiz erişim.' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    const body = await req.json();
    const { title, content, evidenceUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik zorunludur.' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        title,
        content,
        evidenceUrl: evidenceUrl || null,
        officerId: payload.id as number
      }
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Rapor eklenirken hata oluştu.' }, { status: 500 });
  }
}
