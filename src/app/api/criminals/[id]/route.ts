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
    const criminal = await prisma.criminalRecord.findUnique({ where: { id } });

    if (!criminal) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });

    if (criminal.officerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu kaydı silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.criminalRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt silinemedi.' }, { status: 500 });
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
    const criminal = await prisma.criminalRecord.findUnique({ where: { id } });

    if (!criminal) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });

    if (criminal.officerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Bu kaydı düzenleme yetkiniz yok.' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {
      name: body.name,
      crimes: body.crimes,
      notes: body.notes
    };
    if (body.image !== undefined) {
      updateData.image = body.image || null;
    }

    const updatedCriminal = await prisma.criminalRecord.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, criminal: updatedCriminal });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt güncellenemedi.' }, { status: 500 });
  }
}
