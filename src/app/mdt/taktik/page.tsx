"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";

export interface TacticalMarker {
  id: string;
  category: "UNIT" | "SUSPECT" | "DIRECTIVE_PIN" | "NOTE";
  type: string;
  label: string;
  sublabel: string;
  x: number; // floating point percentage 0..100
  y: number; // floating point percentage 0..100
  color?: string;
}

export interface TacticalDrawing {
  id: string;
  type: "ARROW" | "PATH" | "ZONE";
  color: string;
  label?: string;
  points: { x: number; y: number }[]; // percentage coordinates
}

export interface TacticalDirective {
  id: string;
  phase: string;
  priority: "NORMAL" | "YÜKSEK" | "KRİTİK";
  assignedTo: string;
  text: string;
  completed: boolean;
}

export interface TacticalComment {
  id: string;
  authorName: string;
  authorBadge: string;
  authorRank: string;
  content: string;
  createdAt: string;
}

export interface TacticalPlan {
  id: string;
  title: string;
  location: string;
  riskLevel: "DÜŞÜK" | "ORTA" | "YÜKSEK" | "KRİTİK";
  status: "PLANLANIYOR" | "AKTİF OPERASYON" | "TAMAMLANDI";
  commander: string;
  mapType: "BUILDING" | "BANK" | "INTERSECTION" | "GRID" | "CUSTOM";
  customMapUrl?: string;
  summary: string;
  createdAt: string;
  markers: TacticalMarker[];
  drawings?: TacticalDrawing[];
  directives: TacticalDirective[];
  comments: TacticalComment[];
}

interface PaletteItem {
  type: string;
  category: "UNIT" | "SUSPECT" | "DIRECTIVE_PIN" | "NOTE";
  group: "BİRİMLER" | "ŞÜPHELİ & HEDEF" | "TAKTİK İŞARETLER";
  name: string;
  defaultLabel: string;
  defaultSub: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // BİRİMLER
  {
    type: "PATROL",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Devriye Birimi (Adam)",
    defaultLabel: "1-ADAM-12",
    defaultSub: "Çevre Güvenliği",
    icon: "fa-car-on",
    bg: "#041632",
    border: "#3b82f6",
    text: "#ffffff",
  },
  {
    type: "SWAT",
    category: "UNIT",
    group: "BİRİMLER",
    name: "SWAT Taktik Ekip",
    defaultLabel: "SWAT-1",
    defaultSub: "Giriş Ekibi",
    icon: "fa-shield-halved",
    bg: "#0f172a",
    border: "#38bdf8",
    text: "#38bdf8",
  },
  {
    type: "SNIPER",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Keskin Nişancı",
    defaultLabel: "GÖZLEM-1",
    defaultSub: "Çatı Gözlem",
    icon: "fa-crosshairs",
    bg: "#064e3b",
    border: "#10b981",
    text: "#ecfdf5",
  },
  {
    type: "AIR",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Hava Desteği (Air)",
    defaultLabel: "AIR-1",
    defaultSub: "Termal Gözlem",
    icon: "fa-helicopter",
    bg: "#0c4a6e",
    border: "#0ea5e9",
    text: "#e0f2fe",
  },
  {
    type: "K9",
    category: "UNIT",
    group: "BİRİMLER",
    name: "K-9 Köpek Birimi",
    defaultLabel: "K9-1",
    defaultSub: "Arama & Takip",
    icon: "fa-paw",
    bg: "#78350f",
    border: "#f59e0b",
    text: "#fef3c7",
  },
  {
    type: "DETECTIVE",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Dedektif / Müzakereci",
    defaultLabel: "RHD-1",
    defaultSub: "Müzakere",
    icon: "fa-user-tie",
    bg: "#312e81",
    border: "#818cf8",
    text: "#e0e7ff",
  },
  {
    type: "BEARCAT",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Zırhlı Araç (BearCat)",
    defaultLabel: "BEARCAT",
    defaultSub: "Zırhlı Siper",
    icon: "fa-truck-monster",
    bg: "#1e293b",
    border: "#64748b",
    text: "#f8fafc",
  },
  {
    type: "PERIMETER",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Barikat / Yol Kapama",
    defaultLabel: "BARİKAT",
    defaultSub: "Yol Kapalı",
    icon: "fa-road-barrier",
    bg: "#334155",
    border: "#f97316",
    text: "#ffffff",
  },

  // ŞÜPHELİ & HEDEF
  {
    type: "ARMED_SUSPECT",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Silahlı Şüpheli",
    defaultLabel: "Şüpheli #1",
    defaultSub: "Silahlı / Tehlikeli",
    icon: "fa-person-rifle",
    bg: "#991b1b",
    border: "#ef4444",
    text: "#ffffff",
  },
  {
    type: "SUSPECT_FOOT",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Şüpheli / Gözcü",
    defaultLabel: "Gözcü",
    defaultSub: "Bina Çevresi",
    icon: "fa-user-secret",
    bg: "#7f1d1d",
    border: "#f87171",
    text: "#ffffff",
  },
  {
    type: "SUSPECT_VEHICLE",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Kaçış Aracı",
    defaultLabel: "Şüpheli Araç",
    defaultSub: "Kaçış İhtimali",
    icon: "fa-car-burst",
    bg: "#881337",
    border: "#fb7185",
    text: "#ffe4e6",
  },
  {
    type: "HOSTAGE",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Rehine / Sivil",
    defaultLabel: "Rehine",
    defaultSub: "Sivil Koruması",
    icon: "fa-person-shelter",
    bg: "#92400e",
    border: "#fbbf24",
    text: "#ffffff",
  },
  {
    type: "HAZARD",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Patlayıcı / Tuzak",
    defaultLabel: "TEHLİKE",
    defaultSub: "Bomba İhtimali",
    icon: "fa-triangle-exclamation",
    bg: "#7c2d12",
    border: "#f97316",
    text: "#ffedd5",
  },

