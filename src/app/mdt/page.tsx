"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const SkeletonLine = ({ w = "100%", h = "12px", mb = "0" }: { w?: string; h?: string; mb?: string }) => (
  <div style={{ width: w, height: h, borderRadius: "4px", background: "var(--bg-tertiary)", marginBottom: mb }} />
);

const StatCard = ({ icon, label, value, color, delay }: { icon: string; label: string; value: string | number; color: string; delay: number }) => (
  <div
    style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-light)",
      borderRadius: "12px",
      padding: "1.4rem 1.6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    }}
  >
    <div>
      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Courier New', monospace", lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: "1.1rem", flexShrink: 0 }}>
      <i className={icon} />
    </div>
  </div>
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
      case "Acil": return { color: "var(--color-danger)", bg: "var(--color-danger-bg)", border: "var(--color-danger-border)" };
      case "Dikkat": return { color: "var(--color-warning)", bg: "var(--color-warning-bg)", border: "var(--color-warning-border)" };
      case "Normal":
      default: return { color: "var(--accent-primary)", bg: "var(--bg-tertiary)", border: "var(--border-light)" };
    }
  };

  const onDutyCount = officers.filter((o: any) => o.isOnDuty).length;

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    
    // 1. Optimistic Update
    const newIsOnDuty = !user.isOnDuty;
    const optimisticUser = { ...user, isOnDuty: newIsOnDuty };
    mutateMe({ user: optimisticUser }, false);
    
    if (officersData?.officers) {
      const optimisticOfficers = officersData.officers.map((o: any) => 
        o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o
      );
      mutateOfficers({ officers: optimisticOfficers }, false);
    }

    setToggling(true);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty })
      });
      if (res.ok) {
        toast.success(newIsOnDuty ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", {
          style: { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-light)", borderRadius: "8px", fontSize: "0.85rem" },
          id: 'duty-toast'
        });
        mutateMe();
        mutateOfficers();
      } else {
        throw new Error();
      }
    } catch {
      mutateMe({ user }, false);
      mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally {
      setToggling(false);
    }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <style jsx>{`
        @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.6; } }
        .row-hover { transition: all 0.15s ease; }
        .row-hover:hover { background-color: var(--bg-primary) !important; transform: translateX(3px); }
      `}</style>

      {/* ── TOP HERO ISLAND ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "stretch" }}>

        {/* Greeting & Tactical Radar Console */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "2.25rem 2.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Top border line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--accent-primary)" }} />

          {/* Left info */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.28rem 0.75rem", borderRadius: "50px", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", fontSize: "0.7rem", fontWeight: 800, color: "var(--color-success)", letterSpacing: "0.12em" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-success)" }} />
                SİSTEM AKTİF • KOD 4
              </span>
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              HOŞ GELDİNİZ, OPERATÖR
            </div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--accent-primary)", margin: "0.3rem 0 1rem 0", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {user?.name || "MEMUR"}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {user?.badge && (
                <span style={{ fontSize: "0.78rem", fontFamily: "'Courier New', monospace", fontWeight: 800, color: "var(--accent-secondary)", background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", padding: "0.3rem 0.75rem", borderRadius: "6px" }}>
                  #{user.badge}
                </span>
              )}
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>
                Secure Terminal Access
              </span>
            </div>
          </div>

          {/* Right Radar & Pulse Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", paddingLeft: "2rem", borderLeft: "1px solid var(--border-light)" }}>
            
            {/* Holographic Radar Circle */}
            <div style={{ width: "135px", height: "135px", borderRadius: "50%", position: "relative", border: "1px solid var(--border-strong)", background: "var(--bg-primary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ position: "absolute", width: "65%", height: "65%", border: "1px solid var(--border-light)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", width: "30%", height: "30%", border: "1px solid var(--border-light)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "var(--border-light)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "var(--border-light)" }} />
              
              {/* Spinning sweep */}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "conic-gradient(from 0deg, rgba(4,22,50, 0) 0deg, rgba(4,22,50, 0.05) 88deg, rgba(4,22,50, 0.2) 90deg, rgba(4,22,50, 0) 90deg)", borderRadius: "50%", animation: "radar-spin 3s linear infinite" }} />
              
              {/* Center dot */}
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent-primary)", zIndex: 2 }} />

              {/* Active Officer Blips */}
              {officers.filter((o: any) => o.isOnDuty).slice(0, 4).map((officer: any, i: number) => {
                const angle = (i * 120) % 360;
                const radius = 25 + (i * 10) % 30;
                const top = 67 + radius * Math.sin(angle * Math.PI / 180);
                const left = 67 + radius * Math.cos(angle * Math.PI / 180);
                return (
                  <div key={officer.id} style={{ position: "absolute", top: `${top}px`, left: `${left}px`, width: "6px", height: "6px", backgroundColor: "var(--accent-primary)", borderRadius: "50%", boxShadow: "0 0 6px rgba(4,22,50,0.5)", animation: "pulse-dot 2s infinite", transform: "translate(-50%, -50%)", zIndex: 3 }} />
                );
              })}
            </div>

            {/* Radar Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--accent-primary)", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)" }} />
                CANLI RADAR
              </div>
              <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Courier New', monospace", lineHeight: 1, marginTop: "0.2rem" }}>
                {onDutyCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>
                Birim Sahada
              </div>
            </div>

          </div>
        </div>

        {/* Duty Action Trigger Card */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            minWidth: "250px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.8rem", borderRadius: "50px", background: user?.isOnDuty ? "var(--color-success-bg)" : "var(--bg-tertiary)", border: `1px solid ${user?.isOnDuty ? "var(--color-success-border)" : "var(--border-light)"}` }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user?.isOnDuty ? "var(--color-success)" : "var(--text-muted)" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: user?.isOnDuty ? "var(--color-success)" : "var(--text-secondary)", letterSpacing: "0.08em" }}>
              {user?.isOnDuty ? "CANLI DEVRİYEDE" : "İSTİRAHATTE"}
            </span>
          </div>

          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: user?.isOnDuty ? "var(--color-success-bg)" : "var(--bg-primary)", border: `1px solid ${user?.isOnDuty ? "var(--color-success-border)" : "var(--border-light)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: user?.isOnDuty ? "var(--color-success)" : "var(--text-muted)" }}>
            <i className={user?.isOnDuty ? "fa-solid fa-shield-halved" : "fa-solid fa-shield"} />
          </div>

          <button
            onClick={toggleDuty}
            disabled={toggling || !user}
            style={{
              width: "100%",
              padding: "0.95rem 1.4rem",
              borderRadius: "8px",
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
                    background: "var(--color-danger-bg)",
                    color: "var(--color-danger)",
                    border: "1px solid var(--color-danger-border)",
                    boxShadow: "none"
                  }
                : {
                    background: "var(--accent-primary)",
                    color: "var(--bg-secondary)",
                    border: "none",
                    boxShadow: "0 4px 10px rgba(4,22,50,0.15)"
                  })
            }}
          >
            {user?.isOnDuty ? (
              <><i className="fa-solid fa-square" style={{ fontSize: "0.7rem" }} /> MESAİYİ KAPAT</>
            ) : (
              <><i className="fa-solid fa-play" style={{ fontSize: "0.7rem" }} /> DEVRİYEYE BAŞLA</>
            )}
          </button>
        </div>
      </div>

      {/* ── 4 TACTICAL STAT PILLARS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.25rem" }}>
        <StatCard icon="fa-solid fa-users" label="TOPLAM PERSONEL" value={loading ? "—" : officers.length} color="var(--accent-primary)" delay={0.1} />
        <StatCard icon="fa-solid fa-shield-halved" label="SAHADA AKTİF DEVRİYE" value={loading ? "—" : `${onDutyCount} / ${officers.length}`} color="var(--color-success)" delay={0.15} />
        <StatCard icon="fa-solid fa-file-lines" label="TOPLAM RAPOR ARŞİVİ" value={loading ? "—" : totalReports} color="var(--color-info)" delay={0.2} />
        <StatCard icon="fa-solid fa-fingerprint" label="KRİMİNAL SUÇLU KAYDI" value={loading ? "—" : totalCriminals} color="var(--accent-secondary)" delay={0.25} />
      </div>

      {/* ── MAIN 3-COLUMN DATA SHOWCASE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

        {/* COLUMN 1: SON RAPORLAR */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-info-bg)", border: "1px solid var(--color-info-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-info)", fontSize: "0.8rem" }}><i className="fa-solid fa-file-lines" /></span>
              SON RAPORLAR
            </h2>
            <a href="/rapor-portali" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-strong)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}>
              TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </a>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ padding: "1rem", background: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                  <SkeletonLine w="50%" mb="8px" />
                  <SkeletonLine w="90%" mb="6px" />
                  <SkeletonLine w="70%" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "3rem 1rem", textAlign: "center" }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.5rem", opacity: 0.5 }} />
                Henüz rapor girişi yapılmadı.
              </div>
            ) : reports.map((rep: any) => (
              <div key={rep.id} className="row-hover" style={{ padding: "1rem 1.2rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-light)", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 800 }}>#{rep.officer?.badge || "000"} {rep.officer?.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>{timeAgo(rep.createdAt)}</div>
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>{rep.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>{rep.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: BİLDİRİMLER & DUYURULAR */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-warning-border)", border: "1px solid var(--color-warning-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warning)", fontSize: "0.8rem" }}><i className="fa-solid fa-bullhorn" /></span>
              BİLDİRİMLER
            </h2>
            <Link href="/mdt/duyurular" style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-strong)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}>
              TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </Link>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
            {loading ? (
              [1, 2].map(i => (
                <div key={i} style={{ padding: "1.2rem", background: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                  <SkeletonLine w="40%" mb="8px" />
                  <SkeletonLine w="85%" mb="6px" />
                  <SkeletonLine w="70%" />
                </div>
              ))
            ) : announcements.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "3rem 1rem", textAlign: "center" }}>
                <i className="fa-solid fa-bell-slash" style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.5rem", opacity: 0.5 }} />
                Aktif bildirim veya duyuru yok.
              </div>
            ) : announcements.map((ann: any) => {
              const styles = getTypeStyles(ann.type || "Normal");
              return (
                <div key={ann.id} style={{ padding: "1.2rem", background: styles.bg, borderRadius: "8px", border: `1px solid ${styles.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: styles.color, background: "var(--bg-secondary)", padding: "0.2rem 0.6rem", borderRadius: "4px", letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${styles.border}` }}>
                      {ann.type || "DUYURU"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>{timeAgo(ann.createdAt)}</span>
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.4rem 0", color: "var(--text-primary)" }}>{ann.title}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 0.8rem 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ann.content}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.6rem", borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: styles.color, color: "#FFF", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>
                      {ann.author?.name?.charAt(0) || "A"}
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{ann.author?.name || "Yönetim"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: AKTİF BİRİMLER + SUÇLU KAYDI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Aktif Birimler Mini List */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", fontSize: "0.8rem" }}><i className="fa-solid fa-walkie-talkie" /></span>
                AKTİF DEVRİYELER
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 800, background: "var(--bg-secondary)", border: "1px solid var(--border-light)", padding: "0.25rem 0.65rem", borderRadius: "6px" }}>
                <span style={{ color: "var(--color-success)" }}>{onDutyCount}</span>
                <span style={{ color: "var(--text-muted)" }}>/ {officers.length}</span>
              </div>
            </div>

            <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "250px", overflowY: "auto" }}>
              {loading ? (
                [1, 2, 3].map(i => <div key={i} style={{ height: "46px", borderRadius: "8px", background: "var(--bg-tertiary)" }} />)
              ) : officers.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "1.5rem", textAlign: "center" }}>Personel bulunamadı.</div>
              ) : officers
                  .sort((a: any, b: any) => (a.isOnDuty === b.isOnDuty ? 0 : a.isOnDuty ? -1 : 1))
                  .slice(0, 5)
                  .map((officer: any) => (
                    <div key={officer.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.85rem", background: officer.isOnDuty ? "var(--color-success-bg)" : "var(--bg-secondary)", borderRadius: "8px", border: `1px solid ${officer.isOnDuty ? "var(--color-success-border)" : "transparent"}` }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: officer.isOnDuty ? "var(--color-success-bg)" : "var(--bg-tertiary)", border: `1px solid ${officer.isOnDuty ? "var(--color-success-border)" : "var(--border-light)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: officer.isOnDuty ? "var(--color-success)" : "var(--text-muted)", flexShrink: 0, overflow: "hidden" }}>
                        {officer.profileImage ? (
                          <img src={officer.profileImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          officer.name.charAt(0)
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: officer.isOnDuty ? "var(--text-primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officer.name}</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{officer.badge} • {officer.rank}</div>
                      </div>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: officer.isOnDuty ? "var(--color-success)" : "var(--text-muted)" }} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Kriminal Bilgi Mini Card */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border-light)", background: "var(--bg-primary)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)", fontSize: "0.8rem" }}><i className="fa-solid fa-fingerprint" /></span>
                KRİMİNAL KAYIT
              </h2>
              <Link href="/mdt/kriminal" style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-strong)", transition: "all 0.15s" }} onMouseOver={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}>
                TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
              </Link>
            </div>

            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {loading ? (
                [1, 2].map(i => <div key={i} style={{ height: "52px", borderRadius: "8px", background: "var(--bg-tertiary)" }} />)
              ) : criminals.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "1.5rem", textAlign: "center" }}>Kayıt temiz.</div>
              ) : criminals.map((c: any) => (
                <div key={c.id} className="row-hover" style={{ padding: "0.85rem 1rem", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "8px", cursor: "pointer" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.2rem" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.crimes}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
