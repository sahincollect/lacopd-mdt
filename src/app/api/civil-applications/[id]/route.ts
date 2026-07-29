export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

// PATCH - Admin only: update status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Sistem yapılandırma hatası: JWT_SECRET tanımlanmamış.' }, { status: 500 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Yetki gereklidir.' }, { status: 403 });

    const body = await req.json();
    const { status } = body;

    const updated = await (prisma as any).civilApplication.update({
      where: { id: parseInt(params.id) },
      data: { status }
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Durum güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE - Admin only
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Sistem yapılandırma hatası: JWT_SECRET tanımlanmamış.' }, { status: 500 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Yetki gereklidir.' }, { status: 403 });

    await (prisma as any).civilApplication.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Başvuru silinirken hata oluştu.' }, { status: 500 });
  }
}
