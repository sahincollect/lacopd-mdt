"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";

interface TacticalMarker {
  id: string;
  category: "UNIT" | "SUSPECT" | "DIRECTIVE_PIN";
  type: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

interface TacticalDirective {
  id: string;
  phase: string;
  priority: "NORMAL" | "YÜKSEK" | "KRİTİK";
  assignedTo: string;
  text: string;
  completed: boolean;
}

interface TacticalComment {
  id: string;
  authorName: string;
  authorBadge: string;
  authorRank: string;
  content: string;
  createdAt: string;
}

interface TacticalPlan {
  id: string;
  title: string;
  location: string;
  riskLevel: "DÜŞÜK" | "ORTA" | "YÜKSEK" | "KRİTİK";
  status: "PLANLANIYOR" | "AKTİF OPERASYON" | "TAMAMLANDI";
  commander: string;
  mapType: "BUILDING" | "INTERSECTION" | "GRID" | "CUSTOM";
  customMapUrl?: string;
  summary: string;
  createdAt: string;
  markers: TacticalMarker[];
  directives: TacticalDirective[];
  comments: TacticalComment[];
}

const MARKER_PALETTE = [
  // UNITS
  {
    type: "PATROL",
    category: "UNIT" as const,
    name: "Devriye Birimi",
    defaultLabel: "1-ADAM-12",
    defaultSub: "Çevre Güvenliği",
    icon: "fa-car-on",
    bg: "#041632",
    border: "#3b82f6",
    text: "#ffffff",
  },
  {
    type: "SWAT",
    category: "UNIT" as const,
    name: "SWAT Ekibi",
    defaultLabel: "SWAT-1",
    defaultSub: "Birincil Giriş",
    icon: "fa-shield-halved",
    bg: "#0f172a",
    border: "#38bdf8",
    text: "#38bdf8",
  },
  {
    type: "SNIPER",
    category: "UNIT" as const,
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
    category: "UNIT" as const,
    name: "Hava Desteği",
    defaultLabel: "AIR-1",
    defaultSub: "Hava Gözlem",
    icon: "fa-helicopter",
    bg: "#0c4a6e",
    border: "#0ea5e9",
    text: "#e0f2fe",
  },
  {
    type: "K9",
    category: "UNIT" as const,
    name: "K-9 Birimi",
    defaultLabel: "K9-1",
    defaultSub: "Arama & Takip",
    icon: "fa-paw",
    bg: "#78350f",
    border: "#f59e0b",
    text: "#fef3c7",
  },
  {
    type: "PERIMETER",
    category: "UNIT" as const,
    name: "Barikat / Yol Kapama",
    defaultLabel: "BARİKAT",
    defaultSub: "Trafik Kapalı",
    icon: "fa-road-barrier",
    bg: "#1e293b",
    border: "#94a3b8",
    text: "#f8fafc",
  },
  // SUSPECTS & TARGETS
  {
    type: "ARMED_SUSPECT",
    category: "SUSPECT" as const,
    name: "Silahlı Şüpheli",
    defaultLabel: "Şüpheli #1",
    defaultSub: "Silahlı / Tehlikeli",
    icon: "fa-person-rifle",
    bg: "#991b1b",
    border: "#ef4444",
    text: "#ffffff",
  },
  {
    type: "SUSPECT_VEHICLE",
    category: "SUSPECT" as const,
    name: "Şüpheli / Kaçış Aracı",
    defaultLabel: "Şüpheli Araç",
    defaultSub: "Kaçış İhtimali",
    icon: "fa-car-burst",
    bg: "#7f1d1d",
    border: "#f87171",
    text: "#fecaca",
  },
  {
    type: "HOSTAGE",
    category: "SUSPECT" as const,
    name: "Rehine / Sivil",
    defaultLabel: "Rehine",
    defaultSub: "Sivil Güvende Tutulmalı",
    icon: "fa-Hands-bound",
    bg: "#92400e",
    border: "#fbbf24",
    text: "#ffffff",
  },
  // TACTICAL PINS
  {
    type: "BREACH",
    category: "DIRECTIVE_PIN" as const,
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
    category: "DIRECTIVE_PIN" as const,
    name: "Komuta / Toplanma",
    defaultLabel: "KOMUTA",
    defaultSub: "Kriz Merkezi",
    icon: "fa-flag",
    bg: "#312e81",
    border: "#818cf8",
    text: "#e0e7ff",
  },
];

export default function TaktikselPlanlamaPage() {
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const { data: plansData, mutate: mutatePlans } = useSWR("/api/tactical-plans", fetcher, {
    refreshInterval: 6000,
  });

  const user = meData?.user || null;
  const plans: TacticalPlan[] = plansData?.plans || [];

  const [activePlanId, setActivePlanId] = useState<string>("");
  const [localPlan, setLocalPlan] = useState<TacticalPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Placement & Dragging state
  const [placingTool, setPlacingTool] = useState<(typeof MARKER_PALETTE)[number] | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // New Directive form
  const [dirPhase, setDirPhase] = useState("AŞAMA 1");
  const [dirPriority, setDirPriority] = useState<"NORMAL" | "YÜKSEK" | "KRİTİK">("YÜKSEK");
  const [dirAssigned, setDirAssigned] = useState("");
  const [dirText, setDirText] = useState("");

  // New Comment form
  const [commentText, setCommentText] = useState("");

  // New Plan modal
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    title: "",
    location: "",
    riskLevel: "YÜKSEK",
    mapType: "BUILDING",
    summary: "",
  });

  useEffect(() => {
    if (plans.length > 0 && !activePlanId) {
      setActivePlanId(plans[0].id);
      setLocalPlan(plans[0]);
    } else if (plans.length > 0 && activePlanId) {
      const found = plans.find((p) => p.id === activePlanId);
      if (found && !draggingId) {
        setLocalPlan(found);
      }
    }
  }, [plans, activePlanId, draggingId]);

  const selectPlan = (p: TacticalPlan) => {
    setActivePlanId(p.id);
    setLocalPlan(p);
    setSelectedMarkerId(null);
    setPlacingTool(null);
  };

  const persistPlan = async (updatedPlan: TacticalPlan, silent = false) => {
    setLocalPlan(updatedPlan);
    setSaving(true);
    try {
      const res = await fetch("/api/tactical-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_PLAN", plan: updatedPlan }),
      });
      if (res.ok) {
        mutatePlans();
        if (!silent) toast.success("Taktiksel plan güncellendi.");
      } else {
        toast.error("Plan kaydedilemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
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
          summary: newPlanForm.summary.trim(),
          commander: user ? `${user.rank} ${user.name} (#${user.badge})` : "Komuta Merkezi",
        }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        toast.success("Yeni taktiksel operasyon planı oluşturuldu.");
        setShowNewPlanModal(false);
        setNewPlanForm({ title: "", location: "", riskLevel: "YÜKSEK", mapType: "BUILDING", summary: "" });
        await mutatePlans();
        setActivePlanId(data.plan.id);
        setLocalPlan(data.plan);
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

  // Board click to place marker
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!localPlan || !boardRef.current) return;
    if (!placingTool) {
      setSelectedMarkerId(null);
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    const newMarker: TacticalMarker = {
      id: `mk-${Date.now()}`,
      category: placingTool.category,
      type: placingTool.type,
      label: placingTool.defaultLabel,
      sublabel: placingTool.defaultSub,
      x,
      y,
    };

    const updated: TacticalPlan = {
      ...localPlan,
      markers: [...localPlan.markers, newMarker],
    };
    setPlacingTool(null);
    setSelectedMarkerId(newMarker.id);
    persistPlan(updated, true);
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !localPlan || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setLocalPlan((prev) =>
      prev
        ? {
            ...prev,
            markers: prev.markers.map((m) => (m.id === draggingId ? { ...m, x, y } : m)),
          }
        : null
    );
  };

  const handleBoardMouseUp = () => {
    if (draggingId && localPlan) {
      setDraggingId(null);
      persistPlan(localPlan, true);
    }
  };

  const handleUpdateSelectedMarker = (field: "label" | "sublabel", value: string) => {
    if (!localPlan || !selectedMarkerId) return;
    const updated: TacticalPlan = {
      ...localPlan,
      markers: localPlan.markers.map((m) => (m.id === selectedMarkerId ? { ...m, [field]: value } : m)),
    };
    setLocalPlan(updated);
  };

  const handleDeleteMarker = (id: string) => {
    if (!localPlan) return;
    const updated: TacticalPlan = {
      ...localPlan,
      markers: localPlan.markers.filter((m) => m.id !== id),
    };
    setSelectedMarkerId(null);
    persistPlan(updated, true);
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
    const updated: TacticalPlan = {
      ...localPlan,
      directives: [...localPlan.directives, newDir],
    };
    setDirText("");
    setDirAssigned("");
    persistPlan(updated);
  };

  const toggleDirective = (id: string) => {
    if (!localPlan) return;
    const updated: TacticalPlan = {
      ...localPlan,
      directives: localPlan.directives.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)),
    };
    persistPlan(updated, true);
  };

  const deleteDirective = (id: string) => {
    if (!localPlan) return;
    const updated: TacticalPlan = {
      ...localPlan,
      directives: localPlan.directives.filter((d) => d.id !== id),
    };
    persistPlan(updated, true);
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
    const updated: TacticalPlan = {
      ...localPlan,
      comments: [...localPlan.comments, newComment],
    };
    setCommentText("");
    persistPlan(updated, true);
  };

  const selectedMarker = localPlan?.markers.find((m) => m.id === selectedMarkerId) || null;

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "2.5rem" }}>
      {/* ── PAGE HEADER ── */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--LAC-orange)", letterSpacing: "0.04em", marginBottom: "0.2rem" }}>
            LAPD TACTICAL OPERATIONS // SAHA KOORDİNASYON & BRİFİNG MERKEZİ
          </div>
          <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Taktiksel Planlama ve Operasyon Tahtası
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            value={activePlanId}
            onChange={(e) => {
              const found = plans.find((p) => p.id === e.target.value);
              if (found) selectPlan(found);
            }}
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontWeight: 600,
              minWidth: 260,
              cursor: "pointer",
            }}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.title} ({p.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNewPlanModal(true)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: 6,
              backgroundColor: "var(--LAC-orange)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <i className="fa-solid fa-plus" />
            Yeni Operasyon Planı
          </button>
        </div>
      </div>

      {localPlan && (
        <>
          {/* ── ACTIVE OPERATION SUMMARY BAR ── */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderLeft: "4px solid #041632",
              borderRadius: 8,
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    padding: "0.2rem 0.55rem",
                    borderRadius: 4,
                    border: "1px solid var(--border-light)",
                  }}
                >
                  {localPlan.id}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: 4,
                    backgroundColor:
                      localPlan.riskLevel === "KRİTİK"
                        ? "rgba(220,38,38,0.12)"
                        : localPlan.riskLevel === "YÜKSEK"
                        ? "rgba(234,88,12,0.12)"
                        : "rgba(2,132,199,0.12)",
                    color:
                      localPlan.riskLevel === "KRİTİK"
                        ? "#dc2626"
                        : localPlan.riskLevel === "YÜKSEK"
                        ? "#ea580c"
                        : "#0284c7",
                  }}
                >
                  RİSK: {localPlan.riskLevel}
                </span>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--LAC-orange)", marginRight: 5 }} />
                  {localPlan.location}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  • Komutan: <strong style={{ color: "var(--text-primary)" }}>{localPlan.commander}</strong>
                </span>
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{localPlan.title}</div>
              {localPlan.summary && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{localPlan.summary}</div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <select
                value={localPlan.status}
                onChange={(e) =>
                  persistPlan({
                    ...localPlan,
                    status: e.target.value as TacticalPlan["status"],
                  })
                }
                style={{
                  padding: "0.45rem 0.75rem",
                  borderRadius: 6,
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <option value="PLANLANIYOR">Durum: Planlanıyor</option>
                <option value="AKTİF OPERASYON">Durum: Aktif Operasyon</option>
                <option value="TAMAMLANDI">Durum: Tamamlandı</option>
              </select>

              <select
                value={localPlan.mapType}
                onChange={(e) =>
                  persistPlan({
                    ...localPlan,
                    mapType: e.target.value as TacticalPlan["mapType"],
                  })
                }
                style={{
                  padding: "0.45rem 0.75rem",
                  borderRadius: 6,
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <option value="BUILDING">Kroki: Bina & Mülk Baskını</option>
                <option value="INTERSECTION">Kroki: Kavşak & Şehir Bloğu</option>
                <option value="GRID">Kroki: Taktik Sektör Izgarası</option>
              </select>

              {plans.length > 1 && (
                <button
                  onClick={() => handleDeletePlan(localPlan.id)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    borderRadius: 6,
                    backgroundColor: "var(--color-danger-bg)",
                    border: "1px solid var(--color-danger-border)",
                    color: "var(--color-danger)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-trash" /> Planı Sil
                </button>
              )}
            </div>
          </div>

          {/* ── MAIN TACTICAL WORKSPACE (BOARD LEFT + DIRECTIVES/DISCUSSION RIGHT) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* ── LEFT COLUMN: INTERACTIVE TACTICAL BOARD ── */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Palette Toolbar */}
              <div
                style={{
                  padding: "0.9rem 1.25rem",
                  borderBottom: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Haritaya Eleman Ekle (Seçip Kroki Üzerine Tıklayın, Taşımak İçin Sürükleyin)
                  </span>
                  {placingTool && (
                    <button
                      onClick={() => setPlacingTool(null)}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-danger)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Seçimi İptal Et
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {MARKER_PALETTE.map((item) => {
                    const isSelected = placingTool?.type === item.type;
                    return (
                      <button
                        key={item.type}
                        onClick={() => setPlacingTool(isSelected ? null : item)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.38rem 0.65rem",
                          borderRadius: 6,
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          backgroundColor: isSelected ? item.bg : "var(--bg-secondary)",
                          color: isSelected ? "#ffffff" : "var(--text-primary)",
                          border: isSelected ? `2px solid ${item.border}` : "1px solid var(--border-strong)",
                          transition: "all 0.12s ease",
                        }}
                      >
                        <i
                          className={`fa-solid ${item.icon}`}
                          style={{ color: isSelected ? "#ffffff" : item.bg === "#991b1b" ? "#dc2626" : "var(--LAC-orange)" }}
                        />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tactical Map Canvas */}
              <div
                ref={boardRef}
                onClick={handleBoardClick}
                onMouseMove={handleBoardMouseMove}
                onMouseUp={handleBoardMouseUp}
                onMouseLeave={handleBoardMouseUp}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 520,
                  backgroundColor: "#0b1528",
                  cursor: placingTool ? "crosshair" : "default",
                  userSelect: "none",
                  overflow: "hidden",
                }}
              >
                {/* SVG Architectural / Tactical Background */}
                <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                  <defs>
                    <pattern id="tacGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
                    </pattern>
                    <pattern id="tacSubGrid" width="250" height="200" patternUnits="userSpaceOnUse">
                      <rect width="250" height="200" fill="none" stroke="rgba(148,163,184,0.24)" strokeWidth="1.5" />
                    </pattern>
                  </defs>

                  <rect width="1000" height="600" fill="url(#tacGrid)" />
                  <rect width="1000" height="600" fill="url(#tacSubGrid)" />

                  {localPlan.mapType === "BUILDING" && (
                    <g>
                      {/* Roads */}
                      <rect x="0" y="470" width="1000" height="90" fill="rgba(30,41,59,0.75)" stroke="rgba(148,163,184,0.3)" />
                      <line x1="0" y1="515" x2="1000" y2="515" stroke="rgba(250,204,21,0.45)" strokeWidth="2" strokeDasharray="16 12" />
                      <text x="30" y="500" fill="rgba(255,255,255,0.45)" fontSize="13" fontWeight="700">
                        ANA BULVAR (GÜNEY ÇEMBERİ)
                      </text>

                      {/* Outer Yard / Fence */}
                      <rect
                        x="220"
                        y="90"
                        width="560"
                        height="350"
                        fill="rgba(15,23,42,0.55)"
                        stroke="rgba(148,163,184,0.4)"
                        strokeWidth="2"
                        strokeDasharray="8 6"
                      />
                      <text x="235" y="115" fill="rgba(148,163,184,0.6)" fontSize="12" fontWeight="600">
                        MÜLK BAHÇE SINIRI / ARKA KORİDOR
                      </text>

                      {/* Main Target Building */}
                      <rect x="310" y="160" width="380" height="230" fill="rgba(30,58,138,0.28)" stroke="#60a5fa" strokeWidth="3" />
                      {/* Internal Rooms */}
                      <line x1="500" y1="160" x2="500" y2="390" stroke="rgba(96,165,250,0.6)" strokeWidth="2" />
                      <line x1="310" y1="275" x2="690" y2="275" stroke="rgba(96,165,250,0.6)" strokeWidth="2" />

                      {/* Doors */}
                      <rect x="475" y="384" width="50" height="10" fill="#f97316" />
                      <text x="455" y="415" fill="#fdba74" fontSize="12" fontWeight="700">
                        ANA GİRİŞ KAPISI
                      </text>

                      <rect x="475" y="155" width="50" height="10" fill="#38bdf8" />
                      <text x="455" y="145" fill="#7dd3fc" fontSize="12" fontWeight="700">
                        ARKA ÇIKIŞ
                      </text>

                      <text x="360" y="225" fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700">
                        KUZEYBATI ODA
                      </text>
                      <text x="550" y="225" fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700">
                        ARKA ODA / DEPO
                      </text>
                      <text x="365" y="340" fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700">
                        ANA SALON
                      </text>
                      <text x="550" y="340" fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700">
                        GİRİŞ HOLÜ
                      </text>

                      {/* Adjacent structures */}
                      <rect x="70" y="150" width="110" height="240" fill="rgba(30,41,59,0.6)" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
                      <text x="90" y="275" fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="700">
                        BATI BİNA (ÇATI)
                      </text>

                      <rect x="820" y="150" width="110" height="240" fill="rgba(30,41,59,0.6)" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
                      <text x="840" y="275" fill="rgba(255,255,255,0.45)" fontSize="12" fontWeight="700">
                        DOĞU BİNA (ÇATI)
                      </text>
                    </g>
                  )}

                  {localPlan.mapType === "INTERSECTION" && (
                    <g>
                      {/* Horizontal & Vertical Roads */}
                      <rect x="0" y="230" width="1000" height="140" fill="rgba(30,41,59,0.85)" />
                      <rect x="420" y="0" width="160" height="600" fill="rgba(30,41,59,0.85)" />
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />
                      <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />

                      {/* 4 Corner City Blocks */}
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

                  {/* Sector Labels */}
                  {["A1", "A2", "A3", "A4"].map((sec, idx) => (
                    <text
                      key={sec}
                      x={idx * 250 + 14}
                      y={24}
                      fill="rgba(148,163,184,0.45)"
                      fontSize="12"
                      fontWeight="700"
                    >
                      SEKTÖR {sec}
                    </text>
                  ))}
                </svg>

                {/* Compass Indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "rgba(15,23,42,0.85)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    color: "#e2e8f0",
                    padding: "0.35rem 0.65rem",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    pointerEvents: "none",
                  }}
                >
                  K ↑ • TAKTİK KROKİ
                </div>

                {/* Placed Markers */}
                {localPlan.markers.map((m) => {
                  const meta = MARKER_PALETTE.find((p) => p.type === m.type) || MARKER_PALETTE[0];
                  const isSelected = selectedMarkerId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                        setDraggingId(m.id);
                      }}
                      style={{
                        position: "absolute",
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        transform: "translate(-50%, -50%)",
                        backgroundColor: meta.bg,
                        border: isSelected ? "2px solid #ffffff" : `2px solid ${meta.border}`,
                        color: meta.text,
                        padding: "0.35rem 0.65rem",
                        borderRadius: 6,
                        cursor: "grab",
                        boxShadow: isSelected
                          ? "0 0 0 3px rgba(232,79,42,0.7), 0 6px 16px rgba(0,0,0,0.5)"
                          : "0 4px 12px rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        whiteSpace: "nowrap",
                        zIndex: isSelected ? 20 : 10,
                      }}
                    >
                      <i className={`fa-solid ${meta.icon}`} style={{ fontSize: "0.85rem" }} />
                      <div>
                        <div style={{ fontSize: "0.76rem", fontWeight: 700, lineHeight: 1.1 }}>{m.label}</div>
                        {m.sublabel && (
                          <div style={{ fontSize: "0.66rem", opacity: 0.85, marginTop: 1 }}>{m.sublabel}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Marker Inspector Bar */}
              <div
                style={{
                  padding: "0.9rem 1.25rem",
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
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                        Seçili İşaret:
                      </span>
                      <input
                        type="text"
                        value={selectedMarker.label}
                        onChange={(e) => handleUpdateSelectedMarker("label", e.target.value)}
                        placeholder="Birim / Şüpheli Adı"
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: 6,
                          border: "1px solid var(--border-strong)",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          width: 170,
                        }}
                      />
                      <input
                        type="text"
                        value={selectedMarker.sublabel}
                        onChange={(e) => handleUpdateSelectedMarker("sublabel", e.target.value)}
                        placeholder="Görev / Not (Örn: Arka Kapı)"
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: 6,
                          border: "1px solid var(--border-strong)",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                          width: 210,
                        }}
                      />
                      <button
                        onClick={() => persistPlan(localPlan)}
                        style={{
                          padding: "0.42rem 0.85rem",
                          borderRadius: 6,
                          backgroundColor: "#041632",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Kaydet
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteMarker(selectedMarker.id)}
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
                      Haritadan Kaldır
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Harita üzerindeki herhangi bir birime veya şüpheliye tıklayarak adını/görevini düzenleyebilir veya sürükleyerek yerini değiştirebilirsiniz.
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: DIRECTIVES & TACTICAL DISCUSSION ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* 1. OPERATIONAL DIRECTIVES PANEL */}
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
                      Operasyon Direktifleri & Görev Dağılımı
                    </h2>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                      Birimlerin adım adım uygulayacağı taktik emirler
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

                {/* Directives List */}
                <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: 310, overflowY: "auto" }}>
                  {localPlan.directives.length === 0 ? (
                    <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      Henüz direktif eklenmedi. Aşağıdan yeni emir ekleyebilirsiniz.
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
                          opacity: d.completed ? 0.72 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={d.completed}
                          onChange={() => toggleDirective(d.id)}
                          style={{ marginTop: 4, cursor: "pointer", width: 16, height: 16 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-primary)", backgroundColor: "var(--bg-secondary)", padding: "0.1rem 0.45rem", borderRadius: 4, border: "1px solid var(--border-light)" }}>
                              {d.phase}
                            </span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                              {d.assignedTo}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-primary)",
                              textDecoration: d.completed ? "line-through" : "none",
                              lineHeight: 1.45,
                            }}
                          >
                            {d.text}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteDirective(d.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                          title="Direktifi Sil"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Directive Form */}
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

              {/* 2. TACTICAL DISCUSSION & BRIEFING FEED */}
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
                      Taktiksel Tartışma & İstihbarat Notları
                    </h2>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                      Operasyona katılan personelin görüş ve saha bildirimleri
                    </div>
                  </div>
                  <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    {localPlan.comments.length} Mesaj
                  </span>
                </div>

                <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 260, overflowY: "auto" }}>
                  {localPlan.comments.length === 0 ? (
                    <div style={{ padding: "1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.84rem" }}>
                      Bu plan için henüz tartışma notu girilmedi.
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            #{c.authorBadge} {c.authorName}{" "}
                            <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>({c.authorRank})</span>
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {new Date(c.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                          {c.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleAddComment}
                  style={{
                    padding: "0.85rem 1.25rem",
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
                    placeholder="Taktiksel öneri, istihbarat veya brifing notu yazın..."
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
                      padding: "0.55rem 1rem",
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
                placeholder="Örn: Grove St. Silah Deposu Baskını"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
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
                  placeholder="Doğu Los Santos"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.88rem",
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
                <option value="BUILDING">Bina & Mülk Baskını Krokisi</option>
                <option value="INTERSECTION">Şehir Kavşağı & Blok Krokisi</option>
                <option value="GRID">Taktiksel Sektör Izgarası</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Operasyon Özeti & İstihbarat
              </label>
              <textarea
                rows={3}
                value={newPlanForm.summary}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, summary: e.target.value })}
                placeholder="Operasyonun amacı, bilinen şüpheli sayısı ve dikkat edilecek hususlar..."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  resize: "vertical",
                }}
              />
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
