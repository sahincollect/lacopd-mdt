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

export async function GET() {
  try {
    const regulations = await (prisma as any).regulation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ regulations });
  } catch (err: any) {
    console.error('Regulation GET error:', err);
    return NextResponse.json({ error: err?.message || 'Yönetmelikler getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Sadece yöneticiler ekleyebilir.' }, { status: 403 });

  try {
    const { title, content } = await req.json();
    if (!title || !content) return NextResponse.json({ error: 'Başlık ve açıklama zorunludur.' }, { status: 400 });

    const reg = await (prisma as any).regulation.create({
      data: { title, content, authorId: Number(user.id) },
    });
    return NextResponse.json({ success: true, regulation: reg }, { status: 201 });
  } catch (err: any) {
    console.error('Regulation POST error:', err);
    return NextResponse.json({ error: err?.message || 'Eklenirken hata oluştu.' }, { status: 500 });
  }
}
