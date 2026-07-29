export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });

  const { status } = await req.json();
  const updated = await prisma.leaveRequest.update({
    where: { id: parseInt(params.id) },
    data: { status }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });

  await prisma.leaveRequest.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ message: 'Silindi' });
}
