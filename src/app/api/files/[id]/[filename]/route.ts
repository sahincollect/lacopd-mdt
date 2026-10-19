import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthedOfficer } from '@/lib/session-verify';

export const dynamic = 'force-dynamic';

const SAFE_INLINE = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']);

export async function GET(
  req: Request,
  { params }: { params: { id: string; filename: string } }
) {
  try {
    // Dosyalar (delil/gorsel) yalnizca giris yapmis memurlara sunulur.
    const me = await getAuthedOfficer(req);
    if (!me) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = params;
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) return new NextResponse('File not found', { status: 404 });

    const file = await prisma.fileStorage.findUnique({ where: { id } });
    if (!file) return new NextResponse('File not found', { status: 404 });

    const buffer = Buffer.from(file.data, 'base64');
    const safeName = (file.fileName || 'document').replace(/[^\w.\- ()]/g, '_');
    const inline = SAFE_INLINE.has(file.mimeType);

    return new NextResponse(buffer, {
      headers: {
        // Guvenli olmayan turler asla tarayicida calistirilmaz (XSS onlemi).
        'Content-Type': inline ? file.mimeType : 'application/octet-stream',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${safeName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': file.mimeType === 'application/pdf' ? "default-src 'none'" : "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('File Serve Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
