import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthedOfficer } from '@/lib/session-verify';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel govde siniri ile uyumlu)

// Yalnizca guvenli dosya turleri kabul edilir; her tur icin dosya imzasi (magic bytes) dogrulanir.
const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  'image/png': (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/gif': (b) => b.length > 6 && (b.subarray(0, 6).toString('ascii') === 'GIF87a' || b.subarray(0, 6).toString('ascii') === 'GIF89a'),
  'image/webp': (b) => b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  'application/pdf': (b) => b.length > 5 && b.subarray(0, 5).toString('ascii') === '%PDF-',
};

function sanitizeFileName(name: string): string {
  const cleaned = (name || 'document').replace(/[^\w.\- ()]/g, '_').slice(0, 100);
  return cleaned || 'document';
}

export async function POST(req: Request) {
  try {
    // Sadece yetkili (giris yapmis ve onayli) memurlar dosya yukleyebilir
    const me = await getAuthedOfficer(req);
    if (!me) return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Dosya bulunamadi.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Dosya en fazla 4 MB olabilir.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Tarayicinin bildirdigi turu degil, gercek icerigi (imza) esas al.
    const detected = Object.keys(SIGNATURES).find((mime) => SIGNATURES[mime](buffer));
    if (!detected) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya turu. Yalnizca PNG, JPEG, GIF, WEBP ve PDF yuklenebilir.' },
        { status: 415 }
      );
    }

    const savedFile = await prisma.fileStorage.create({
      data: {
        data: buffer.toString('base64'),
        mimeType: detected,
        fileName: sanitizeFileName(file.name),
      },
    });

    const fileUrl = `/api/files/${savedFile.id}/${encodeURIComponent(savedFile.fileName)}`;
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Dosya yuklenemedi.' }, { status: 500 });
  }
}
