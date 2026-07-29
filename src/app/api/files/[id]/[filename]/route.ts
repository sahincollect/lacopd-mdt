import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string, filename: string } }
) {
  try {
    const { id } = params;

    const file = await prisma.fileStorage.findUnique({
      where: { id }
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Base64 verisini tekrar Buffer'a (Binary) çevir
    const buffer = Buffer.from(file.data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.fileName}"`,
      },
    });
  } catch (error) {
    console.error("File Serve Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
