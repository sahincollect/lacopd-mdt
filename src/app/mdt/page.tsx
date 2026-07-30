"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Mini Sparkline ─────────────────────────────── */
function SparkLine({ color = "#1D6EF7" }: { color?: string }) {
  const pts = [28, 40, 33, 52, 38, 58, 45, 50, 62, 54, 68, 58];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = (v: number) => 100 - ((v - min) / (max - min)) * 76 - 12;
  const pathD = pts
    .map((v, i) => `${(i / (pts.length - 1)) * 100},${norm(v)}`)
    .join(" L ");
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: "100%", height: 52, display: "block" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${pathD} 100,100`}
        fill={`url(#${id})`}
      />
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        points={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

/* ─── Quick links ────────────────────────────────── */
const QUICK_LINKS = [
  { icon: "fa-pen-to-square",   label: "Yeni Rapor",      href: "/mdt/raporlar",    color: "#E84F2A" },
  { icon: "fa-users",           label: "Personel",        href: "/mdt/personel",    color: "#1D6EF7" },
  { icon: "fa-fingerprint",     label: "Kriminal",        href: "/mdt/kriminal",    color: "#8b5cf6" },
  { icon: "fa-scale-balanced",  label: "Yönetmelik",      href: "/mdt/yonetmelikler", color: "#f59e0b" },
  { icon: "fa-bullhorn",        label: "Duyurular",       href: "/mdt/duyurular",   color: "#06b6d4" },
  { icon: "fa-calendar-xmark",  label: "İzin / Mazeret",  href: "/mdt/mazeretler",  color: "#ec4899" },
];

/* ─── Page ───────────────────────────────────────── */
export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }            = useSWR("/api/auth/me", fetcher);
  const { data: officersData, mutate: mutateOfficers }= useSWR("/api/officers", fetcher);
  const { data: reportsData }                         = useSWR("/api/reports", fetcher);
  const { data: shiftsData }                          = useSWR("/api/shifts", fetcher);

  const loading        = !officersData || !reportsData || !meData;
  const user           = meData?.user ?? null;
  const officers       = officersData?.officers ?? [];
  const allReports     = reportsData?.reports ?? [];
  const recentReports  = allReports.slice(0, 6);
  const onDuty         = officers.filter((o: any) => o.isOnDuty);
  const myEntry        = shiftsData?.leaderboard?.find((e: any) => e.id === user?.id);
  const myHours        = ((myEntry?.totalSeconds ?? 0) / 3600).toFixed(1);

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
        style: { background: "#1a1a1a", color: "#f5f5f5", border: "1px solid rgba(255,255,255,0.08)" },
        id: "duty-toast",
      });
      mutateMe(); mutateOfficers();
    } catch {
      mutateMe({ user }, false); mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally { setToggling(false); }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  /* ─── Stat cards config ─── */
  const STATS = [
    { label: "Toplam Personel", value: loading ? "—" : String(officers.length), sub: "kayıtlı memur",    icon: "fa-users",     color: "#1D6EF7" },
    { label: "Sahada Birim",   value: loading ? "—" : String(onDuty.length),    sub: `${officers.length > 0 ? Math.round(onDuty.length / officers.length * 100) : 0}% aktif`, icon: "fa-car-side",  color: "#22c55e" },
    { label: "Toplam Rapor",   value: loading ? "—" : String(allReports.length),sub: "sisteme girilmiş", icon: "fa-file-lines",color: "#f59e0b" },
    { label: "Mesaim",         value: loading ? "—" : `${myHours}s`,            sub: "toplam saat",      icon: "fa-clock",     color: "#8b5cf6" },
  ];

  /* ─── Styles ─── */
  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, var(--mdt-card-bg) 0%, rgba(20,20,20,0.4) 100%)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--mdt-border)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 24px -8px rgba(0,0,0,0.3)",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--mdt-text-muted)",
              margin: "0 0 0.5rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}
          >
            L.A.C.P.D.
            <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            MERKEZ
            <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>DASHBOARD</span>
          </p>
          <h1
            style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              margin: 0,
              color: "var(--mdt-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontFamily: "'Inter', sans-serif",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}
          >
            Hoş Geldin, <span style={{ color: "var(--mdt-text-primary)" }}>{user?.name?.split(" ")[0] ?? "Memur"}</span> 👋
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--mdt-text-secondary)", fontWeight: 500 }}>
              #{user?.badge ?? "—"}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--mdt-border)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--mdt-text-secondary)", fontWeight: 500 }}>
              {user?.rank ?? "—"}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--mdt-border)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--mdt-accent)", fontWeight: 600, background: "rgba(232,79,42,0.1)", padding: "0.2rem 0.5rem", borderRadius: 4 }}>
              MDT v3.2
            </span>
          </div>
        </div>

        {/* Duty toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleDuty}
          disabled={toggling || !user}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            padding: "0.85rem 1.75rem",
            borderRadius: 12,
            border: user?.isOnDuty ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.1)",
            background: user?.isOnDuty ? "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)" : "linear-gradient(135deg, var(--mdt-card-bg) 0%, rgba(20,20,20,0.8) 100%)",
            color: user?.isOnDuty ? "#4ade80" : "var(--mdt-text-secondary)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: toggling || !user ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: toggling ? 0.6 : 1,
            letterSpacing: "0.02em",
            boxShadow: user?.isOnDuty ? "0 4px 20px -5px rgba(34,197,94,0.3)" : "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          <motion.span
            animate={user?.isOnDuty ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: user?.isOnDuty ? "#4ade80" : "var(--mdt-text-muted)",
              boxShadow: user?.isOnDuty ? "0 0 12px #4ade80" : "none",
              flexShrink: 0,
            }}
          />
          <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.8rem" }} />
          {user?.isOnDuty ? "Görevi Sonlandır" : "Göreve Başla"}
        </motion.button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, borderColor: `rgba(${s.color === "#1D6EF7" ? "29,110,247" : s.color === "#22c55e" ? "34,197,94" : s.color === "#f59e0b" ? "245,158,11" : "139,92,246"},0.4)` }}
            style={{
              ...cardStyle,
              padding: "1.5rem 1.5rem 0",
              position: "relative",
              transition: "all 0.25s ease",
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "1.5rem",
                right: "1.5rem",
                height: 3,
                borderRadius: "0 0 4px 4px",
                background: `linear-gradient(90deg, ${s.color} 0%, transparent 100%)`,
                opacity: 0.8,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--mdt-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${s.color}15 0%, transparent 100%)`,
                  border: `1px solid ${s.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `inset 0 2px 10px ${s.color}10`,
                }}
              >
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "1rem" }} />
              </div>
            </div>

            <div
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: "var(--mdt-text-primary)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "'Inter', sans-serif",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)"
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: s.color,
                fontWeight: 600,
                marginTop: "0.5rem",
                paddingBottom: "1rem",
                opacity: 0.9,
              }}
            >
              {s.sub}
            </div>

            <SparkLine color={s.color} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN GRID ── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left – Recent Reports */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)"
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--mdt-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(29,110,247,0.15) 0%, rgba(29,110,247,0.05) 100%)",
                  border: "1px solid rgba(29,110,247,0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-file-lines" style={{ color: "#3b82f6", fontSize: "0.85rem" }} />
              </span>
              Son Eklenen Raporlar
            </h3>
            <Link
              href="/mdt/raporlar"
              style={{
                fontSize: "0.78rem",
                color: "var(--mdt-accent)",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 8,
                background: "rgba(232,79,42,0.05)",
                transition: "all 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(232,79,42,0.1)")}
              onMouseOut={e => (e.currentTarget.style.background = "rgba(232,79,42,0.05)")}
            >
              Tümünü Gör <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.7rem" }} />
            </Link>
          </div>

          <div style={{ padding: "0.5rem" }}>
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.9rem" }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ display: "block", fontSize: "1.8rem", marginBottom: "0.8rem", color: "var(--mdt-accent)" }} />
                Veriler yükleniyor...
              </div>
            ) : recentReports.length === 0 ? (
              <div style={{ padding: "5rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.9rem" }}>
                <i className="fa-solid fa-folder-open" style={{ display: "block", fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.2 }} />
                Sistemde henüz rapor bulunmuyor.
              </div>
            ) : (
              recentReports.map((rep: any, idx: number) => (
                <Link key={rep.id} href="/mdt/raporlar" style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ x: 4, background: "rgba(255,255,255,0.03)" }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      borderRadius: 10,
                      margin: "0.25rem",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(29,110,247,0.06)",
                        border: "1px solid rgba(29,110,247,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-file-alt" style={{ color: "#3b82f6", fontSize: "0.9rem" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "var(--mdt-text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "0.15rem"
                        }}
                      >
                        {rep.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ color: "var(--mdt-text-secondary)", fontWeight: 500 }}>#{rep.officer?.badge ?? "—"} {rep.officer?.name}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--mdt-border)" }} />
                        {timeAgo(rep.createdAt)}
                      </div>
                    </div>

                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <i className="fa-solid fa-chevron-right" style={{ color: "var(--mdt-text-muted)", fontSize: "0.7rem", opacity: 0.7 }} />
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Active Patrols */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.01)"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--mdt-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#4ade80",
                    boxShadow: "0 0 12px rgba(74,222,128,0.6)",
                    display: "inline-block",
                  }}
                />
                Canlı Devriye
              </h3>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#4ade80",
                  background: "rgba(74,222,128,0.1)",
                  padding: "0.3rem 0.8rem",
                  borderRadius: 20,
                  border: "1px solid rgba(74,222,128,0.2)",
                  boxShadow: "0 2px 10px rgba(74,222,128,0.05)"
                }}
              >
                {onDuty.length} Aktif
              </span>
            </div>

            <div style={{ padding: "0.5rem" }}>
              {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>Yükleniyor...</div>
              ) : onDuty.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>
                  <i className="fa-solid fa-car-side" style={{ display: "block", fontSize: "2rem", marginBottom: "0.8rem", opacity: 0.2 }} />
                  Sahada aktif birim yok.
                </div>
              ) : (
                <AnimatePresence>
                  {onDuty.slice(0, 6).map((o: any, idx: number) => (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.85rem 1rem",
                        borderRadius: 10,
                        margin: "0.25rem",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid transparent",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(74,222,128,0.03)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(74,222,128,0.1)";
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.01)";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.05) 100%)",
                          border: "2px solid rgba(74,222,128,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 0 15px rgba(74,222,128,0.1)"
                        }}
                      >
                        {o.profileImage
                          ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <i className="fa-solid fa-user" style={{ fontSize: "0.8rem", color: "#4ade80" }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--mdt-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {o.name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--mdt-text-muted)", marginTop: 2 }}>
                          #{o.badge} · {o.rank}
                        </div>
                      </div>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: "50%", background: "rgba(74,222,128,0.1)", 
                        display: "flex", alignItems: "center", justifyContent: "center" 
                      }}>
                        <i className="fa-solid fa-location-dot" style={{ color: "#4ade80", fontSize: "0.65rem" }} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div
              style={{
                padding: "0.85rem 1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)"
              }}
            >
              <Link
                href="/mdt/mesai"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--mdt-text-secondary)",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  transition: "color 0.2s"
                }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--mdt-text-primary)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--mdt-text-secondary)")}
              >
                Tüm Mesai Verilerini Gör
                <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.7rem" }} />
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div style={{ ...cardStyle }}>
             <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.01)"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--mdt-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, rgba(232,79,42,0.15) 0%, rgba(232,79,42,0.05) 100%)",
                    border: "1px solid rgba(232,79,42,0.2)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-bolt" style={{ color: "#E84F2A", fontSize: "0.85rem" }} />
                </span>
                Hızlı Erişim
              </h3>
            </div>

            <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {QUICK_LINKS.map((ql, i) => (
                <Link key={i} href={ql.href} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      padding: "1.25rem 0.5rem",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(255,255,255,0.02)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      textAlign: "center",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `linear-gradient(135deg, ${ql.color}15 0%, transparent 100%)`;
                      el.style.borderColor = `${ql.color}40`;
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(255,255,255,0.02)";
                      el.style.borderColor = "rgba(255,255,255,0.05)";
                    }}
                  >
                    <div style={{ 
                      width: 38, height: 38, borderRadius: 10, background: `${ql.color}15`, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "0.2rem"
                    }}>
                      <i className={`fa-solid ${ql.icon}`} style={{ fontSize: "1.1rem", color: ql.color }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mdt-text-primary)", lineHeight: 1.2 }}>
                      {ql.label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

