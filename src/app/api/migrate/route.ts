import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`FileStorage\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`data\` LONGTEXT NOT NULL,
        \`mimeType\` VARCHAR(191) NOT NULL,
        \`fileName\` VARCHAR(191) NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    return new NextResponse('Migration successful. Table created.', { status: 200 });
  } catch (error: any) {
    console.error("Migration Error:", error);
    return new NextResponse(`Migration failed: ${error.message}`, { status: 500 });
  }
}
