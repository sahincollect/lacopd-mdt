import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "tactical_plans_v1";

const DEFAULT_PLANS = [
  {
    id: "OP-2026-101",
    title: "Eclipse Bulvarı Yüksek Riskli Baskın Planı",
    location: "Eclipse Blvd No: 402 — Batı Vinewood",
    riskLevel: "KRİTİK",
    status: "PLANLANIYOR",
    commander: "Yüksek Komuta",
    mapType: "BUILDING",
    customMapUrl: "",
    summary:
      "Silahlı soygun şüphelilerinin barikat kurduğu iki katlı mülke yönelik çevre emniyeti, hava gözlemi ve SWAT giriş koordinasyonu.",
    createdAt: new Date().toISOString(),
    markers: [
      {
        id: "m-1",
        category: "UNIT",
        type: "SWAT",
        label: "SWAT-1 (Giriş)",
        sublabel: "Ön Kapı Koçbaşı",
        x: 42,
        y: 68,
      },
      {
        id: "m-2",
        category: "UNIT",
        type: "PATROL",
        label: "1-ADAM-12",
        sublabel: "Güney Çemberi",
        x: 25,
        y: 82,
      },
      {
        id: "m-3",
        category: "UNIT",
        type: "PATROL",
        label: "2-ADAM-19",
        sublabel: "Kuzey Çemberi",
        x: 76,
        y: 22,
      },
      {
        id: "m-4",
        category: "UNIT",
        type: "SNIPER",
        label: "GÖZLEM-1",
        sublabel: "Karşı Çatı",
        x: 18,
        y: 30,
      },
      {
        id: "m-5",
        category: "UNIT",
        type: "AIR",
        label: "AIR-1",
        sublabel: "Termal Kamera",
        x: 82,
        y: 65,
      },
      {
        id: "m-6",
        category: "SUSPECT",
        type: "ARMED_SUSPECT",
        label: "Şüpheli #1 (Silahlı)",
        sublabel: "Üst Kat Koridor",
        x: 50,
        y: 44,
      },
      {
        id: "m-7",
        category: "SUSPECT",
        type: "HOSTAGE",
        label: "Rehine (1 Sivil)",
        sublabel: "Arka Oda",
        x: 58,
        y: 36,
      },
      {
        id: "m-8",
        category: "DIRECTIVE_PIN",
        type: "BREACH",
        label: "Giriş Noktası A",
        sublabel: "Ana Kapı + Flashbang",
        x: 48,
        y: 58,
      },
    ],
    directives: [
      {
        id: "dir-1",
        phase: "AŞAMA 1",
        priority: "YÜKSEK",
        assignedTo: "1-ADAM-12 & 2-ADAM-19",
        text: "Eclipse Bulvarı kuzey ve güney kavşakları sivil trafiğe kapatılarak dış güvenlik çemberi oluşturulacak.",
        completed: true,
      },
      {
        id: "dir-2",
        priority: "KRİTİK",
        phase: "AŞAMA 2",
        assignedTo: "AIR-1 & GÖZLEM-1",
        text: "Çatı ve arka bahçe kaçış koridorları termal görüş ile sabitlenecek, içerideki şüpheli hareketliliği telsizden aktarılacak.",
        completed: false,
      },
      {
        id: "dir-3",
        priority: "KRİTİK",
        phase: "AŞAMA 3",
        assignedTo: "SWAT-1",
        text: "Müzakere sonuçsuz kalırsa Giriş Noktası A üzerinden sarsıcı mühimmat ile eşzamanlı giriş yapılacak.",
        completed: false,
      },
    ],
    comments: [
      {
        id: "c-1",
        authorName: "Komuta Merkezi",
        authorBadge: "1222",
        authorRank: "Chief of Police",
        content: "Arka bahçede kaçış aracı ihtimaline karşı K-9 birimi batı koridorunda hazır beklesin.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

async function getPlans() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (!record || !record.value) {
      await prisma.systemSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: JSON.stringify(DEFAULT_PLANS) },
        create: { key: SETTING_KEY, value: JSON.stringify(DEFAULT_PLANS) },
      });
      return DEFAULT_PLANS;
    }
    const parsed = JSON.parse(record.value);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PLANS;
  } catch (err) {
    console.error("getPlans error:", err);
    return DEFAULT_PLANS;
  }
}

async function savePlans(plans: any[]) {
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(plans) },
    create: { key: SETTING_KEY, value: JSON.stringify(plans) },
  });
}

export async function GET() {
  try {
    const plans = await getPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("GET /api/tactical-plans error:", error);
    return NextResponse.json({ plans: DEFAULT_PLANS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plans = await getPlans();

    if (body.action === "CREATE_PLAN") {
      const newPlan = {
        id: `OP-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: body.title || "Yeni Taktiksel Operasyon",
        location: body.location || "Belirtilmedi",
        riskLevel: body.riskLevel || "YÜKSEK",
        status: "PLANLANIYOR",
        commander: body.commander || "Komuta Merkezi",
        mapType: body.mapType || "BUILDING",
        customMapUrl: body.customMapUrl || "",
        summary: body.summary || "",
        createdAt: new Date().toISOString(),
        markers: [],
        directives: [],
        comments: [],
      };
      const updated = [newPlan, ...plans];
      await savePlans(updated);
      return NextResponse.json({ success: true, plan: newPlan, plans: updated });
    }

    if (body.action === "UPDATE_PLAN" && body.plan) {
      const updated = plans.map((p: any) => (p.id === body.plan.id ? body.plan : p));
      await savePlans(updated);
      return NextResponse.json({ success: true, plans: updated });
    }

    if (body.action === "DELETE_PLAN" && body.planId) {
      const updated = plans.filter((p: any) => p.id !== body.planId);
      await savePlans(updated);
      return NextResponse.json({ success: true, plans: updated });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/tactical-plans error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
