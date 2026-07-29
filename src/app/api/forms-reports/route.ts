export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
  try {
    const reports = await prisma.report.findMany({
      where: {
        reportCode: {
          not: null
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        officer: {
          select: { id: true, badge: true, name: true, rank: true }
        }
      }
    });

    const formatted = reports.map(r => ({
      id: r.reportCode,
      formId: r.formId,
      officerName: r.officer?.name || "L. COOPER",
      data: r.formData ? JSON.parse(r.formData) : {},
      diagram: r.diagramData ? JSON.parse(r.diagramData) : [],
      timestamp: new Date(r.createdAt).getTime()
    }));

    return NextResponse.json({ reports: formatted });
  } catch (error) {
    console.error("GET /api/forms-reports error:", error);
    return NextResponse.json({ error: 'Raporlar getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    let user: any = null;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
        const { payload } = await jwtVerify(token, secret);
        user = payload;
      } catch (e) {}
    }

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 401 });
    }
    const officerId = Number(user.id);

    const body = await req.json();
    const { id, formId, officerName, data, diagram } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rapor ID zorunludur.' }, { status: 400 });
    }

    const titleStr = `${String(formId || 'CAD').toUpperCase()} - #${id}`;
    const contentStr = `CAD Portal Raporu: ${formId || 'Genel'}\nMemur: ${officerName || 'Bilinmiyor'}\nRapor Kodu: ${id}`;

    // Check if report exists
    const existing = await prisma.report.findUnique({ where: { reportCode: String(id) } });
    if (existing) {
      // Allow update only if owner or admin
      if (existing.officerId !== officerId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Bu raporu düzenleme yetkiniz yok.' }, { status: 403 });
      }
      const report = await prisma.report.update({
        where: { reportCode: String(id) },
        data: {
          formId: String(formId || ''),
          formData: JSON.stringify(data || {}),
          diagramData: JSON.stringify(diagram || []),
          title: titleStr,
          content: contentStr,
        }
      });
      return NextResponse.json({ success: true, report }, { status: 200 });
    } else {
      // Create new
      const report = await prisma.report.create({
        data: {
          reportCode: String(id),
          formId: String(formId || ''),
          formData: JSON.stringify(data || {}),
          diagramData: JSON.stringify(diagram || []),
          title: titleStr,
          content: contentStr,
          officerId: officerId
        }
      });
      return NextResponse.json({ success: true, report }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/forms-reports error:", error);
    return NextResponse.json({ error: 'Rapor kaydedilirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    let user: any = null;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
        const { payload } = await jwtVerify(token, secret);
        user = payload;
      } catch (e) {}
    }

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 401 });
    }
    const officerId = Number(user.id);

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID eksik.' }, { status: 400 });

    const existing = await prisma.report.findUnique({ where: { reportCode: String(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Rapor bulunamadı.' }, { status: 404 });
    }

    if (existing.officerId !== officerId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Bu raporu silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.report.delete({
      where: { reportCode: String(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/forms-reports error:", error);
    return NextResponse.json({ error: 'Rapor silinemedi.' }, { status: 500 });
  }
}
