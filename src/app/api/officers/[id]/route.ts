export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { jwtVerify } from 'jose';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    await jwtVerify(token, secret);

    const id = parseInt(params.id);
    const officer = await prisma.officer.findUnique({ where: { id } });
    if (!officer) return NextResponse.json({ error: 'Memur bulunamadı.' }, { status: 404 });
    return NextResponse.json({ officer });
  } catch {
    return NextResponse.json({ error: 'Memur getirilemedi veya yetkisiz erişim.' }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);

    const requester = await prisma.officer.findUnique({ where: { id: payload.id as number } });
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için yönetici yetkisi gereklidir.' }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Geçersiz ID.' }, { status: 400 });

    await prisma.timeLog.deleteMany({ where: { officerId: id } });
    await prisma.report.deleteMany({ where: { officerId: id } });
    await prisma.leaveRequest.deleteMany({ where: { officerId: id } });
    await prisma.announcement.deleteMany({ where: { authorId: id } });
    await prisma.criminalRecord.deleteMany({ where: { officerId: id } });

    await prisma.officer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Officer delete error:', error);
    return NextResponse.json({ error: 'Memur silinemedi veya yetkisiz erişim.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('cookie');
    const token = authHeader?.split('auth_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    
    const requesterId = payload.id as number;
    const requester = await prisma.officer.findUnique({ where: { id: requesterId } });
    if (!requester) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    const requesterRole = requester.role;

    const targetId = parseInt(params.id);

    if (isNaN(targetId)) return NextResponse.json({ error: 'Geçersiz ID.' }, { status: 400 });

    const body = await req.json();

    // IDOR Protection: Yalnızca adminler başkasının profilini güncelleyebilir veya rol/rütbe/departman değiştirebilir
    if (requesterId !== targetId && requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Başka bir kullanıcının bilgilerini güncelleyemezsiniz.' }, { status: 403 });
    }

    if (requesterRole !== 'admin' && (body.role || body.rank || body.department || body.badge || body.specialRoles !== undefined)) {
      return NextResponse.json({ error: 'Rol, rütbe, departman, özel rol veya yaka numarası değiştirme yetkiniz yok.' }, { status: 403 });
    }

    // Mesai toggle mantığı
    if (typeof body.isOnDuty === 'boolean') {
      const officer = await prisma.officer.findUnique({ where: { id: targetId } });
      if (officer) {
        if (body.isOnDuty && !officer.isOnDuty) {
          const existingLog = await prisma.timeLog.findFirst({ where: { officerId: targetId, endTime: null } });
          if (!existingLog) await prisma.timeLog.create({ data: { officerId: targetId } });
        } else if (!body.isOnDuty && officer.isOnDuty) {
          await prisma.timeLog.updateMany({ where: { officerId: targetId, endTime: null }, data: { endTime: new Date() } });
        }
      }
    }

    // Güncellenecek alanları hazırla
    const updateData: any = {};
    if (body.badge      !== undefined) updateData.badge      = body.badge;
    if (body.name       !== undefined) updateData.name       = body.name;
    if (body.rank       !== undefined) updateData.rank       = body.rank;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.role       !== undefined) updateData.role       = body.role;
    if (body.isOnDuty   !== undefined) updateData.isOnDuty   = body.isOnDuty;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    if (body.status     !== undefined && requesterRole === 'admin') updateData.status = body.status;
    if (body.specialRoles !== undefined && requesterRole === 'admin') updateData.specialRoles = body.specialRoles;

    // Şifre yalnızca doluysa hash'le ve güncelle
    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const updatedOfficer = await prisma.officer.update({ where: { id: targetId }, data: updateData });
    return NextResponse.json({ success: true, officer: updatedOfficer });
  } catch (error: any) {
    console.error('Officer PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Memur güncellenemedi.' }, { status: 500 });
  }
}
