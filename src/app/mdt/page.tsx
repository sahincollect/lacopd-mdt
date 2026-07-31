"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/* ─── Live clock ─── */
function LiveClock() {
  const [t, setT] = useState({ time: "", date: "" });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({
        time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        date: d.toLocaleDateString("tr-TR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right", lineHeight: 1.3 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 700, color: "#e8ecf5", letterSpacing: "0.08em" }}>{t.time}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "rgba(29,110,247,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.1rem" }}>{t.date}</div>
    </div>
  );
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "Az önce";
  if (s < 3600) return `${Math.floor(s / 60)} dk`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa`;
  return `${Math.floor(s / 86400)} gün`;
}

function formatSecs(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sc.toString().padStart(2, "0")}`;
}

const QUICK = [
  { icon: "fa-pen-to-square", label: "Rapor Yaz",    href: "/mdt/raporlar",      color: "#E84F2A", bg: "rgba(232,79,42,0.08)" },
  { icon: "fa-fingerprint",   label: "Kriminal",      href: "/mdt/kriminal",      color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { icon: "fa-users",         label: "Personel",      href: "/mdt/personel",      color: "#1D6EF7", bg: "rgba(29,110,247,0.08)" },
  { icon: "fa-clock",         label: "Mesai",         href: "/mdt/mesai",         color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  { icon: "fa-bullhorn",      label: "Duyurular",     href: "/mdt/duyurular",     color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  { icon: "fa-scale-balanced",label: "Yönetmelik",    href: "/mdt/yonetmelikler", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { icon: "fa-calendar-xmark",label: "Mazeret/İzin",  href: "/mdt/mazeretler",    color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  { icon: "fa-envelope",      label: "Mesajlar",      href: "/mdt/mesajlar",      color: "#34d399", bg: "rgba(52,211,153,0.08)" },
];

const RANK_MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7f32", "rgba(99,102,241,0.7)", "rgba(99,102,241,0.5)"];

/* ─── Shared glass card style ─── */
const glass: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(10,15,28,0.92) 0%, rgba(7,11,22,0.88) 100%)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(29,110,247,0.12)",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const cardHdr: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0.9rem 1.2rem",
  borderBottom: "1px solid rgba(29,110,247,0.08)",
  background: "linear-gradient(90deg, rgba(29,110,247,0.06) 0%, transparent 70%)",
};

const label: React.CSSProperties = {
  fontSize: "0.55rem", fontWeight: 800,
  color: "rgba(29,110,247,0.4)", letterSpacing: "0.24em", textTransform: "uppercase",
};

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }             = useSWR("/api/auth/me", fetcher, { refreshInterval: 30000 });
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher, { refreshInterval: 15000 });
  const { data: reportsData }                          = useSWR("/api/reports",  fetcher, { refreshInterval: 30000 });
  const { data: shiftsData,   mutate: mutateShifts }   = useSWR("/api/shifts",   fetcher, { refreshInterval: 10000 });

  const user       = meData?.user ?? null;
  const officers   = officersData?.officers ?? [];
  const allReports = reportsData?.reports ?? [];
  const onDuty     = officers.filter((o: any) => o.isOnDuty);
  const leaderboard: any[] = shiftsData?.leaderboard ?? [];
  const topShift   = [...leaderboard].slice(0, 5);
  const myEntry    = leaderboard.find((e: any) => e.id === user?.id);
  const myRank     = leaderboard.findIndex((e: any) => e.id === user?.id) + 1;

  const [toggling, setToggling] = useState(false);

  /* ─── Live tick state — initialized from API, then increments every second for on-duty officers ─── */
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});
  const ticksInitialized = useRef(false);

  // Sync ticks when fresh data arrives from API (including activeLogStart)
  useEffect(() => {
    if (!shiftsData?.leaderboard) return;
    const ticks: Record<number, number> = {};
    shiftsData.leaderboard.forEach((off: any) => {
      ticks[off.id] = off.totalSeconds ?? 0;
    });
    setLiveTicks(ticks);
    ticksInitialized.current = true;
  }, [shiftsData]);

  // Tick every second for on-duty officers
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks(prev => {
        if (!shiftsData?.leaderboard) return prev;
        const next = { ...prev };
        shiftsData.leaderboard.forEach((off: any) => {
          if (off.isOnDuty) {
            next[off.id] = (next[off.id] ?? off.totalSeconds ?? 0) + 1;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [shiftsData]);

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    const next = !user.isOnDuty;
    mutateMe({ user: { ...user, isOnDuty: next } }, false);
    if (officersData?.officers)
      mutateOfficers({ officers: officersData.officers.map((o: any) => o.id === user.id ? { ...o, isOnDuty: next } : o) }, false);
    setToggling(true);
    try {
      await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: next }),
      });
      toast.success(next ? "✦ Devriye başlatıldı." : "Devriye sonlandırıldı.", {
        style: { background: "#070b16", color: "#e8ecf5", border: "1px solid rgba(29,110,247,0.25)", fontFamily: "'JetBrains Mono', monospace" },
      });
      await Promise.all([mutateMe(), mutateOfficers(), mutateShifts()]);
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setToggling(false);
    }
  }, [user, toggling, mutateMe, mutateOfficers, mutateShifts, officersData]);

  const loading = !meData || !officersData || !reportsData;

  const myLiveSecs = liveTicks[user?.id ?? -1] ?? myEntry?.totalSeconds ?? 0;

  const STATS = [
    {
      label: "Toplam Personel", value: officers.length,
      sub: "kayıtlı memur", icon: "fa-users", color: "#1D6EF7",
      pct: null,
    },
    {
      label: "Sahada Birim", value: onDuty.length,
      sub: `${officers.length ? Math.round(onDuty.length / officers.length * 100) : 0}% aktif`,
      icon: "fa-car-side", color: "#22c55e",
      pct: officers.length ? onDuty.length / officers.length : 0,
    },
    {
      label: "Toplam Rapor", value: allReports.length,
      sub: "sisteme girilmiş", icon: "fa-file-lines", color: "#f59e0b",
      pct: null,
    },
    {
      label: "Mesai Sürem", value: formatSecs(myLiveSecs),
      sub: myRank > 0 ? `Sıralama #${myRank}` : "—",
      icon: "fa-trophy", color: "#8b5cf6",
      pct: null, mono: true,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 6px #22c55e} 50%{box-shadow:0 0 18px #22c55e} }
        @keyframes pulse-blue  { 0%,100%{box-shadow:0 0 6px #1D6EF7} 50%{box-shadow:0 0 18px #1D6EF7} }
        @keyframes scanline    { 0%{background-position:0 -100%} 100%{background-position:0 400%} }
        .stat-card { transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
        .stat-card:hover { transform: translateY(-3px) !important; border-color: rgba(29,110,247,0.35) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(29,110,247,0.08) !important; }
        .ql-item { transition: all 0.18s ease; }
        .ql-item:hover { background: rgba(29,110,247,0.1) !important; border-color: rgba(29,110,247,0.3) !important; transform: translateY(-1px); }
        .rep-row  { transition: all 0.18s ease; border-left: 2px solid transparent; }
        .rep-row:hover  { background: rgba(29,110,247,0.05) !important; border-left-color: #1D6EF7 !important; }
        .pat-row  { transition: all 0.18s ease; border-left: 2px solid transparent; }
        .pat-row:hover  { background: rgba(34,197,94,0.05) !important; border-left-color: #22c55e !important; }
        .duty-btn { transition: all 0.28s cubic-bezier(0.4,0,0.2,1); }
        .duty-btn:hover:not(:disabled) { filter: brightness(1.18) !important; transform: scale(1.04) !important; }
        .vlink { transition: color 0.15s ease; }
        .vlink:hover { color: #1D6EF7 !important; }
        .lb-row { transition: background 0.15s; }
        .lb-row:hover { background: rgba(29,110,247,0.04) !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", maxWidth: 1440, margin: "0 auto", paddingBottom: "2rem" }}>

        {/* ═══════════ ROW 1 — HERO BANNER ═══════════ */}
        <div style={{
          ...glass,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
          padding: "1.6rem 2.2rem",
          borderTop: "2px solid rgba(29,110,247,0.3)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Scanline ambient */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(29,110,247,0.012) 2px, rgba(29,110,247,0.012) 4px)",
          }} />
          {/* Corner accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 280, height: 280, pointerEvents: "none",
            background: "radial-gradient(ellipse at top right, rgba(29,110,247,0.07) 0%, transparent 65%)" }} />

          {/* Left */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.7rem" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "rgba(29,110,247,0.5)", fontSize: "0.62rem" }} />
              <span style={{ ...label }}>L.A.C.P.D. · KOMUTA MERKEZİ · MDT v3.2</span>
              <span style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.15rem 0.6rem", borderRadius: 20,
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: "#22c55e",
                  animation: "pulse-green 2s infinite", display: "inline-block",
                }} />
                <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#22c55e", letterSpacing: "0.12em" }}>CANLI</span>
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: "2.1rem", fontWeight: 900, color: "#e8ecf5", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Hoş Geldin,{" "}
              <span style={{
                background: "linear-gradient(100deg, #6aadff 0%, #1D6EF7 60%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {loading ? "—" : user?.name?.split(" ")[0] ?? "Memur"}
              </span>
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 700,
                color: "#1D6EF7", background: "rgba(29,110,247,0.1)",
                padding: "0.22rem 0.7rem", borderRadius: 4, border: "1px solid rgba(29,110,247,0.2)",
              }}>#{user?.badge ?? "—"}</span>
              <span style={{
                fontSize: "0.7rem", color: "rgba(200,208,230,0.5)",
                padding: "0.22rem 0.7rem", borderRadius: 4, border: "1px solid rgba(29,110,247,0.08)",
              }}>{user?.rank ?? "—"}</span>
              <span style={{
                fontSize: "0.7rem", color: "rgba(200,208,230,0.35)",
                padding: "0.22rem 0.7rem", borderRadius: 4, border: "1px solid rgba(29,110,247,0.06)",
              }}>{user?.department ?? "—"}</span>
            </div>
          </div>

          {/* Right — clock + duty btn */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1.1rem", position: "relative" }}>
            <LiveClock />
            <button
              className="duty-btn"
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                display: "flex", alignItems: "center", gap: "0.7rem",
                padding: "0.75rem 1.75rem", borderRadius: 8,
                border: user?.isOnDuty ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(29,110,247,0.3)",
                background: user?.isOnDuty
                  ? "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.06) 100%)"
                  : "linear-gradient(135deg, rgba(29,110,247,0.18) 0%, rgba(29,110,247,0.06) 100%)",
                color: user?.isOnDuty ? "#4ade80" : "#e8ecf5",
                fontWeight: 800, fontSize: "0.78rem", textTransform: "uppercase",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                opacity: toggling ? 0.6 : 1,
                letterSpacing: "0.1em",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: user?.isOnDuty
                  ? "0 0 24px rgba(34,197,94,0.15), inset 0 0 12px rgba(34,197,94,0.05)"
                  : "0 0 24px rgba(29,110,247,0.1), inset 0 0 12px rgba(29,110,247,0.05)",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: user?.isOnDuty ? "#4ade80" : "rgba(200,208,230,0.25)",
                animation: user?.isOnDuty ? "pulse-green 1.5s infinite" : undefined,
              }} />
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.68rem" }} />
              {toggling ? "İŞLENİYOR..." : user?.isOnDuty ? "GÖREVİ BİTİR" : "GÖREVE BAŞLA"}
            </button>
          </div>
        </div>

        {/* ═══════════ ROW 2 — STAT CARDS ═══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{
              ...glass,
              padding: "1.25rem 1.3rem",
              display: "flex", flexDirection: "column", gap: "0.6rem",
              borderTop: `2px solid ${s.color}35`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...label }}>{s.label}</span>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${s.color}10`, border: `1px solid ${s.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: "0.72rem", color: s.color }} />
                </div>
              </div>
              <div style={{
                fontFamily: (s as any).mono ? "'JetBrains Mono', monospace" : "inherit",
                fontSize: (s as any).mono ? "1.45rem" : "2.4rem",
                fontWeight: 900, color: "#e8ecf5", lineHeight: 1.1,
                letterSpacing: (s as any).mono ? "0.04em" : "-0.04em",
              }}>
                {loading ? <span style={{ opacity: 0.15 }}>—</span> : s.value}
              </div>
              {s.pct !== null && s.pct !== undefined && (
                <div style={{ height: 2, borderRadius: 2, background: "rgba(29,110,247,0.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round(s.pct * 100)}%`,
                    background: `linear-gradient(90deg, ${s.color}60, ${s.color})`,
                    borderRadius: 2, transition: "width 1s ease",
                  }} />
                </div>
              )}
              <div style={{ fontSize: "0.68rem", color: s.color, fontWeight: 600, opacity: 0.75 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══════════ ROW 3 — 3-COL GRID ═══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 290px", gap: "1rem", alignItems: "start" }}>

          {/* ── Col 1: Son Raporlar ── */}
          <div style={glass}>
            <div style={cardHdr}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(29,110,247,0.1)", border: "1px solid rgba(29,110,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-file-lines" style={{ fontSize: "0.68rem", color: "#1D6EF7" }} />
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d8e0f0" }}>Son Raporlar</span>
              </div>
              <Link href="/mdt/raporlar" className="vlink" style={{ fontSize: "0.65rem", color: "rgba(29,110,247,0.45)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", letterSpacing: "0.05em" }}>
                TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.52rem" }} />
              </Link>
            </div>
            <div style={{ padding: "0.35rem 0" }}>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.18)", fontSize: "0.76rem" }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Yükleniyor...
                </div>
              ) : allReports.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.18)", fontSize: "0.76rem" }}>Henüz rapor girilmemiş.</div>
              ) : (
                allReports.slice(0, 8).map((r: any) => (
                  <Link key={r.id} href="/mdt/raporlar" style={{ textDecoration: "none", display: "block" }}>
                    <div className="rep-row" style={{
                      display: "flex", alignItems: "center", gap: "0.8rem",
                      padding: "0.65rem 1.1rem 0.65rem 1.3rem",
                      borderBottom: "1px solid rgba(29,110,247,0.04)",
                    }}>
                      <div style={{ width: 5, height: 5, background: "#1D6EF7", borderRadius: "50%", flexShrink: 0, boxShadow: "0 0 6px rgba(29,110,247,0.7)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#d8e0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                        <div style={{ fontSize: "0.62rem", color: "rgba(200,208,230,0.35)", marginTop: 3, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.65)", background: "rgba(29,110,247,0.07)", padding: "0.08rem 0.3rem", borderRadius: 2 }}>#{r.officer?.badge}</span>
                          <span style={{ color: "rgba(200,208,230,0.15)" }}>·</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right" style={{ color: "rgba(29,110,247,0.25)", fontSize: "0.5rem", flexShrink: 0 }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Col 2: Canlı Devriye ── */}
          <div style={glass}>
            <div style={cardHdr}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-car-side" style={{ fontSize: "0.68rem", color: "#22c55e" }} />
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d8e0f0" }}>Canlı Devriye</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", fontWeight: 800,
                color: onDuty.length > 0 ? "#22c55e" : "rgba(200,208,230,0.2)",
                padding: "0.18rem 0.6rem", borderRadius: 20,
                background: onDuty.length > 0 ? "rgba(34,197,94,0.08)" : "rgba(29,110,247,0.04)",
                border: `1px solid ${onDuty.length > 0 ? "rgba(34,197,94,0.22)" : "rgba(29,110,247,0.07)"}`,
              }}>
                {onDuty.length} AKTİF
              </span>
            </div>
            <div style={{ padding: "0.35rem 0" }}>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.18)", fontSize: "0.76rem" }}>Yükleniyor...</div>
              ) : onDuty.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                  <i className="fa-solid fa-car-side" style={{ display: "block", fontSize: "1.5rem", marginBottom: "0.6rem", color: "rgba(29,110,247,0.08)" }} />
                  <span style={{ fontSize: "0.76rem", color: "rgba(200,208,230,0.18)" }}>Sahada aktif birim yok.</span>
                </div>
              ) : (
                onDuty.map((o: any) => {
                  const initials = o.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                  return (
                    <div key={o.id} className="pat-row" style={{
                      display: "flex", alignItems: "center", gap: "0.8rem",
                      padding: "0.65rem 1.1rem 0.65rem 1.3rem",
                      borderBottom: "1px solid rgba(34,197,94,0.04)",
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 6, flexShrink: 0,
                        background: o.profileImage ? "transparent" : "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                      }}>
                        {o.profileImage
                          ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(34,197,94,0.7)", fontFamily: "'JetBrains Mono', monospace" }}>{initials}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d8e0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                        <div style={{ fontSize: "0.62rem", color: "rgba(200,208,230,0.35)", marginTop: 3, display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(34,197,94,0.65)", background: "rgba(34,197,94,0.07)", padding: "0.08rem 0.3rem", borderRadius: 2 }}>#{o.badge}</span>
                          <span style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>{o.rank}</span>
                        </div>
                      </div>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, animation: "pulse-green 2s infinite" }} />
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ padding: "0.65rem 1.1rem", borderTop: "1px solid rgba(34,197,94,0.05)" }}>
              <Link href="/mdt/mesai" className="vlink" style={{ fontSize: "0.65rem", color: "rgba(200,208,230,0.25)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                TÜM MESAİ LİSTESİ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.52rem" }} />
              </Link>
            </div>
          </div>

          {/* ── Col 3: Hızlı Erişim + Mesai Sıralaması ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Hızlı Erişim */}
            <div style={glass}>
              <div style={cardHdr}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(232,79,42,0.1)", border: "1px solid rgba(232,79,42,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-bolt" style={{ fontSize: "0.68rem", color: "#E84F2A" }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d8e0f0" }}>Hızlı Erişim</span>
                </div>
              </div>
              <div style={{ padding: "0.65rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
                {QUICK.map((q, i) => (
                  <Link key={i} href={q.href} style={{ textDecoration: "none" }}>
                    <div className="ql-item" style={{
                      display: "flex", alignItems: "center", gap: "0.55rem",
                      padding: "0.6rem 0.75rem", borderRadius: 6,
                      background: q.bg, border: `1px solid ${q.color}18`,
                      cursor: "pointer",
                    }}>
                      <i className={`fa-solid ${q.icon}`} style={{ fontSize: "0.75rem", color: q.color, width: 14, textAlign: "center" }} />
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(200,208,230,0.65)", letterSpacing: "0.02em" }}>{q.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Mesai Sıralaması */}
            <div style={glass}>
              <div style={cardHdr}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-ranking-star" style={{ fontSize: "0.68rem", color: "#f59e0b" }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d8e0f0" }}>Top Mesai</span>
                </div>
                <Link href="/mdt/mesai" className="vlink" style={{ fontSize: "0.62rem", color: "rgba(29,110,247,0.4)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.05em" }}>
                  TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.5rem" }} />
                </Link>
              </div>
              <div style={{ padding: "0.35rem 0" }}>
                {!shiftsData ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "rgba(200,208,230,0.18)", fontSize: "0.72rem" }}>Yükleniyor...</div>
                ) : topShift.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "rgba(200,208,230,0.18)", fontSize: "0.72rem" }}>Henüz mesai kaydı yok.</div>
                ) : (
                  topShift.map((e: any, i: number) => {
                    const currentSecs = liveTicks[e.id] ?? e.totalSeconds ?? 0;
                    return (
                      <div key={e.id} className="lb-row" style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.6rem 1rem",
                        borderBottom: "1px solid rgba(29,110,247,0.04)",
                      }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem",
                          fontWeight: 900, color: RANK_COLORS[i] ?? "rgba(200,208,230,0.25)",
                          width: 22, textAlign: "center", flexShrink: 0,
                        }}>
                          {i < 3 ? RANK_MEDAL[i] : `#${i + 1}`}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d8e0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                          {e.isOnDuty && (
                            <div style={{ fontSize: "0.55rem", color: "#22c55e", fontWeight: 600, marginTop: 1, letterSpacing: "0.08em" }}>● AKTİF</div>
                          )}
                        </div>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.62rem", fontWeight: 800,
                          color: e.isOnDuty ? "#22c55e" : "rgba(29,110,247,0.6)",
                          background: e.isOnDuty ? "rgba(34,197,94,0.08)" : "rgba(29,110,247,0.06)",
                          padding: "0.12rem 0.4rem", borderRadius: 3,
                          border: `1px solid ${e.isOnDuty ? "rgba(34,197,94,0.25)" : "transparent"}`,
                          animation: e.isOnDuty ? "pulse-green 2s infinite" : undefined,
                          flexShrink: 0,
                        }}>
                          {formatSecs(currentSecs)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