  // TAKTİK İŞARETLER
  {
    type: "BREACH",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Giriş Noktası (Breach)",
    defaultLabel: "Giriş A",
    defaultSub: "Koçbaşı / Flashbang",
    icon: "fa-door-open",
    bg: "#c2410c",
    border: "#fb923c",
    text: "#ffffff",
  },
  {
    type: "COMMAND_POST",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Komuta Noktası",
    defaultLabel: "KOMUTA",
    defaultSub: "Kriz Merkezi",
    icon: "fa-flag",
    bg: "#1e3a8a",
    border: "#60a5fa",
    text: "#ffffff",
  },
  {
    type: "EMS",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Tıbbi Tahliye (EMS)",
    defaultLabel: "EMS NOKTASI",
    defaultSub: "Ambulans Bekleme",
    icon: "fa-kit-medical",
    bg: "#065f46",
    border: "#34d399",
    text: "#ffffff",
  },
  {
    type: "NOTE",
    category: "NOTE",
    group: "TAKTİK İŞARETLER",
    name: "Harita Üstü Direktif Notu",
    defaultLabel: "DİREKTİF NOTU",
    defaultSub: "Buraya tıklayıp not yazın",
    icon: "fa-note-sticky",
    bg: "#fef3c7",
    border: "#f59e0b",
    text: "#78350f",
  },
];

type ToolMode = "MOVE" | "ARROW" | "PATH" | "ZONE";

