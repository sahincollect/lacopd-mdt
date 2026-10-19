export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Kalıcı Yüksek Komuta Admin hesaplarının güvenceye alınması
    const admins = [
      { badge: '1222', password: 'Sahin!123', name: 'Sahin (#1222)', rank: 'Commander', department: 'High Command', role: 'admin', status: 'APPROVED' }
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
