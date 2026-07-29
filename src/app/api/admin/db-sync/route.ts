export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // MySQL sorgusu ile 'type' ve 'status' sütunlarını eklemeyi dener.
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Announcement ADD COLUMN type VARCHAR(191) NOT NULL DEFAULT 'Normal';`);
    } catch (e) {}
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Officer ADD COLUMN status VARCHAR(191) NOT NULL DEFAULT 'APPROVED';`);
    } catch (e) {}
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Officer ADD COLUMN specialRoles TEXT NULL;`);
    } catch (e) {}

    // Kalıcı Yüksek Komuta Admin hesaplarının güvenceye alınması
    const admins = [
      { badge: '1222', password: 'Sahin!123', name: 'Sahin (#1222)', rank: 'Commander', department: 'High Command', role: 'admin', status: 'APPROVED' },
      { badge: '101',  password: 'Murat131',  name: 'Murat (#101)',  rank: 'Chief of Police', department: 'High Command', role: 'admin', status: 'APPROVED' },
      { badge: '261',  password: 'Berke61',   name: 'Berke (#261)',  rank: 'Captain I', department: 'High Command', role: 'admin', status: 'APPROVED' }
    ];

    for (const adm of admins) {
      const hashedPassword = await bcrypt.hash(adm.password, 10);
      await prisma.officer.upsert({
        where: { badge: adm.badge },
        update: { role: 'admin', status: 'APPROVED' },
        create: {
          badge: adm.badge,
          password: hashedPassword,
          name: adm.name,
          rank: adm.rank,
          department: adm.department,
          role: adm.role,
          status: adm.status
        }
      });
    }
    
    return NextResponse.json({ success: true, message: "Veritabanı başarıyla senkronize edildi ve Yüksek Komuta hesapları güvence altına alındı." });
  } catch (error: any) {
    if (error.message && error.message.includes("Duplicate column name")) {
      return NextResponse.json({ success: true, message: "Veritabanı zaten güncel ('type' sütunu mevcut)." });
    }
    return NextResponse.json({ success: false, error: error.message || String(error) });
  }
}