export default function TaktikselPlanlamaPage() {
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const { data: plansData, mutate: mutatePlans } = useSWR("/api/tactical-plans", fetcher, {
    revalidateOnFocus: false,
  });

  const user = meData?.user || null;
  const plans: TacticalPlan[] = plansData?.plans || [];

  const [activePlanId, setActivePlanId] = useState<string>("");
  const [localPlan, setLocalPlan] = useState<TacticalPlan | null>(null);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "DIRTY" | "SAVING">("SAVED");

  // Canvas interaction state
  const [toolMode, setToolMode] = useState<ToolMode>("MOVE");
  const [drawColor, setDrawColor] = useState<string>("#38bdf8");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);

  // Smooth pointer dragging for existing markers on canvas
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Custom pointer dragging from Left Palette directly onto the canvas
  const [paletteDragItem, setPaletteDragItem] = useState<PaletteItem | null>(null);
  const [paletteDragPos, setPaletteDragPos] = useState<{ clientX: number; clientY: number } | null>(null);

  // Active drawing state (Arrow / Freehand / Zone)
  const [activeDrawing, setActiveDrawing] = useState<TacticalDrawing | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Directives & Comments forms
  const [dirPhase, setDirPhase] = useState("AŞAMA 1");
  const [dirPriority, setDirPriority] = useState<"NORMAL" | "YÜKSEK" | "KRİTİK">("YÜKSEK");
  const [dirAssigned, setDirAssigned] = useState("");
  const [dirText, setDirText] = useState("");
  const [commentText, setCommentText] = useState("");

  // New Plan modal
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    title: "",
    location: "",
    riskLevel: "YÜKSEK",
    mapType: "BUILDING",
    customMapUrl: "",
    summary: "",
  });

  // Initialize active plan once when loaded
  useEffect(() => {
    if (plans.length > 0 && !activePlanId) {
      setActivePlanId(plans[0].id);
      setLocalPlan({
        ...plans[0],
        drawings: plans[0].drawings || [],
      });
    }
  }, [plans, activePlanId]);

  // Persist to API (debounced or immediate)
  const persistToServer = useCallback(
    async (planToSave: TacticalPlan, showToast = false) => {
      setSaveStatus("SAVING");
      try {
        const res = await fetch("/api/tactical-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_PLAN", plan: planToSave }),
        });
        if (res.ok) {
          setSaveStatus("SAVED");
          mutatePlans();
          if (showToast) toast.success("Taktiksel plan kaydedildi.");
        } else {
          setSaveStatus("DIRTY");
          if (showToast) toast.error("Kaydetme başarısız.");
        }
      } catch {
        setSaveStatus("DIRTY");
        if (showToast) toast.error("Bağlantı hatası.");
      }
    },
    [mutatePlans]
  );

  const updateLocalAndScheduleSave = useCallback(
    (updater: (prev: TacticalPlan) => TacticalPlan) => {
      setLocalPlan((prev) => {
        if (!prev) return null;
        const next = updater(prev);
        setSaveStatus("DIRTY");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          persistToServer(next, false);
        }, 700);
        return next;
      });
    },
    [persistToServer]
  );

  // Keyboard delete shortcut for selected marker
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedMarkerId || editingInlineId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        updateLocalAndScheduleSave((prev) => ({
          ...prev,
          markers: prev.markers.filter((m) => m.id !== selectedMarkerId),
        }));
        setSelectedMarkerId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMarkerId, editingInlineId, updateLocalAndScheduleSave]);

  // Global pointer move / up for dragging from the Left Palette onto the Board!
  useEffect(() => {
    if (!paletteDragItem) return;

    const handleGlobalMove = (e: PointerEvent) => {
      setPaletteDragPos({ clientX: e.clientX, clientY: e.clientY });
    };

    const handleGlobalUp = (e: PointerEvent) => {
      if (boardRef.current && paletteDragItem) {
        const rect = boardRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isInside) {
          const x = Math.max(1, Math.min(99, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
          const y = Math.max(1, Math.min(99, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));

          const newMarker: TacticalMarker = {
            id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: paletteDragItem.category,
            type: paletteDragItem.type,
            label: paletteDragItem.defaultLabel,
            sublabel: paletteDragItem.defaultSub,
            x,
            y,
          };

          updateLocalAndScheduleSave((prev) => ({
            ...prev,
            markers: [...prev.markers, newMarker],
          }));
          setSelectedMarkerId(newMarker.id);
          setToolMode("MOVE");
        }
      }
      setPaletteDragItem(null);
      setPaletteDragPos(null);
    };

    window.addEventListener("pointermove", handleGlobalMove);
    window.addEventListener("pointerup", handleGlobalUp);
    return () => {
      window.removeEventListener("pointermove", handleGlobalMove);
      window.removeEventListener("pointerup", handleGlobalUp);
    };
  }, [paletteDragItem, updateLocalAndScheduleSave]);

  // Quick spawn at center if user just clicks a palette item instead of dragging
  const handleQuickAddFromPalette = (item: PaletteItem) => {
    const jitterX = Number((46 + (Math.random() * 8 - 4)).toFixed(2));
    const jitterY = Number((46 + (Math.random() * 8 - 4)).toFixed(2));
    const newMarker: TacticalMarker = {
      id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: item.category,
      type: item.type,
      label: item.defaultLabel,
      sublabel: item.defaultSub,
      x: jitterX,
      y: jitterY,
    };
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      markers: [...prev.markers, newMarker],
    }));
    setSelectedMarkerId(newMarker.id);
    setToolMode("MOVE");
  };

  // Board Pointer Down (for Drawing Arrows / Paths / Zones or deselecting)
  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!localPlan || !boardRef.current) return;

    if (toolMode === "MOVE") {
      setSelectedMarkerId(null);
      setEditingInlineId(null);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = boardRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));

    const newDrawing: TacticalDrawing = {
      id: `drw-${Date.now()}`,
      type: toolMode === "ARROW" ? "ARROW" : toolMode === "PATH" ? "PATH" : "ZONE",
      color: drawColor,
      points: [
        { x, y },
        { x, y },
      ],
    };
    setActiveDrawing(newDrawing);
  };

  // Board Pointer Move (for smooth 60fps Marker Dragging OR Drawing)
  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boardRef.current || !localPlan) return;
    const rect = boardRef.current.getBoundingClientRect();

    if (draggingMarkerId) {
      const rawX = ((e.clientX - rect.left - dragOffsetRef.current.dx) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top - dragOffsetRef.current.dy) / rect.height) * 100;
      const x = Math.max(0.5, Math.min(99.5, Number(rawX.toFixed(2))));
      const y = Math.max(0.5, Math.min(99.5, Number(rawY.toFixed(2))));

      setLocalPlan((prev) =>
        prev
          ? {
              ...prev,
              markers: prev.markers.map((m) => (m.id === draggingMarkerId ? { ...m, x, y } : m)),
            }
          : null
      );
      return;
    }

    if (activeDrawing) {
      const x = Math.max(0, Math.min(100, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
      const y = Math.max(0, Math.min(100, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));

      setActiveDrawing((prev) => {
        if (!prev) return null;
        if (prev.type === "PATH") {
          return { ...prev, points: [...prev.points, { x, y }] };
        } else {
          return { ...prev, points: [prev.points[0], { x, y }] };
        }
      });
    }
  };

  const handleBoardPointerUp = () => {
    if (draggingMarkerId && localPlan) {
      setDraggingMarkerId(null);
      updateLocalAndScheduleSave((prev) => ({ ...prev }));
    }
    if (activeDrawing && localPlan) {
      const p0 = activeDrawing.points[0];
      const pLast = activeDrawing.points[activeDrawing.points.length - 1];
      const dist = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);
      if (dist > 1.5) {
        const finished = activeDrawing;
        updateLocalAndScheduleSave((prev) => ({
          ...prev,
          drawings: [...(prev.drawings || []), finished],
        }));
      }
      setActiveDrawing(null);
    }
  };

  const handleUndoLastDrawing = () => {
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      drawings: (prev.drawings || []).slice(0, -1),
    }));
  };

  const handleClearDrawings = () => {
    if (!confirm("Harita üzerindeki tüm çizim ve okları temizlemek istiyor musunuz?")) return;
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      drawings: [],
    }));
  };

  const handleClearAllMarkers = () => {
    if (!confirm("Harita üzerindeki tüm birimleri ve işaretleri temizlemek istiyor musunuz?")) return;
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      markers: [],
      drawings: [],
    }));
    setSelectedMarkerId(null);
  };

  const handleDuplicateMarker = (m: TacticalMarker) => {
    const copy: TacticalMarker = {
      ...m,
      id: `mk-${Date.now()}`,
      x: Math.min(96, m.x + 3.5),
      y: Math.min(96, m.y + 3.5),
    };
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      markers: [...prev.markers, copy],
    }));
    setSelectedMarkerId(copy.id);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) return;
    try {
      const res = await fetch("/api/tactical-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PLAN",
          title: newPlanForm.title.trim(),
          location: newPlanForm.location.trim() || "Los Angeles",
          riskLevel: newPlanForm.riskLevel,
          mapType: newPlanForm.mapType,
          customMapUrl: newPlanForm.customMapUrl.trim(),
          summary: newPlanForm.summary.trim(),
          commander: user ? `${user.rank} ${user.name} (#${user.badge})` : "Komuta Merkezi",
        }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        toast.success("Yeni operasyon planı oluşturuldu.");
        setShowNewPlanModal(false);
        setNewPlanForm({ title: "", location: "", riskLevel: "YÜKSEK", mapType: "BUILDING", customMapUrl: "", summary: "" });
        await mutatePlans();
        setActivePlanId(data.plan.id);
        setLocalPlan({ ...data.plan, drawings: [] });
      }
    } catch {
      toast.error("Plan oluşturulamadı.");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Bu taktiksel operasyon planını silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/tactical-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PLAN", planId: id }),
      });
      if (res.ok) {
        toast.success("Operasyon planı silindi.");
        setActivePlanId("");
        setLocalPlan(null);
        mutatePlans();
      }
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPlan || !dirText.trim()) return;
    const newDir: TacticalDirective = {
      id: `dir-${Date.now()}`,
      phase: dirPhase,
      priority: dirPriority,
      assignedTo: dirAssigned.trim() || "Tüm Birimler",
      text: dirText.trim(),
      completed: false,
    };
    setDirText("");
    setDirAssigned("");
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      directives: [...prev.directives, newDir],
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPlan || !commentText.trim()) return;
    const newComment: TacticalComment = {
      id: `com-${Date.now()}`,
      authorName: user?.name || "Personel",
      authorBadge: user?.badge || "---",
      authorRank: user?.rank || "Officer",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentText("");
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
  };

  const selectedMarker = localPlan?.markers.find((m) => m.id === selectedMarkerId) || null;
  const allDrawings = [...(localPlan?.drawings || []), ...(activeDrawing ? [activeDrawing] : [])];

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "2.5rem" }}>
      {/* ── FLOATING DRAG GHOST WHEN DRAGGING FROM LEFT PALETTE ── */}
      {paletteDragItem && paletteDragPos && (
        <div
          style={{
            position: "fixed",
            left: paletteDragPos.clientX,
            top: paletteDragPos.clientY,
            transform: "translate(-50%, -50%)",
            backgroundColor: paletteDragItem.bg,
            border: `2px solid ${paletteDragItem.border}`,
            color: paletteDragItem.text,
            padding: "0.45rem 0.8rem",
            borderRadius: 6,
            boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            pointerEvents: "none",
            zIndex: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <i className={`fa-solid ${paletteDragItem.icon}`} />
          <span>{paletteDragItem.defaultLabel}</span>
        </div>
      )}

      {/* ── TOP HEADER BAR ── */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--LAC-orange)", letterSpacing: "0.04em" }}>
              LAPD TACTICAL PLANNING // SÜRÜKLE-BIRAK OPERASYON TAHTASI
            </div>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Taktiksel Planlama Merkezi
            </h1>
          </div>

          <select
            value={activePlanId}
            onChange={(e) => {
              const found = plans.find((p) => p.id === e.target.value);
              if (found) {
                setActivePlanId(found.id);
                setLocalPlan({ ...found, drawings: found.drawings || [] });
                setSelectedMarkerId(null);
              }
            }}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
              fontSize: "0.86rem",
              fontWeight: 600,
              minWidth: 260,
              cursor: "pointer",
            }}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: saveStatus === "SAVED" ? "#16a34a" : saveStatus === "SAVING" ? "var(--LAC-orange)" : "var(--text-muted)",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            {saveStatus === "SAVED"
              ? "✓ Otomatik Kaydedildi"
              : saveStatus === "SAVING"
              ? "Kaydediliyor..."
              : "Değişiklikler Kaydediliyor..."}
          </span>

          {localPlan && (
            <button
              onClick={() => persistToServer(localPlan, true)}
              style={{
                padding: "0.5rem 0.95rem",
                borderRadius: 6,
                backgroundColor: "#041632",
                color: "#ffffff",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <i className="fa-solid fa-floppy-disk" />
              Şimdi Kaydet
            </button>
          )}

          <button
            onClick={() => setShowNewPlanModal(true)}
            style={{
              padding: "0.5rem 0.95rem",
              borderRadius: 6,
              backgroundColor: "var(--LAC-orange)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <i className="fa-solid fa-plus" />
            Yeni Plan Oluştur
          </button>

          {localPlan && plans.length > 1 && (
            <button
              onClick={() => handleDeletePlan(localPlan.id)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                backgroundColor: "var(--color-danger-bg)",
                border: "1px solid var(--color-danger-border)",
                color: "var(--color-danger)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Bu Planı Sil"
            >
              <i className="fa-solid fa-trash" />
            </button>
          )}
        </div>
      </div>

      {localPlan && (
        <>
          {/* ── MAIN WORKSPACE: LEFT DRAG PALETTE (260px) + RIGHT WIDE TACTICAL BOARD ── */}
          <div style={{ display: "grid", gridTemplateColumns: "265px 1fr", gap: "1rem", alignItems: "stretch" }}>
            {/* ── LEFT PANEL: DRAGGABLE UNIT / SUSPECT / DIRECTIVE PALETTE ── */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.85rem 1rem",
                  backgroundColor: "#041632",
                  color: "#ffffff",
                }}
              >
                <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>Birim & Hedef Kütüphanesi</div>
                <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                  Soldan tutup haritaya sürükleyin veya eklemek için tıklayın
                </div>
              </div>

              <div
                style={{
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  overflowY: "auto",
                  maxHeight: 620,
                }}
              >
                {(["BİRİMLER", "ŞÜPHELİ & HEDEF", "TAKTİK İŞARETLER"] as const).map((groupName) => (
                  <div key={groupName}>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        letterSpacing: "0.04em",
                        marginBottom: "0.45rem",
                      }}
                    >
                      {groupName}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.38rem" }}>
                      {PALETTE_ITEMS.filter((i) => i.group === groupName).map((item) => (
                        <div
                          key={item.type}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setPaletteDragItem(item);
                            setPaletteDragPos({ clientX: e.clientX, clientY: e.clientY });
                          }}
                          onClick={() => handleQuickAddFromPalette(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            padding: "0.52rem 0.7rem",
                            borderRadius: 6,
                            backgroundColor: "var(--bg-primary)",
                            border: "1px solid var(--border-light)",
                            borderLeft: `4px solid ${item.bg === "#fef3c7" ? "#f59e0b" : item.bg}`,
                            cursor: "grab",
                            userSelect: "none",
                            transition: "background 0.12s, transform 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              backgroundColor: item.bg,
                              color: item.text,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              flexShrink: 0,
                            }}
                          >
                            <i className={`fa-solid ${item.icon}`} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.defaultSub}</div>
                          </div>
                          <i className="fa-solid fa-grip-vertical" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: INTERACTIVE TACTICAL CANVAS + FLOATING INSPECTOR ── */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Canvas Top Toolbar (Drawing Tools + Map Background Selector) */}
              <div
                style={{
                  padding: "0.7rem 1rem",
                  borderBottom: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.65rem",
                }}
              >
                {/* Mode Switcher: Move vs Draw Arrow vs Draw Freehand vs Zone */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                  {[
                    { id: "MOVE", label: "Seç & Sürükle", icon: "fa-arrows-up-down-left-right" },
                    { id: "ARROW", label: "Taktik Ok Çiz", icon: "fa-arrow-trend-up" },
                    { id: "PATH", label: "Serbest Kalem", icon: "fa-pen" },
                    { id: "ZONE", label: "Çember / Bölge", icon: "fa-vector-square" },
                  ].map((t) => {
                    const isActive = toolMode === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setToolMode(t.id as ToolMode)}
                        style={{
                          padding: "0.42rem 0.8rem",
                          borderRadius: 6,
                          backgroundColor: isActive ? "#041632" : "var(--bg-secondary)",
                          color: isActive ? "#ffffff" : "var(--text-primary)",
                          border: isActive ? "1px solid #041632" : "1px solid var(--border-strong)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <i className={`fa-solid ${t.icon}`} />
                        {t.label}
                      </button>
                    );
                  })}

                  {/* Color swatches when drawing */}
                  {toolMode !== "MOVE" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", marginLeft: "0.4rem" }}>
                      {[
                        { c: "#38bdf8", label: "Mavi (Birim Yönü)" },
                        { c: "#ef4444", label: "Kırmızı (Tehdit / Hedef)" },
                        { c: "#f97316", label: "Turuncu (Giriş / Breach)" },
                        { c: "#22c55e", label: "Yeşil (Güvenli Koridor)" },
                      ].map((sw) => (
                        <button
                          key={sw.c}
                          title={sw.label}
                          onClick={() => setDrawColor(sw.c)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: sw.c,
                            border: drawColor === sw.c ? "2px solid #ffffff" : "1px solid rgba(0,0,0,0.3)",
                            boxShadow: drawColor === sw.c ? "0 0 0 2px #041632" : "none",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Controls: Map Background + Undo/Clear */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                  <select
                    value={localPlan.mapType}
                    onChange={(e) =>
                      updateLocalAndScheduleSave((prev) => ({
                        ...prev,
                        mapType: e.target.value as TacticalPlan["mapType"],
                      }))
                    }
                    style={{
                      padding: "0.4rem 0.7rem",
                      borderRadius: 6,
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="BUILDING">Kroki: Müstakil Bina Baskını</option>
                    <option value="BANK">Kroki: Banka / Kuyumcu Soygunu</option>
                    <option value="INTERSECTION">Kroki: Şehir Kavşağı & Blok</option>
                    <option value="GRID">Kroki: Boş Taktik Izgara</option>
                  </select>

                  {(localPlan.drawings?.length || 0) > 0 && (
                    <>
                      <button
                        onClick={handleUndoLastDrawing}
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: 6,
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border-strong)",
                          color: "var(--text-secondary)",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title="Son Çizimi Geri Al"
                      >
                        <i className="fa-solid fa-rotate-left" /> Çizimi Geri Al
                      </button>
                      <button
                        onClick={handleClearDrawings}
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: 6,
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border-strong)",
                          color: "var(--text-secondary)",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Çizimleri Sil
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleClearAllMarkers}
                    style={{
                      padding: "0.4rem 0.65rem",
                      borderRadius: 6,
                      backgroundColor: "var(--color-danger-bg)",
                      border: "1px solid var(--color-danger-border)",
                      color: "var(--color-danger)",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Tahtayı Temizle
                  </button>
                </div>
              </div>

              {/* ── THE TACTICAL CANVAS ── */}
              <div
                ref={boardRef}
                onPointerDown={handleBoardPointerDown}
                onPointerMove={handleBoardPointerMove}
                onPointerUp={handleBoardPointerUp}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 600,
                  backgroundColor: "#0b1528",
                  cursor: toolMode === "MOVE" ? "default" : "crosshair",
                  userSelect: "none",
                  touchAction: "none",
                  overflow: "hidden",
                }}
              >
                {/* SVG Architectural Blueprint & Tactical Drawings */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                  <defs>
                    <pattern id="tacGridFine" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                    </pattern>
                    <pattern id="tacGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
                      <rect width="200" height="200" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
                    </pattern>
                    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#f97316" />
                    </marker>
                    <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#22c55e" />
                    </marker>
                  </defs>

                  <rect width="1000" height="600" fill="url(#tacGridFine)" />
                  <rect width="1000" height="600" fill="url(#tacGridMajor)" />

                  {/* MAP 1: BUILDING RAID */}
                  {localPlan.mapType === "BUILDING" && (
                    <g>
                      <rect x="0" y="485" width="1000" height="85" fill="rgba(30,41,59,0.8)" stroke="rgba(148,163,184,0.3)" />
                      <line x1="0" y1="527" x2="1000" y2="527" stroke="rgba(250,204,21,0.45)" strokeWidth="2" strokeDasharray="16 12" />
                      <text x="25" y="512" fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="700">
                        ANA CADDE (GÜNEY YAKLAŞMA KORİDORU)
                      </text>

                      <rect
                        x="200"
                        y="70"
                        width="600"
                        height="380"
                        fill="rgba(15,23,42,0.55)"
                        stroke="rgba(148,163,184,0.4)"
                        strokeWidth="2"
                        strokeDasharray="8 6"
                      />
                      <text x="215" y="95" fill="rgba(148,163,184,0.55)" fontSize="11" fontWeight="600">
                        BAHÇE DUVARI / ÇEVRE ÇEMBERİ
                      </text>

                      {/* Target House */}
                      <rect x="290" y="140" width="420" height="250" fill="rgba(30,58,138,0.26)" stroke="#60a5fa" strokeWidth="3" />
                      <line x1="500" y1="140" x2="500" y2="390" stroke="rgba(96,165,250,0.55)" strokeWidth="2" />
                      <line x1="290" y1="265" x2="710" y2="265" stroke="rgba(96,165,250,0.55)" strokeWidth="2" />

                      {/* Doors */}
                      <rect x="475" y="384" width="50" height="10" fill="#f97316" />
                      <text x="460" y="412" fill="#fdba74" fontSize="11" fontWeight="700">
                        ÖN KAPI (ANA GİRİŞ)
                      </text>

                      <rect x="475" y="135" width="50" height="10" fill="#38bdf8" />
                      <text x="462" y="126" fill="#7dd3fc" fontSize="11" fontWeight="700">
                        ARKA BAHÇE KAPISI
                      </text>

                      <rect x="285" y="200" width="10" height="40" fill="#38bdf8" />
                      <text x="215" y="224" fill="#7dd3fc" fontSize="11" fontWeight="700">
                        YAN PENCERE
                      </text>

                      <text x="355" y="210" fill="rgba(255,255,255,0.6)" fontSize="13" fontWeight="700">
                        ODA 1 (KUZEYBATI)
                      </text>
                      <text x="560" y="210" fill="rgba(255,255,255,0.6)" fontSize="13" fontWeight="700">
                        ARKA ODA / DEPO
                      </text>
                      <text x="355" y="335" fill="rgba(255,255,255,0.6)" fontSize="13" fontWeight="700">
                        ANA SALON
                      </text>
                      <text x="560" y="335" fill="rgba(255,255,255,0.6)" fontSize="13" fontWeight="700">
                        GİRİŞ KORİDORU
                      </text>

                      <rect x="45" y="130" width="120" height="260" fill="rgba(30,41,59,0.6)" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
                      <text x="65" y="265" fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="700">
                        BATI BİNA (ÇATI)
                      </text>

                      <rect x="835" y="130" width="120" height="260" fill="rgba(30,41,59,0.6)" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
                      <text x="855" y="265" fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="700">
                        DOĞU BİNA (ÇATI)
                      </text>
                    </g>
                  )}

                  {/* MAP 2: BANK / ROBBERY */}
                  {localPlan.mapType === "BANK" && (
                    <g>
                      <rect x="0" y="470" width="1000" height="100" fill="rgba(30,41,59,0.85)" />
                      <line x1="0" y1="520" x2="1000" y2="520" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="18 12" />
                      <text x="30" y="500" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700">
                        ANA BULVAR (ÖN CEPHE)
                      </text>

                      {/* Main Bank Structure */}
                      <rect x="220" y="100" width="560" height="330" fill="rgba(30,58,138,0.25)" stroke="#60a5fa" strokeWidth="3" />
                      {/* Lobby vs Counters vs Vault */}
                      <line x1="220" y1="260" x2="780" y2="260" stroke="#60a5fa" strokeWidth="2.5" />
                      <line x1="500" y1="100" x2="500" y2="260" stroke="#60a5fa" strokeWidth="2" />

                      {/* Vault */}
                      <rect x="540" y="125" width="210" height="110" fill="rgba(220,38,38,0.22)" stroke="#f87171" strokeWidth="2.5" />
                      <text x="595" y="185" fill="#fca5a5" fontSize="14" fontWeight="700">
                        ZIRHLI KASA (VAULT)
                      </text>

                      <text x="310" y="185" fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700">
                        YÖNETİM & GÜVENLİK ODASI
                      </text>
                      <text x="440" y="355" fill="rgba(255,255,255,0.7)" fontSize="15" fontWeight="700">
                        BANKA ANA LOBİSİ (GİŞELER)
                      </text>

                      {/* Main Double Entrance & Side Alley Exit */}
                      <rect x="460" y="424" width="80" height="12" fill="#f97316" />
                      <text x="455" y="452" fill="#fdba74" fontSize="12" fontWeight="700">
                        ANA BANKA GİRİŞİ
                      </text>

                      <rect x="214" y="170" width="12" height="50" fill="#38bdf8" />
                      <text x="115" y="198" fill="#7dd3fc" fontSize="11" fontWeight="700">
                        YAN SOKAK ÇIKIŞI
                      </text>
                    </g>
                  )}

                  {/* MAP 3: URBAN INTERSECTION */}
                  {localPlan.mapType === "INTERSECTION" && (
                    <g>
                      <rect x="0" y="230" width="1000" height="140" fill="rgba(30,41,59,0.85)" />
                      <rect x="420" y="0" width="160" height="600" fill="rgba(30,41,59,0.85)" />
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />
                      <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />

                      <rect x="40" y="35" width="340" height="165" fill="rgba(30,58,138,0.22)" stroke="#64748b" strokeWidth="2" />
                      <text x="150" y="125" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="700">
                        KUZEYBATI BLOK
                      </text>

                      <rect x="620" y="35" width="340" height="165" fill="rgba(30,58,138,0.22)" stroke="#64748b" strokeWidth="2" />
                      <text x="730" y="125" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="700">
                        KUZEYDOĞU BLOK
                      </text>

                      <rect x="40" y="400" width="340" height="165" fill="rgba(30,58,138,0.22)" stroke="#64748b" strokeWidth="2" />
                      <text x="150" y="490" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="700">
                        GÜNEYBATI BLOK
                      </text>

                      <rect x="620" y="400" width="340" height="165" fill="rgba(30,58,138,0.22)" stroke="#64748b" strokeWidth="2" />
                      <text x="730" y="490" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="700">
                        GÜNEYDOĞU BLOK
                      </text>
                    </g>
                  )}

                  {/* USER DRAWINGS (ARROWS, PATHS, ZONES) */}
                  {allDrawings.map((d) => {
                    if (d.points.length < 2) return null;
                    const markerId =
                      d.color === "#ef4444"
                        ? "url(#arrow-red)"
                        : d.color === "#f97316"
                        ? "url(#arrow-orange)"
                        : d.color === "#22c55e"
                        ? "url(#arrow-green)"
                        : "url(#arrow-blue)";

                    if (d.type === "ARROW") {
                      const p1 = d.points[0];
                      const p2 = d.points[d.points.length - 1];
                      return (
                        <line
                          key={d.id}
                          x1={p1.x * 10}
                          y1={p1.y * 6}
                          x2={p2.x * 10}
                          y2={p2.y * 6}
                          stroke={d.color}
                          strokeWidth="3.5"
                          markerEnd={markerId}
                        />
                      );
                    }

                    if (d.type === "ZONE") {
                      const p1 = d.points[0];
                      const p2 = d.points[d.points.length - 1];
                      const x = Math.min(p1.x, p2.x) * 10;
                      const y = Math.min(p1.y, p2.y) * 6;
                      const w = Math.abs(p2.x - p1.x) * 10;
                      const h = Math.abs(p2.y - p1.y) * 6;
                      return (
                        <rect
                          key={d.id}
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          rx="8"
                          fill={`${d.color}22`}
                          stroke={d.color}
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                        />
                      );
                    }

                    const polyPoints = d.points.map((pt) => `${pt.x * 10},${pt.y * 6}`).join(" ");
                    return (
                      <polyline
                        key={d.id}
                        fill="none"
                        stroke={d.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polyPoints}
                      />
                    );
                  })}
                </svg>

                {/* Placed Markers on Canvas */}
                {localPlan.markers.map((m) => {
                  const meta = PALETTE_ITEMS.find((p) => p.type === m.type) || PALETTE_ITEMS[0];
                  const isSelected = selectedMarkerId === m.id;
                  const isInlineEditing = editingInlineId === m.id;

                  return (
                    <div
                      key={m.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                        if (toolMode === "MOVE" && !isInlineEditing && boardRef.current) {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          const boardRect = boardRef.current.getBoundingClientRect();
                          const markerPxX = (m.x / 100) * boardRect.width;
                          const markerPxY = (m.y / 100) * boardRect.height;
                          dragOffsetRef.current = {
                            dx: e.clientX - boardRect.left - markerPxX,
                            dy: e.clientY - boardRect.top - markerPxY,
                          };
                          setDraggingMarkerId(m.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                        setEditingInlineId(m.id);
                      }}
                      style={{
                        position: "absolute",
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        transform: "translate(-50%, -50%)",
                        backgroundColor: meta.bg,
                        border: isSelected ? "2px solid #ffffff" : `2px solid ${meta.border}`,
                        color: meta.text,
                        padding: "0.38rem 0.7rem",
                        borderRadius: 6,
                        cursor: draggingMarkerId === m.id ? "grabbing" : "grab",
                        boxShadow: isSelected
                          ? "0 0 0 3px #E84F2A, 0 8px 20px rgba(0,0,0,0.55)"
                          : "0 4px 12px rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        whiteSpace: "nowrap",
                        zIndex: isSelected ? 30 : 10,
                        touchAction: "none",
                      }}
                    >
                      <i className={`fa-solid ${meta.icon}`} style={{ fontSize: "0.85rem" }} />
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.15 }}>{m.label}</div>
                        {m.sublabel && (
                          <div style={{ fontSize: "0.68rem", opacity: 0.88, marginTop: 1 }}>{m.sublabel}</div>
                        )}
                      </div>

                      {/* Quick Delete X button right on the selected marker */}
                      {isSelected && (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLocalAndScheduleSave((prev) => ({
                              ...prev,
                              markers: prev.markers.filter((item) => item.id !== m.id),
                            }));
                            setSelectedMarkerId(null);
                          }}
                          title="Kaldır (Delete)"
                          style={{
                            marginLeft: 4,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.68rem",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Edit Bar for Selected Marker */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                {selectedMarker ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                      Seçili Eleman:
                    </span>
                    <input
                      type="text"
                      value={selectedMarker.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.map((m) => (m.id === selectedMarker.id ? { ...m, label: val } : m)),
                        }));
                      }}
                      placeholder="Birim Kodu / Başlık"
                      style={{
                        padding: "0.42rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        width: 180,
                      }}
                    />
                    <input
                      type="text"
                      value={selectedMarker.sublabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.map((m) => (m.id === selectedMarker.id ? { ...m, sublabel: val } : m)),
                        }));
                      }}
                      placeholder="Görev / Direktif Notu"
                      style={{
                        padding: "0.42rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.84rem",
                        width: 240,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDuplicateMarker(selectedMarker)}
                      style={{
                        padding: "0.42rem 0.8rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-strong)",
                        color: "var(--text-primary)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-regular fa-copy" style={{ marginRight: 5 }} />
                      Çoğalt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.filter((m) => m.id !== selectedMarker.id),
                        }));
                        setSelectedMarkerId(null);
                      }}
                      style={{
                        padding: "0.42rem 0.8rem",
                        borderRadius: 6,
                        backgroundColor: "var(--color-danger-bg)",
                        border: "1px solid var(--color-danger-border)",
                        color: "var(--color-danger)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                      Sil
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    <strong>İpucu:</strong> Sol menüdeki herhangi bir birimi veya şüpheliyi basılı tutup doğrudan harita üzerine sürükleyebilirsiniz. Haritadaki elemanları istediğiniz yere serbestçe kaydırabilirsiniz.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM 2-COLUMN SECTION: OPERATIONAL DIRECTIVES + TACTICAL DISCUSSION ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* Left: Directives */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Operasyon Direktifleri ve Görev Emirleri
                  </h2>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Birimlere atanan aşama bazlı taktik direktifler
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 4,
                  }}
                >
                  {localPlan.directives.filter((d) => d.completed).length} / {localPlan.directives.length} Tamamlandı
                </span>
              </div>

              <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: 300, overflowY: "auto" }}>
                {localPlan.directives.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Henüz direktif eklenmedi.
                  </div>
                ) : (
                  localPlan.directives.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: "0.75rem 0.9rem",
                        borderRadius: 6,
                        backgroundColor: d.completed ? "var(--bg-tertiary)" : "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                        borderLeft:
                          d.priority === "KRİTİK"
                            ? "3px solid #dc2626"
                            : d.priority === "YÜKSEK"
                            ? "3px solid var(--LAC-orange)"
                            : "3px solid #0284c7",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        opacity: d.completed ? 0.7 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={d.completed}
                        onChange={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            directives: prev.directives.map((item) =>
                              item.id === d.id ? { ...item, completed: !item.completed } : item
                            ),
                          }))
                        }
                        style={{ marginTop: 4, cursor: "pointer", width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-primary)", backgroundColor: "var(--bg-secondary)", padding: "0.1rem 0.45rem", borderRadius: 4, border: "1px solid var(--border-light)" }}>
                            {d.phase}
                          </span>
                          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                            {d.assignedTo}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "var(--text-primary)",
                            textDecoration: d.completed ? "line-through" : "none",
                            lineHeight: 1.45,
                          }}
                        >
                          {d.text}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            directives: prev.directives.filter((item) => item.id !== d.id),
                          }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddDirective}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: "0.5rem" }}>
                  <select
                    value={dirPhase}
                    onChange={(e) => setDirPhase(e.target.value)}
                    style={{
                      padding: "0.45rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <option value="AŞAMA 1">Aşama 1</option>
                    <option value="AŞAMA 2">Aşama 2</option>
                    <option value="AŞAMA 3">Aşama 3</option>
                    <option value="ACİL DURUM">Acil Durum</option>
                  </select>
                  <select
                    value={dirPriority}
                    onChange={(e) => setDirPriority(e.target.value as any)}
                    style={{
                      padding: "0.45rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <option value="NORMAL">Öncelik: Normal</option>
                    <option value="YÜKSEK">Öncelik: Yüksek</option>
                    <option value="KRİTİK">Öncelik: Kritik</option>
                  </select>
                  <input
                    type="text"
                    value={dirAssigned}
                    onChange={(e) => setDirAssigned(e.target.value)}
                    placeholder="Sorumlu Birim (Örn: SWAT-1)"
                    style={{
                      padding: "0.45rem 0.65rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={dirText}
                    onChange={(e) => setDirText(e.target.value)}
                    placeholder="Yeni taktik direktif veya görev emri yazın..."
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.84rem",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.5rem 0.95rem",
                      borderRadius: 6,
                      backgroundColor: "#041632",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Direktif Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Discussion & Briefing */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Taktiksel Tartışma ve Brifing Kanalı
                  </h2>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Operasyon planı üzerine personel görüşleri ve istihbarat paylaşımı
                  </div>
                </div>
                <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  {localPlan.comments.length} Mesaj
                </span>
              </div>

              <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.7rem", maxHeight: 300, overflowY: "auto" }}>
                {localPlan.comments.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.84rem" }}>
                    Henüz tartışma mesajı yok.
                  </div>
                ) : (
                  localPlan.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "0.75rem 0.9rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          #{c.authorBadge} {c.authorName}{" "}
                          <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>({c.authorRank})</span>
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {new Date(c.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {c.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddComment}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Taktiksel öneri, istihbarat veya brifing mesajı yazın..."
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "0.84rem",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: 6,
                    backgroundColor: "var(--LAC-orange)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── NEW PLAN MODAL ── */}
      {showNewPlanModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <form
            onSubmit={handleCreatePlan}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1.75rem",
              width: "100%",
              maxWidth: 500,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Yeni Taktiksel Operasyon Planı Oluştur
            </h3>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Operasyon Adı *
              </label>
              <input
                required
                type="text"
                value={newPlanForm.title}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                placeholder="Örn: Pacific Standard Bankası Müdahale Planı"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Bölge / Adres *
                </label>
                <input
                  required
                  type="text"
                  value={newPlanForm.location}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, location: e.target.value })}
                  placeholder="Vinewood Blvd"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Risk Seviyesi
                </label>
                <select
                  value={newPlanForm.riskLevel}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, riskLevel: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="DÜŞÜK">Düşük Risk</option>
                  <option value="ORTA">Orta Risk</option>
                  <option value="YÜKSEK">Yüksek Risk</option>
                  <option value="KRİTİK">Kritik (SWAT / Ağır Silah)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Taktik Kroki Şablonu
              </label>
              <select
                value={newPlanForm.mapType}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, mapType: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                }}
              >
                <option value="BUILDING">Müstakil Bina & Mülk Baskını</option>
                <option value="BANK">Banka / Kuyumcu Soygunu Krokisi</option>
                <option value="INTERSECTION">Şehir Kavşağı & Blok Krokisi</option>
                <option value="GRID">Boş Taktik Sektör Izgarası</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setShowNewPlanModal(false)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: 6,
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: 6,
                  backgroundColor: "var(--LAC-orange)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Planı Oluştur
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
