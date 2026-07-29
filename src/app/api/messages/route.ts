import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

async function getAuthOfficer() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload.id) return null;
    
    return await prisma.officer.findUnique({
      where: { id: payload.id as number },
      select: { id: true, badge: true, name: true, rank: true, role: true }
    });
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const officer = await getAuthOfficer();
    if (!officer) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder'); // 'inbox', 'sent', 'broadcast'
    const type = searchParams.get('type');
    const userId = searchParams.get('userId'); // specific user id for private chat

    if (folder === 'inbox') {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { receiverId: officer.id },
            { receiverId: null }
          ]
        },
        include: { 
          sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } },
          receiver: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      });
      return NextResponse.json({ messages });
    } else if (folder === 'sent') {
      const messages = await prisma.message.findMany({
        where: { senderId: officer.id },
        include: { 
          sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } },
          receiver: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      });
      return NextResponse.json({ messages });
    } else if (folder === 'broadcast') {
      const messages = await prisma.message.findMany({
        where: { receiverId: null },
        include: { 
          sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } },
          receiver: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      });
      return NextResponse.json({ messages });
    } else if (type === 'global') {
      // Get global messages (legacy chat compatibility)
      const messages = await prisma.message.findMany({
        where: { receiverId: null },
        include: { sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } } },
        orderBy: { createdAt: 'asc' },
        take: 100
      });
      return NextResponse.json({ messages });
    } else if (userId) {
      // Get private messages between auth user and userId
      const otherUserId = parseInt(userId);
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: officer.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: officer.id }
          ]
        },
        include: { 
          sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } },
          receiver: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } }
        },
        orderBy: { createdAt: 'asc' },
        take: 100
      });
      return NextResponse.json({ messages });
    } else {
      const lastGlobalView = searchParams.get('lastGlobalView');
      let globalUnread = false;

      if (lastGlobalView) {
        const date = new Date(parseInt(lastGlobalView));
        if (!isNaN(date.getTime())) {
          const gCount = await prisma.message.count({
            where: { receiverId: null, senderId: { not: officer.id }, createdAt: { gt: date } }
          });
          globalUnread = gCount > 0;
        }
      }

      // Return list of users the auth user has chatted with
      const sentMsgs = await prisma.message.findMany({
        where: { senderId: officer.id, receiverId: { not: null } },
        select: { receiverId: true }
      });
      const receivedMsgs = await prisma.message.findMany({
        where: { receiverId: officer.id },
        select: { senderId: true }
      });
      
      const userIds = new Set([
        ...sentMsgs.map(m => m.receiverId as number),
        ...receivedMsgs.map(m => m.senderId)
      ]);
      
      if (userIds.size === 0) return NextResponse.json({ conversations: [], globalUnread });
      
      const conversations = await prisma.officer.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: { id: true, name: true, rank: true, badge: true, profileImage: true }
      });
      
      const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: { senderId: conv.id, receiverId: officer.id, isRead: false }
        });
        return { ...conv, unreadCount };
      }));
      
      return NextResponse.json({ conversations: conversationsWithUnread, globalUnread });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Mesajlar getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const officer = await getAuthOfficer();
    if (!officer) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const body = await req.json();
    const { receiverId, content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    const isBroadcast = receiverId === null || receiverId === 'all' || receiverId === '' || receiverId === undefined;
    if (isBroadcast && officer.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece Yöneticiler (Admin) tüm departmana (Genel Duyuru/Mail) iletisi gönderebilir.' }, { status: 403 });
    }

    const targetReceiverId = isBroadcast ? null : Number(receiverId);

    const message = await prisma.message.create({
      data: {
        senderId: officer.id,
        receiverId: targetReceiverId,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } },
        receiver: { select: { id: true, name: true, rank: true, badge: true, profileImage: true } }
      }
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Mesaj gönderilemedi: ' + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const officer = await getAuthOfficer();
    if (!officer) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const body = await req.json();
    const { senderId, messageId } = body;

    if (messageId) {
      await prisma.message.update({
        where: { id: parseInt(messageId) },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    if (!senderId) {
      return NextResponse.json({ error: 'senderId veya messageId eksik' }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId: parseInt(senderId),
        receiverId: officer.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Okundu bilgisi güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const officer = await getAuthOfficer();
    if (!officer) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');
    const conversationUserId = searchParams.get('conversationUserId');

    if (conversationUserId) {
      const otherId = parseInt(conversationUserId);
      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: officer.id, receiverId: otherId },
            { senderId: otherId, receiverId: officer.id }
          ]
        }
      });
      return NextResponse.json({ success: true });
    }

    if (!messageId) return NextResponse.json({ error: 'Mesaj ID veya Konuşma ID eksik' }, { status: 400 });

    const message = await prisma.message.findUnique({ where: { id: parseInt(messageId) } });
    if (!message) return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });

    // Sadece mesajı atan kişi (veya admin) silebilir
    if (message.senderId !== officer.id && officer.role !== 'admin') {
       return NextResponse.json({ error: 'Bu mesajı silme yetkiniz yok' }, { status: 403 });
    }

    await prisma.message.delete({ where: { id: parseInt(messageId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj silinemedi' }, { status: 500 });
  }
}
