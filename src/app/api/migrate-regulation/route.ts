export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Regulation tablosunu oluştur (eğer yoksa)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`Regulation\` (
        \`id\`        INT          NOT NULL AUTO_INCREMENT,
        \`title\`     VARCHAR(191) NOT NULL,
        \`content\`   LONGTEXT     NOT NULL,
        \`authorId\`  INT          NOT NULL,
        \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    return NextResponse.json({ success: true, message: 'Regulation tablosu başarıyla oluşturuldu veya zaten mevcut.' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
