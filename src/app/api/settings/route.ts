import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthedOfficer } from '@/lib/session-verify';

// Sistem ayarlari yalnizca giris yapmis Yuksek Komuta (admin) tarafindan okunup yazilabilir.
async function requireAdmin(req: Request) {
  const me = await getAuthedOfficer(req);
  if (!me) return NextResponse.json({ success: false, error: 'Yetkisiz erisim.' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ success: false, error: 'Yonetici yetkisi gereklidir.' }, { status: 403 });
  return null;
}

// Yalnizca bilinen anahtarlar yazilabilir (rastgele anahtar/deger enjeksiyonunu engeller).
const ALLOWED_KEY = /^[a-zA-Z0-9_.-]{1,64}$/;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const key = req.nextUrl.searchParams.get('key');
    if (key) {
      const setting = await prisma.systemSetting.findUnique({ where: { key } });
      return NextResponse.json({ success: true, data: setting ? setting.value : null });
    }
    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const { key, value } = await req.json();
    if (!key || typeof key !== 'string' || !ALLOWED_KEY.test(key)) {
      return NextResponse.json({ success: false, error: 'Gecersiz anahtar.' }, { status: 400 });
    }
    if (typeof value !== 'string' || value.length > 200000) {
      return NextResponse.json({ success: false, error: 'Gecersiz deger.' }, { status: 400 });
    }
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
