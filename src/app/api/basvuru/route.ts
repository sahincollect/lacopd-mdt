export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    const userId = payload.id as number;
    const dbOfficer = await prisma.officer.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    const isAdmin = dbOfficer?.role === 'admin' || payload.role === 'admin';

    const whereClause: any = {
      title: { startsWith: '[APP]' }
    };

    if (!isAdmin) {
      whereClause.officerId = userId;
    }

    // Fetch reports that are actually division applications
    const rawApps = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        officer: {
          select: { badge: true, name: true, rank: true }
        }
      }
    });

    const applications = rawApps.map(app => {
      let data = { division: '', reason: '', experience: '', status: 'Bekliyor' };
      try {
        data = JSON.parse(app.content);
      } catch (e) {}
      
      return {
        id: app.id,
        officer: app.officer,
        createdAt: app.createdAt,
        division: data.division,
        reason: data.reason,
        experience: data.experience,
        status: data.status
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json({ error: 'Başvurular getirilirken hata oluştu.' }, { status: 500 });
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
    const { division, reason, experience } = body;

    if (!division || !reason || !experience) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    const contentData = JSON.stringify({
      division,
      reason,
      experience,
      status: 'Bekliyor'
    });

    await prisma.report.create({
      data: {
        officerId: payload.id as number,
        title: `[APP] ${division}`,
        content: contentData
      }
    });

    return NextResponse.json({ success: true, message: 'Başvurunuz başarıyla yöneticilere iletildi.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Başvuru gönderilirken hata oluştu.' }, { status: 500 });
  }
}
