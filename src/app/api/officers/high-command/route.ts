export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Sadece yüksek rütbeli memurları (admin, Şef, Captain vb.) getir.
    // Şifre gibi hassas verileri kesinlikle seçmiyoruz. (Public Endpoint)
    const highCommand = await prisma.officer.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { rank: { contains: 'Şef' } },
          { rank: { contains: 'Chief' } },
          { rank: { contains: 'Captain' } }
        ]
      },
      select: {
        id: true,
        name: true,
        badge: true,
        rank: true,
        role: true,
        specialRoles: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ officers: highCommand });
  } catch (error) {
    return NextResponse.json({ error: 'Yüksek komuta getirilemedi.' }, { status: 500 });
  }
}
