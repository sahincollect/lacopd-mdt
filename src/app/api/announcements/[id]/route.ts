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

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok.' }, { status: 403 });
    }

    const id = parseInt(params.id);
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Duyuru silinemedi.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok.' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const body = await req.json();

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        ...(body.type && { type: body.type })
      }
    });
    
    return NextResponse.json({ success: true, announcement: updatedAnnouncement });
  } catch (error) {
    return NextResponse.json({ error: 'Duyuru güncellenemedi.' }, { status: 500 });
  }
}
