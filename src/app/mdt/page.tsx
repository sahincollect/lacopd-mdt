"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Mini Sparkline ─────────────────────────────── */
function SparkLine({ color = "#1D6EF7" }: { color?: string }) {
  const pts = [28, 40, 33, 52, 38, 58, 45, 50, 62, 54, 68, 58];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = (v: number) => 100 - ((v - min) / (max - min)) * 70 - 15;
  const pathD = pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${norm(v)}`).join(" L ");
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 44, display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pathD} 100,100`} fill={`url(#${id})`} />
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        points={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Live clock ─── */
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.78rem",
      fontWeight: 600,
      color: "rgba(29,110,247,0.7)",
      letterSpacing: "0.12em",
    }}>{time}</span>
  );
}

/* ─── Helpers ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

/* ─── Quick links ─── */
const QUICK_LINKS = [
  { icon: "fa-pen-to-square",  label: "Yeni Rapor",     href: "/mdt/raporlar",      color: "#E84F2A" },
  { icon: "fa-users",          label: "Personel",       href: "/mdt/personel",      color: "#1D6EF7" },
  { icon: "fa-fingerprint",    label: "Kriminal",       href: "/mdt/kriminal",      color: "#8b5cf6" },
  { icon: "fa-scale-balanced", label: "Yönetmelik",     href: "/mdt/yonetmelikler", color: "#f59e0b" },
  { icon: "fa-bullhorn",       label: "Duyurular",      href: "/mdt/duyurular",     color: "#06b6d4" },
  { icon: "fa-calendar-xmark", label: "İzin / Mazeret", href: "/mdt/mazeretler",    color: "#ec4899" },
];

/* ─── Glassmorphism card base ─── */
const glassCard: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(13,18,32,0.9) 0%, rgba(10,14,26,0.8) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(29,110,247,0.1)",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
};

/* ─── Stat card accent map ─── */
const ACCENT_MAP: Record<string, string> = {
  "#1D6EF7": "29,110,247",
  "#22c55e": "34,197,94",
  "#f59e0b": "245,158,11",
  "#8b5cf6": "139,92,246",
};

