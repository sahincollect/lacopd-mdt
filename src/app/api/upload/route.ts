import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Sadece yetkili (giriş yapmış) memurlar dosya yükleyebilir
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    await jwtVerify(token, secret);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Dosyayı veritabanına kaydet
    const savedFile = await prisma.fileStorage.create({
      data: {
        data: base64Data,
        mimeType: file.type || 'application/octet-stream',
        fileName: file.name || 'document',
      }
    });

    // Sunucu tarafında kendi URL'imizi oluştur
    // Dosya adını URL'in sonuna ekliyoruz ki frontend PDF olup olmadığını anlayabilsin
    const fileUrl = `/api/files/${savedFile.id}/${encodeURIComponent(savedFile.fileName)}`;

    return NextResponse.json({ url: fileUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error?.message || 'Bilinmeyen sunucu hatası.' }, { status: 500 });
  }
}
