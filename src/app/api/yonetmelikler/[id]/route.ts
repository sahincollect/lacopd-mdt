export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const getUser = async (req: Request) => {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('auth_token=')[1]?.split(';')[0];
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
};

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Sadece yöneticiler silebilir.' }, { status: 403 });

  try {
    await (prisma as any).regulation.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Regulation DELETE error:', err);
    return NextResponse.json({ error: err?.message || 'Silme başarısız.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Sadece yöneticiler düzenleyebilir.' }, { status: 403 });

  try {
    const { title, content } = await req.json();
    const reg = await (prisma as any).regulation.update({
      where: { id: Number(params.id) },
      data: { title, content },
    });
    return NextResponse.json({ success: true, regulation: reg });
  } catch (err: any) {
    console.error('Regulation PUT error:', err);
    return NextResponse.json({ error: err?.message || 'Güncelleme başarısız.' }, { status: 500 });
  }
}
