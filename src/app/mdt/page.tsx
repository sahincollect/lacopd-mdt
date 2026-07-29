"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const SkeletonLine = ({ w = "100%", h = "12px", mb = "0" }: { w?: string; h?: string; mb?: string }) => (
  <div style={{ width: w, height: h, borderRadius: "4px", background: "rgba(255,255,255,0.04)", marginBottom: mb }} />
);

const StatCard = ({ icon, label, value, color, delay }: { icon: string; label: string; value: string | number; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -2, borderColor: color }}
    style={{
      background: "rgba(11, 15, 25, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      borderRadius: "18px",
      padding: "1.4rem 1.6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      position: "relative",
      overflow: "hidden"
    }}
  >
    <div>
      <div style={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 900, color: "#FFF", fontFamily: "'Courier New', monospace", lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: "1.1rem", flexShrink: 0 }}>
      <i className={icon} />
    </div>
  </motion.div>
);

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR('/api/officers', fetcher);
  const { data: reportsData } = useSWR('/api/reports', fetcher);
  const { data: announcementsData } = useSWR('/api/announcements', fetcher);
  const { data: criminalsData } = useSWR('/api/criminals', fetcher);

  const loading = !officersData || !reportsData || !announcementsData || !criminalsData || !meData;
  const user = meData?.user || null;
  const officers = officersData?.officers || [];
  const allReports = reportsData?.reports || [];
  const totalReports = allReports.length;
  const reports = allReports.slice(0, 4);
  const announcements = (announcementsData?.announcements || []).slice(0, 3);
  const allCriminals = criminalsData?.criminals || [];
  const totalCriminals = allCriminals.length;
  const criminals = allCriminals.slice(0, 3);

  const [toggling, setToggling] = useState(false);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa önce`;
    return `${Math.floor(hrs / 24)} gün önce`;
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case "Acil": return { color: "#F87171", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)" };
      case "Dikkat": return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)" };
      case "Normal":
      default: return { color: "#38BDF8", bg: "rgba(56, 189, 248, 0.1)", border: "rgba(56, 189, 248, 0.3)" };
    }
  };

  const onDutyCount = officers.filter((o: any) => o.isOnDuty).length;

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    
    // 1. Optimistic Update (Anında Arayüz Değişimi)
    const newIsOnDuty = !user.isOnDuty;
    const optimisticUser = { ...user, isOnDuty: newIsOnDuty };
    mutateMe({ user: optimisticUser }, false);
    
    if (officersData?.officers) {
      const optimisticOfficers = officersData.officers.map((o: any) => 
        o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o
      );
      mutateOfficers({ officers: optimisticOfficers }, false);
    }

    setToggling(true); // Disable double clicks while in flight
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty })
      });
      if (res.ok) {
        toast.success(newIsOnDuty ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", {
          style: { background: "#0D111D", color: "#F8FAFC", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "0.85rem" },
          id: 'duty-toast'
        });
        mutateMe();
        mutateOfficers();
      } else {
        throw new Error();
      }
    } catch {
      // Revert optimistic update
      mutateMe({ user }, false);
      mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally {
      setToggling(false);
    }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  return (
    <div style={{ color: "#FFF", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <style jsx>{`
        @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.6; } }
        .row-hover { transition: all 0.15s ease; }
        .row-hover:hover { background-color: rgba(255,255,255,0.035) !important; transform: translateX(3px); }
      `}</style>

      {/* ── TOP HERO ISLAND: ZEN COMMAND CENTER & RADAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "stretch" }}>

        {/* Greeting & Tactical Radar Console */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "rgba(11, 15, 25, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "24px",
            padding: "2.25rem 2.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Top breathing glow line */}
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent)" }} />

          {/* Left info */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.28rem 0.75rem", borderRadius: "50px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", fontSize: "0.7rem", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.12em" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 8px #38BDF8" }} />
                SİSTEM AKTİF • KOD 4
              </span>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              HOŞ GELDİNİZ, OPERATÖR
            </div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#FFF", margin: "0.3rem 0 1rem 0", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {user?.name || "MEMUR"}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {user?.badge && (
                <span style={{ fontSize: "0.78rem", fontFamily: "'Courier New', monospace", fontWeight: 800, color: "#38BDF8", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "0.3rem 0.75rem", borderRadius: "8px" }}>
                  #{user.badge}
                </span>
              )}
              <span style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 600 }}>
                SECURE TERMINAL ACCESS GRANTED
              </span>
            </div>
          </div>

          {/* Right Radar & Pulse Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", paddingLeft: "2rem", borderLeft: "1px solid rgba(255, 255, 255, 0.06)" }}>
            
            {/* Holographic Radar Circle */}
            <div style={{ width: "135px", height: "135px", borderRadius: "50%", position: "relative", border: "1px solid rgba(56, 189, 248, 0.3)", background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(5, 6, 10, 0.6) 100%)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ position: "absolute", width: "65%", height: "65%", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", width: "30%", height: "30%", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(56, 189, 248, 0.25)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(56, 189, 248, 0.25)" }} />
              
              {/* Spinning sweep */}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "conic-gradient(from 0deg, rgba(56, 189, 248, 0) 0deg, rgba(56, 189, 248, 0.35) 88deg, rgba(56, 189, 248, 0.8) 90deg, rgba(56, 189, 248, 0) 90deg)", borderRadius: "50%", animation: "radar-spin 3s linear infinite" }} />
              
              {/* Center dot */}
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FFF", boxShadow: "0 0 8px #FFF", zIndex: 2 }} />

              {/* Active Officer Blips */}
              {officers.filter((o: any) => o.isOnDuty).slice(0, 4).map((officer: any, i: number) => {
                const angle = (i * 120) % 360;
                const radius = 25 + (i * 10) % 30;
                const top = 67 + radius * Math.sin(angle * Math.PI / 180);
                const left = 67 + radius * Math.cos(angle * Math.PI / 180);
                return (
                  <div key={officer.id} style={{ position: "absolute", top: `${top}px`, left: `${left}px`, width: "6px", height: "6px", backgroundColor: "#38BDF8", borderRadius: "50%", boxShadow: "0 0 10px #38BDF8", animation: "pulse-dot 2s infinite", transform: "translate(-50%, -50%)", zIndex: 3 }} />
                );
              })}
            </div>

            {/* Radar Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 6px #38BDF8" }} />
                CANLI RADAR
              </div>
              <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "#FFF", fontFamily: "'Courier New', monospace", lineHeight: 1, marginTop: "0.2rem" }}>
                {onDutyCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>
                Birim Sahada Devriyede
              </div>
            </div>

          </div>
        </motion.div>

        {/* Duty Action Trigger Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: user?.isOnDuty
              ? "linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.7))"
              : "rgba(11, 15, 25, 0.65)",
            border: `1px solid ${user?.isOnDuty ? "rgba(16, 185, 129, 0.35)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            minWidth: "250px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            backdropFilter: "blur(20px)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.8rem", borderRadius: "50px", background: user?.isOnDuty ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${user?.isOnDuty ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.08)"}` }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user?.isOnDuty ? "#34D399" : "#64748B", boxShadow: user?.isOnDuty ? "0 0 8px #34D399" : "none" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: user?.isOnDuty ? "#34D399" : "#94A3B8", letterSpacing: "0.08em" }}>
              {user?.isOnDuty ? "CANLI DEVRİYEDE" : "İSTİRAHATTE"}
            </span>
          </div>

          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: user?.isOnDuty ? "#34D399" : "#64748B" }}>
            <i className={user?.isOnDuty ? "fa-solid fa-shield-halved" : "fa-solid fa-shield"} />
          </div>

          <button
            onClick={toggleDuty}
            disabled={toggling || !user}
            style={{
              width: "100%",
              padding: "0.95rem 1.4rem",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              cursor: toggling || !user ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              ...(user?.isOnDuty
                ? {
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#F87171",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)"
                  }
                : {
                    background: "#FFF",
                    color: "#0B0F19",
                    boxShadow: "0 8px 30px rgba(255, 255, 255, 0.22)"
                  })
            }}
          >
            {user?.isOnDuty ? (
              <><i className="fa-solid fa-square" style={{ fontSize: "0.7rem" }} /> MESAİYİ KAPAT</>
            ) : (
              <><i className="fa-solid fa-play" style={{ fontSize: "0.7rem" }} /> DEVRİYEYE BAŞLA</>
            )}
          </button>
        </motion.div>
      </div>

      {/* ── 4 TACTICAL STAT PILLARS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.25rem" }}>
        <StatCard icon="fa-solid fa-users" label="TOPLAM PERSONEL" value={loading ? "—" : officers.length} color="#38BDF8" delay={0.1} />
        <StatCard icon="fa-solid fa-shield-halved" label="SAHADA AKTİF DEVRİYE" value={loading ? "—" : `${onDutyCount} / ${officers.length}`} color="#34D399" delay={0.15} />
        <StatCard icon="fa-solid fa-file-lines" label="TOPLAM RAPOR ARŞİVİ" value={loading ? "—" : totalReports} color="#818CF8" delay={0.2} />
        <StatCard icon="fa-solid fa-fingerprint" label="KRİMİNAL SUÇLU KAYDI" value={loading ? "—" : totalCriminals} color="#F59E0B" delay={0.25} />
      </div>

      {/* ── MAIN 3-COLUMN DATA SHOWCASE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

        {/* COLUMN 1: SON RAPORLAR */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={{ background: "rgba(11, 15, 25, 0.65)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "22px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(255,255,255,0.015)" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFF" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8", fontSize: "0.8rem" }}><i className="fa-solid fa-file-lines" /></span>
              SON RAPORLAR
            </h2>
            <a href="/rapor-portali" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "#FFF"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
              TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </a>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <SkeletonLine w="50%" mb="8px" />
                  <SkeletonLine w="90%" mb="6px" />
                  <SkeletonLine w="70%" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div style={{ color: "#64748B", fontSize: "0.85rem", padding: "3rem 1rem", textAlign: "center" }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.5rem", opacity: 0.4 }} />
                Henüz rapor girişi yapılmadı.
              </div>
            ) : reports.map((rep: any) => (
              <div key={rep.id} className="row-hover" style={{ padding: "1rem 1.2rem", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#38BDF8", fontWeight: 800 }}>#{rep.officer?.badge || "000"} {rep.officer?.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }}>{timeAgo(rep.createdAt)}</div>
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFF", marginBottom: "0.35rem" }}>{rep.title}</div>
                <div style={{ fontSize: "0.8rem", color: "#94A3B8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{rep.content}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* COLUMN 2: BİLDİRİMLER & DUYURULAR */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} style={{ background: "rgba(11, 15, 25, 0.65)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "22px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(255,255,255,0.015)" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFF" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", fontSize: "0.8rem" }}><i className="fa-solid fa-bullhorn" /></span>
              BİLDİRİMLER
            </h2>
            <Link href="/mdt/duyurular" style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "#FFF"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
              TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </Link>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
            {loading ? (
              [1, 2].map(i => (
                <div key={i} style={{ padding: "1.2rem", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <SkeletonLine w="40%" mb="8px" />
                  <SkeletonLine w="85%" mb="6px" />
                  <SkeletonLine w="70%" />
                </div>
              ))
            ) : announcements.length === 0 ? (
              <div style={{ color: "#64748B", fontSize: "0.85rem", padding: "3rem 1rem", textAlign: "center" }}>
                <i className="fa-solid fa-bell-slash" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.5rem", opacity: 0.4 }} />
                Aktif bildirim veya duyuru yok.
              </div>
            ) : announcements.map((ann: any) => {
              const styles = getTypeStyles(ann.type || "Normal");
              return (
                <div key={ann.id} style={{ padding: "1.2rem", background: styles.bg, borderRadius: "14px", border: `1px solid ${styles.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: styles.color, background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.6rem", borderRadius: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {ann.type || "DUYURU"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600 }}>{timeAgo(ann.createdAt)}</span>
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.4rem 0", color: "#FFF" }}>{ann.title}</h3>
                  <p style={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.5, margin: "0 0 0.8rem 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ann.content}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.72rem", color: "#94A3B8" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: styles.color, color: "#000", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>
                      {ann.author?.name?.charAt(0) || "A"}
                    </div>
                    <span style={{ fontWeight: 700, color: "#FFF" }}>{ann.author?.name || "Yönetim"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* COLUMN 3: AKTİF BİRİMLER + SUÇLU KAYDI */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Aktif Birimler Mini List */}
          <div style={{ background: "rgba(11, 15, 25, 0.65)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "22px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(255,255,255,0.015)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFF" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34D399", fontSize: "0.8rem" }}><i className="fa-solid fa-walkie-talkie" /></span>
                AKTİF DEVRİYELER
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 800, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.25rem 0.65rem", borderRadius: "8px" }}>
                <span style={{ color: "#34D399" }}>{onDutyCount}</span>
                <span style={{ color: "#64748B" }}>/ {officers.length}</span>
              </div>
            </div>

            <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "250px", overflowY: "auto" }}>
              {loading ? (
                [1, 2, 3].map(i => <div key={i} style={{ height: "46px", borderRadius: "10px", background: "rgba(255,255,255,0.02)" }} />)
              ) : officers.length === 0 ? (
                <div style={{ color: "#64748B", fontSize: "0.82rem", padding: "1.5rem", textAlign: "center" }}>Personel bulunamadı.</div>
              ) : officers
                  .sort((a: any, b: any) => (a.isOnDuty === b.isOnDuty ? 0 : a.isOnDuty ? -1 : 1))
                  .slice(0, 5)
                  .map((officer: any) => (
                    <div key={officer.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.85rem", background: officer.isOnDuty ? "rgba(56, 189, 248, 0.05)" : "transparent", borderRadius: "12px", border: `1px solid ${officer.isOnDuty ? "rgba(56, 189, 248, 0.2)" : "transparent"}` }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: officer.isOnDuty ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${officer.isOnDuty ? "rgba(56, 189, 248, 0.3)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: officer.isOnDuty ? "#38BDF8" : "#64748B", flexShrink: 0, overflow: "hidden" }}>
                        {officer.profileImage ? (
                          <img src={officer.profileImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          officer.name.charAt(0)
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: officer.isOnDuty ? "#FFF" : "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officer.name}</div>
                        <div style={{ fontSize: "0.68rem", color: "#64748B", fontFamily: "monospace" }}>#{officer.badge} • {officer.rank}</div>
                      </div>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: officer.isOnDuty ? "#34D399" : "#475569", boxShadow: officer.isOnDuty ? "0 0 6px #34D399" : "none" }} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Kriminal Bilgi Mini Card */}
          <div style={{ background: "rgba(11, 15, 25, 0.65)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "22px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(255,255,255,0.015)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFF" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", fontSize: "0.8rem" }}><i className="fa-solid fa-fingerprint" /></span>
                KRİMİNAL KAYIT
              </h2>
              <Link href="/mdt/kriminal" style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "#FFF"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
              </Link>
            </div>

            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {loading ? (
                [1, 2].map(i => <div key={i} style={{ height: "52px", borderRadius: "12px", background: "rgba(255,255,255,0.02)" }} />)
              ) : criminals.length === 0 ? (
                <div style={{ color: "#64748B", fontSize: "0.82rem", padding: "1.5rem", textAlign: "center" }}>Kayıt temiz.</div>
              ) : criminals.map((c: any) => (
                <div key={c.id} className="row-hover" style={{ padding: "0.85rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", cursor: "pointer" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFF", marginBottom: "0.2rem" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.crimes}</div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
