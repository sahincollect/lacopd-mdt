import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const botToken = process.env.DISCORD_BOT_TOKEN;

    // Sadece bot token'ına sahip olanlar (yani bizim Discord botumuz) bu uç noktaya istek atabilir.
    if (!authHeader) {
      console.error('Bot mesai API: Authorization header eksik.');
      return NextResponse.json({ error: 'Yetkisiz erişim (Header eksik)' }, { status: 401 });
    }

    const providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (providedToken !== botToken) {
      console.error(`Bot mesai API: Token uyumsuzluğu. Gelen: ${providedToken.substring(0, 5)}... Beklenen: ${botToken?.substring(0, 5)}...`);
      return NextResponse.json({ error: 'Yetkisiz erişim (Geçersiz token)' }, { status: 401 });
    }

    const body = await req.json();
    const { discordId } = body;

    if (!discordId) {
      return NextResponse.json({ error: 'discordId parametresi zorunludur' }, { status: 400 });
    }

    // Kullanıcıyı discordId'si ile veritabanında bul
    const officer = await prisma.officer.findUnique({
      where: { discordId }
    });

    if (!officer) {
      return NextResponse.json({ error: 'Bu Discord hesabına bağlı bir MDT personeli bulunamadı.' }, { status: 404 });
    }

    // Mesai durumunu tersine çevir (toggle)
    const newStatus = !officer.isOnDuty;

    await prisma.officer.update({
      where: { id: officer.id },
      data: { isOnDuty: newStatus }
    });

    // Mesai loglarını güncelle
    if (newStatus) {
      // Mesaiye giriş
      const existingLog = await prisma.timeLog.findFirst({ where: { officerId: officer.id, endTime: null } });
      if (!existingLog) {
        await prisma.timeLog.create({ data: { officerId: officer.id } });
      }
    } else {
      // Mesaiden çıkış
      await prisma.timeLog.updateMany({
        where: { officerId: officer.id, endTime: null },
        data: { endTime: new Date() }
      });
    }

    return NextResponse.json({ 
      success: true, 
      isOnDuty: newStatus,
      officer: { badge: officer.badge, name: officer.name, rank: officer.rank } 
    });

  } catch (error: any) {
    console.error('Bot mesai API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}
