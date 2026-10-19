import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedOfficer } from "@/lib/session-verify";

const SETTING_KEY = "tactical_plans_v2";

const DEFAULT_PLANS = [
  {
    id: "OP-2026-001",
    title: "Boş Taktiksel Operasyon Şablonu",
    location: "Operasyon Bölgesi Belirtilmedi",
    riskLevel: "YÜKSEK",
    status: "PLANLANIYOR",
    commander: "Komuta Merkezi",
    mapType: "EMPTY",
    customMapUrl: "",
    summary:
      "Serbest taktiksel planlama tahtası. Sol kütüphaneden bina, oda, konteyner, yol, siper, birim ve şüphelileri sürükleyip bırakarak operasyon krokinizi sıfırdan inşa edebilirsiniz.",
    createdAt: new Date().toISOString(),
    structures: [],
    markers: [],
    drawings: [],
    directives: [],
    comments: [],
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

export async function GET(req: NextRequest) {
  const me = await getAuthedOfficer(req);
  if (!me) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const plans = await getPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("GET /api/tactical-plans error:", error);
    return NextResponse.json({ plans: DEFAULT_PLANS });
  }
}

export async function POST(req: NextRequest) {
  const me = await getAuthedOfficer(req);
  if (!me) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const raw = await req.text();
    if (raw.length > 1_500_000) {
      return NextResponse.json({ error: "İstek çok büyük." }, { status: 413 });
    }
    const body = JSON.parse(raw);
    const plans = await getPlans();

    if (body.action === "CREATE_PLAN") {
      const newPlan = {
        id: `OP-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: body.title || "Yeni Taktiksel Operasyon",
        location: body.location || "Belirtilmedi",
        riskLevel: body.riskLevel || "YÜKSEK",
        status: "PLANLANIYOR",
        commander: body.commander || "Komuta Merkezi",
        mapType: body.mapType || "EMPTY",
        customMapUrl: body.customMapUrl || "",
        summary: body.summary || "",
        createdAt: new Date().toISOString(),
        structures: [],
        markers: [],
        drawings: [],
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
      if (me.role !== "admin") {
        return NextResponse.json({ error: "Plan silmek için yönetici yetkisi gereklidir." }, { status: 403 });
      }
      const filtered = plans.filter((p: any) => p.id !== body.planId);
      const updated = filtered.length > 0 ? filtered : DEFAULT_PLANS;
      await savePlans(updated);
      return NextResponse.json({ success: true, plans: updated });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/tactical-plans error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
