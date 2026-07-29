export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    const id = parseInt(params.id);
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) return NextResponse.json({ error: 'Rapor bulunamadı.' }, { status: 404 });

    if (report.officerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu raporu silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Rapor silinemedi.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    const id = parseInt(params.id);
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) return NextResponse.json({ error: 'Rapor bulunamadı.' }, { status: 404 });

    if (report.officerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu raporu düzenleme yetkiniz yok.' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {
      title: body.title,
      content: body.content
    };
    if (body.evidenceUrl !== undefined) {
      updateData.evidenceUrl = body.evidenceUrl || null;
    }
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    return NextResponse.json({ error: 'Rapor güncellenemedi.' }, { status: 500 });
  }
}
