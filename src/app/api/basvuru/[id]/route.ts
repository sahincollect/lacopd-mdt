export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    const dbOfficer = await prisma.officer.findUnique({ where: { id: Number(payload.id) }, select: { role: true } });
    if (dbOfficer?.role !== 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const report = await prisma.report.findUnique({ where: { id: Number(params.id) } });
    if (!report) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    let data = { division: '', reason: '', experience: '', status: 'Bekliyor' };
    try {
      data = JSON.parse(report.content);
    } catch (e) {}
    
    data.status = status;

    await prisma.report.update({
      where: { id: Number(params.id) },
      data: { content: JSON.stringify(data) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Durum güncellenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    const dbOfficer = await prisma.officer.findUnique({ where: { id: Number(payload.id) }, select: { role: true } });
    if (dbOfficer?.role !== 'admin' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    await prisma.report.delete({
      where: { id: Number(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silinirken hata oluştu.' }, { status: 500 });
  }
}