/* ─── Page ─── */
export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }            = useSWR("/api/auth/me", fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher);
  const { data: reportsData }                          = useSWR("/api/reports", fetcher);
  const { data: shiftsData }                           = useSWR("/api/shifts", fetcher);

  const loading       = !officersData || !reportsData || !meData;
  const user          = meData?.user ?? null;
  const officers      = officersData?.officers ?? [];
  const allReports    = reportsData?.reports ?? [];
  const recentReports = allReports.slice(0, 6);
  const onDuty        = officers.filter((o: any) => o.isOnDuty);
  const myEntry       = shiftsData?.leaderboard?.find((e: any) => e.id === user?.id);
  const myHours       = ((myEntry?.totalSeconds ?? 0) / 3600).toFixed(1);

  const [toggling, setToggling] = useState(false);

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    const next = !user.isOnDuty;
    mutateMe({ user: { ...user, isOnDuty: next } }, false);
    if (officersData?.officers)
      mutateOfficers({ officers: officersData.officers.map((o: any) => o.id === user.id ? { ...o, isOnDuty: next } : o) }, false);
    setToggling(true);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", {
        style: { background: "#0d1220", color: "#e8ecf5", border: "1px solid rgba(29,110,247,0.2)" },
        id: "duty-toast",
      });
      mutateMe(); mutateOfficers();
    } catch {
      mutateMe({ user }, false); mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally { setToggling(false); }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  const STATS = [
    { label: "Toplam Personel", value: loading ? "—" : String(officers.length), sub: "kayıtlı memur",    icon: "fa-users",      color: "#1D6EF7" },
    { label: "Sahada Birim",    value: loading ? "—" : String(onDuty.length),    sub: `${officers.length > 0 ? Math.round(onDuty.length / officers.length * 100) : 0}% aktif`, icon: "fa-car-side",   color: "#22c55e" },
    { label: "Toplam Rapor",    value: loading ? "—" : String(allReports.length), sub: "sisteme girilmiş", icon: "fa-file-lines", color: "#f59e0b" },
    { label: "Mesaim",          value: loading ? "—" : `${myHours}s`,            sub: "toplam saat",      icon: "fa-clock",      color: "#8b5cf6" },
  ];

  const containerVar = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVar = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .stat-card { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .stat-card:hover { transform: translateY(-4px); }
        .report-row { transition: all 0.18s ease; }
        .report-row:hover { background: rgba(29,110,247,0.04) !important; padding-left: 1.5rem !important; }
        .quick-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .quick-btn:hover { transform: translateY(-3px) scale(1.02); }
        .patrol-row { transition: all 0.15s ease; }
        .patrol-row:hover { background: rgba(34,197,94,0.04) !important; border-color: rgba(34,197,94,0.15) !important; }
      `}</style>

      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVar}
        style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: 1400, margin: "0 auto" }}
      >
        {/* ─────────────── HERO HEADER ─────────────── */}
        <motion.div
          variants={itemVar}
          style={{
            ...glassCard,
            padding: "2rem 2.25rem",
            background: "linear-gradient(135deg, rgba(29,110,247,0.08) 0%, rgba(13,18,32,0.95) 50%, rgba(10,14,26,0.9) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 220, height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,110,247,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Bottom accent line */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(29,110,247,0.4) 40%, rgba(29,110,247,0.4) 60%, transparent 100%)",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", position: "relative", zIndex: 1 }}>
            <div>
              {/* Top label */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  fontSize: "0.62rem", fontWeight: 700,
                  color: "rgba(29,110,247,0.55)",
                  letterSpacing: "0.28em", textTransform: "uppercase",
                }}>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.6rem" }} />
                  L.A.C.P.D. · Merkez · Dashboard
                </div>
                <div style={{ width: 1, height: 12, background: "rgba(29,110,247,0.2)" }} />
                <LiveClock />
              </div>

              {/* Name */}
              <h1 style={{
                fontSize: "2.4rem",
                fontWeight: 900,
                margin: 0,
                color: "#e8ecf5",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}>
                Hoş Geldin,{" "}
                <span style={{
                  background: "linear-gradient(90deg, #4A8EFA 0%, #1D6EF7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {user?.name?.split(" ")[0] ?? "Memur"}
                </span>
              </h1>

              {/* Badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.3rem 0.75rem",
                  borderRadius: 20,
                  background: "rgba(29,110,247,0.08)",
                  border: "1px solid rgba(29,110,247,0.18)",
                  fontSize: "0.72rem", fontWeight: 700,
                  color: "rgba(200,208,230,0.7)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <i className="fa-solid fa-id-badge" style={{ color: "rgba(29,110,247,0.6)", fontSize: "0.62rem" }} />
                  #{user?.badge ?? "—"}
                </div>
                <div style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 20,
                  background: "rgba(29,110,247,0.05)",
                  border: "1px solid rgba(29,110,247,0.12)",
                  fontSize: "0.72rem", fontWeight: 600,
                  color: "rgba(200,208,230,0.6)",
                }}>
                  {user?.rank ?? "—"}
                </div>
                <div style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 20,
                  background: "rgba(232,79,42,0.08)",
                  border: "1px solid rgba(232,79,42,0.2)",
                  fontSize: "0.68rem", fontWeight: 700,
                  color: "#E84F2A",
                  letterSpacing: "0.05em",
                }}>
                  MDT v3.2
                </div>
              </div>
            </div>

            {/* Duty toggle */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                display: "flex", alignItems: "center", gap: "0.85rem",
                padding: "0.9rem 2rem",
                borderRadius: 12,
                border: user?.isOnDuty ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(29,110,247,0.2)",
                background: user?.isOnDuty
                  ? "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)"
                  : "linear-gradient(135deg, rgba(29,110,247,0.1) 0%, rgba(29,110,247,0.03) 100%)",
                color: user?.isOnDuty ? "#4ade80" : "rgba(200,208,230,0.6)",
                fontWeight: 700, fontSize: "0.88rem",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                opacity: toggling ? 0.6 : 1,
                letterSpacing: "0.03em",
                boxShadow: user?.isOnDuty
                  ? "0 4px 20px -5px rgba(34,197,94,0.25), 0 0 0 1px rgba(34,197,94,0.1)"
                  : "0 4px 20px -5px rgba(29,110,247,0.2), 0 0 0 1px rgba(29,110,247,0.05)",
                transition: "all 0.22s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              <motion.span
                animate={user?.isOnDuty ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  backgroundColor: user?.isOnDuty ? "#4ade80" : "rgba(200,208,230,0.25)",
                  boxShadow: user?.isOnDuty ? "0 0 12px rgba(74,222,128,0.7)" : "none",
                  flexShrink: 0,
                }}
              />
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.78rem" }} />
              {user?.isOnDuty ? "Görevi Sonlandır" : "Göreve Başla"}
            </motion.button>
          </div>
        </motion.div>

        {/* ─────────────── STAT CARDS ─────────────── */}
        <motion.div
          variants={itemVar}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.1rem" }}
        >
          {STATS.map((s, i) => {
            const rgb = ACCENT_MAP[s.color] ?? "29,110,247";
            return (
              <div
                key={i}
                className="stat-card"
                style={{
                  ...glassCard,
                  padding: "1.4rem 1.4rem 0",
                  position: "relative",
                  border: `1px solid rgba(${rgb},0.15)`,
                }}
              >
                {/* Top glow border */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent 0%, ${s.color} 40%, ${s.color} 60%, transparent 100%)`,
                  opacity: 0.7,
                }} />
                {/* Ambient glow */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 120, height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(${rgb},0.08) 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem", position: "relative" }}>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 800,
                    color: "rgba(200,208,230,0.4)",
                    textTransform: "uppercase", letterSpacing: "0.2em",
                    lineHeight: 1.3,
                  }}>
                    {s.label}
                  </span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `rgba(${rgb},0.08)`,
                    border: `1px solid rgba(${rgb},0.2)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 0 16px rgba(${rgb},0.1)`,
                  }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "0.9rem" }} />
                  </div>
                </div>

                <div style={{
                  fontSize: "2.6rem", fontWeight: 900,
                  color: "#e8ecf5",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontFamily: "'JetBrains Mono', monospace",
                  position: "relative",
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: "0.72rem", color: s.color, fontWeight: 600,
                  marginTop: "0.4rem", paddingBottom: "0.85rem", opacity: 0.85,
                }}>
                  {s.sub}
                </div>

                <SparkLine color={s.color} />
              </div>
            );
          })}
        </motion.div>

        {/* ─────────────── MAIN GRID ─────────────── */}
        <motion.div
          variants={itemVar}
          style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}
        >
          {/* LEFT — Son Raporlar */}
          <div style={glassCard}>
            {/* Card header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "1.15rem 1.4rem",
              borderBottom: "1px solid rgba(29,110,247,0.08)",
              background: "linear-gradient(90deg, rgba(29,110,247,0.04) 0%, transparent 100%)",
            }}>
              <h3 style={{
                margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#e8ecf5",
                display: "flex", alignItems: "center", gap: "0.65rem",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(29,110,247,0.1)",
                  border: "1px solid rgba(29,110,247,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 10px rgba(29,110,247,0.1)",
                }}>
                  <i className="fa-solid fa-file-lines" style={{ color: "#1D6EF7", fontSize: "0.8rem" }} />
                </div>
                Son Eklenen Raporlar
              </h3>
              <Link
                href="/mdt/raporlar"
                style={{
                  fontSize: "0.72rem", color: "#1D6EF7", fontWeight: 600,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.38rem 0.8rem", borderRadius: 8,
                  background: "rgba(29,110,247,0.06)",
                  border: "1px solid rgba(29,110,247,0.15)",
                  transition: "all 0.18s ease",
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(29,110,247,0.12)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,110,247,0.3)";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(29,110,247,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,110,247,0.15)";
                }}
              >
                Tümünü Gör <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
              </Link>
            </div>

            {/* Report list */}
            <div style={{ padding: "0.5rem 0.75rem" }}>
              {loading ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "rgba(200,208,230,0.3)" }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ display: "block", fontSize: "1.6rem", marginBottom: "0.75rem", color: "rgba(29,110,247,0.5)" }} />
                  <span style={{ fontSize: "0.82rem" }}>Veriler yükleniyor...</span>
                </div>
              ) : recentReports.length === 0 ? (
                <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "rgba(29,110,247,0.05)", border: "1px solid rgba(29,110,247,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}>
                    <i className="fa-solid fa-folder-open" style={{ color: "rgba(29,110,247,0.25)", fontSize: "1.4rem" }} />
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(200,208,230,0.35)", fontWeight: 500 }}>
                    Sistemde henüz rapor bulunmuyor.
                  </div>
                </div>
              ) : (
                recentReports.map((rep: any) => (
                  <Link key={rep.id} href="/mdt/raporlar" style={{ textDecoration: "none", display: "block" }}>
                    <div
                      className="report-row"
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "0.9rem 1rem",
                        borderRadius: 10,
                        borderBottom: "1px solid rgba(29,110,247,0.05)",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 9,
                        background: "rgba(29,110,247,0.06)",
                        border: "1px solid rgba(29,110,247,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <i className="fa-solid fa-file-alt" style={{ color: "#1D6EF7", fontSize: "0.85rem" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.86rem", fontWeight: 600, color: "#e8ecf5",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          marginBottom: "0.18rem",
                        }}>
                          {rep.title}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(200,208,230,0.38)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ color: "rgba(200,208,230,0.55)", fontWeight: 500 }}>#{rep.officer?.badge ?? "—"} {rep.officer?.name}</span>
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(29,110,247,0.3)", display: "inline-block" }} />
                          {timeAgo(rep.createdAt)}
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right" style={{ color: "rgba(29,110,247,0.3)", fontSize: "0.65rem" }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Canlı Devriye */}
            <div style={glassCard}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1.15rem 1.4rem",
                borderBottom: "1px solid rgba(34,197,94,0.08)",
                background: "linear-gradient(90deg, rgba(34,197,94,0.04) 0%, transparent 100%)",
              }}>
                <h3 style={{
                  margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#e8ecf5",
                  display: "flex", alignItems: "center", gap: "0.6rem",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 0.9, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    style={{
                      width: 9, height: 9, borderRadius: "50%",
                      backgroundColor: "#4ade80",
                      boxShadow: "0 0 10px rgba(74,222,128,0.7)",
                      display: "inline-block",
                    }}
                  />
                  Canlı Devriye
                </h3>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 800,
                  color: onDuty.length > 0 ? "#4ade80" : "rgba(200,208,230,0.4)",
                  background: onDuty.length > 0 ? "rgba(74,222,128,0.08)" : "rgba(29,110,247,0.04)",
                  padding: "0.28rem 0.75rem", borderRadius: 20,
                  border: `1px solid ${onDuty.length > 0 ? "rgba(74,222,128,0.25)" : "rgba(29,110,247,0.1)"}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {onDuty.length} AKTİF
                </span>
              </div>

              <div style={{ padding: "0.5rem" }}>
                {loading ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.3)", fontSize: "0.8rem" }}>Yükleniyor...</div>
                ) : onDuty.length === 0 ? (
                  <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
                    <i className="fa-solid fa-car-side" style={{ display: "block", fontSize: "1.6rem", marginBottom: "0.6rem", color: "rgba(29,110,247,0.15)" }} />
                    <div style={{ fontSize: "0.8rem", color: "rgba(200,208,230,0.3)" }}>Sahada aktif birim yok.</div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {onDuty.slice(0, 5).map((o: any, idx: number) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="patrol-row"
                        style={{
                          display: "flex", alignItems: "center", gap: "0.85rem",
                          padding: "0.75rem 0.9rem",
                          borderRadius: 9,
                          margin: "0.2rem",
                          border: "1px solid transparent",
                          cursor: "default",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "rgba(34,197,94,0.08)",
                          border: "1.5px solid rgba(34,197,94,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden", flexShrink: 0,
                          boxShadow: "0 0 10px rgba(34,197,94,0.08)",
                        }}>
                          {o.profileImage
                            ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <i className="fa-solid fa-user" style={{ fontSize: "0.75rem", color: "#4ade80" }} />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e8ecf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {o.name}
                          </div>
                          <div style={{ fontSize: "0.65rem", color: "rgba(200,208,230,0.38)", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                            #{o.badge} · {o.rank}
                          </div>
                        </div>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: "rgba(34,197,94,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className="fa-solid fa-location-dot" style={{ color: "#4ade80", fontSize: "0.6rem" }} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div style={{ padding: "0.8rem 1.4rem", borderTop: "1px solid rgba(34,197,94,0.06)", background: "rgba(34,197,94,0.02)" }}>
                <Link
                  href="/mdt/mesai"
                  style={{
                    fontSize: "0.72rem", color: "rgba(200,208,230,0.4)", fontWeight: 600,
                    textDecoration: "none", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "0.4rem", transition: "color 0.18s ease",
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = "#4ade80")}
                  onMouseOut={e => (e.currentTarget.style.color = "rgba(200,208,230,0.4)")}
                >
                  Tüm Mesai Verilerini Gör
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
                </Link>
              </div>
            </div>

            {/* Hızlı Erişim */}
            <div style={glassCard}>
              <div style={{
                padding: "1.15rem 1.4rem",
                borderBottom: "1px solid rgba(232,79,42,0.08)",
                background: "linear-gradient(90deg, rgba(232,79,42,0.04) 0%, transparent 100%)",
              }}>
                <h3 style={{
                  margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#e8ecf5",
                  display: "flex", alignItems: "center", gap: "0.6rem",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(232,79,42,0.08)", border: "1px solid rgba(232,79,42,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className="fa-solid fa-bolt" style={{ color: "#E84F2A", fontSize: "0.78rem" }} />
                  </div>
                  Hızlı Erişim
                </h3>
              </div>

              <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                {QUICK_LINKS.map((ql, i) => (
                  <Link key={i} href={ql.href} style={{ textDecoration: "none" }}>
                    <div
                      className="quick-btn"
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: "0.5rem",
                        padding: "1.15rem 0.5rem",
                        borderRadius: 11,
                        border: "1px solid rgba(255,255,255,0.05)",
                        background: "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                      }}
                      onMouseOver={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `linear-gradient(135deg, ${ql.color}10 0%, transparent 100%)`;
                        el.style.borderColor = `${ql.color}35`;
                        el.style.boxShadow = `0 4px 20px ${ql.color}15`;
                      }}
                      onMouseOut={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "rgba(255,255,255,0.02)";
                        el.style.borderColor = "rgba(255,255,255,0.05)";
                        el.style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: `${ql.color}12`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}>
                        <i className={`fa-solid ${ql.icon}`} style={{ fontSize: "1rem", color: ql.color }} />
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(200,208,230,0.65)", lineHeight: 1.2 }}>
                        {ql.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
