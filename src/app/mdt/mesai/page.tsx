"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface OfficerShift {
  id: number;
  badge: string;
  name: string;
  rank: string;
  department: string;
  isOnDuty: boolean;
  totalSeconds: number;
  activeLogStart?: string | null;
}

export default function MesaiSistemiMinimal() {
  const [toggling, setToggling] = useState(false);
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE" | "OFF_DUTY" | "TOP10">("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [currentTime, setCurrentTime] = useState<string>("");

  const { data: shiftsData, mutate: mutateShifts } = useSWR('/api/shifts', fetcher);
  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);

  const loading = !shiftsData || !meData;
  const leaderboard: OfficerShift[] = useMemo(() => shiftsData?.leaderboard || [], [shiftsData]);
  const user = meData?.user || null;

  // Live clock & live ticking loop
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks(prev => {
        const next = { ...prev };
        leaderboard.forEach((off) => {
          if (off.isOnDuty) {
            next[off.id] = (next[off.id] !== undefined ? next[off.id] : off.totalSeconds) + 1;
          } else {
            if (next[off.id] === undefined) next[off.id] = off.totalSeconds;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [leaderboard]);

  const toggleDuty = async () => {
    if (!user || toggling) return;
    setToggling(true);
    
    const newIsOnDuty = !user.isOnDuty;
    mutateMe({ user: { ...user, isOnDuty: newIsOnDuty } }, false);
    mutateShifts({ 
      leaderboard: leaderboard.map(o => o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o) 
    }, false);
    
    if (newIsOnDuty) {
      setLiveTicks(prev => ({ ...prev, [user.id]: user.totalSeconds || 0 }));
    } else {
      setLiveTicks(prev => { const n = { ...prev }; delete n[user.id]; return n; });
    }

    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty })
      });
      if (!res.ok) throw new Error();
      toast.success(newIsOnDuty ? "Devriye başlatıldı. Güvenli seyirler." : "Devriye sonlandırıldı. İyi dinlenmeler.", {
        style: { background: "#0D111D", color: "#F8FAFC", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "0.85rem" }
      });
      mutateMe();
      mutateShifts();
    } catch {
      mutateMe({ user: { ...user, isOnDuty: !newIsOnDuty } }, false);
      mutateShifts({ 
        leaderboard: leaderboard.map(o => o.id === user.id ? { ...o, isOnDuty: !newIsOnDuty } : o) 
      }, false);
      toast.error("Durum güncellenemedi.");
    } finally {
      setToggling(false);
    }
  };

  const forceEndShift = async (off: OfficerShift) => {
    if (!confirm(`[ADMİN] #${off.badge} rozetli ${off.name} personelinin mesaisini kapatmak istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/officers/${off.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnDuty: false })
      });
      if (res.ok) {
        toast.success(`Mesai kapatıldı: ${off.name}`, { style: { background: "#0D111D", color: "#F8FAFC", border: "1px solid rgba(255,255,255,0.1)" } });
        mutateShifts();
      } else {
        toast.error("İşlem başarısız.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    }
  };

  const formatTime = (totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatHoursMinimal = (totalSeconds: number) => {
    return (totalSeconds / 3600).toFixed(1) + " sa";
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    leaderboard.forEach(o => o.department && set.add(o.department));
    return ["ALL", ...Array.from(set)];
  }, [leaderboard]);

  const mySeconds = liveTicks[user?.id] !== undefined ? liveTicks[user?.id] : (user?.totalSeconds || 0);
  const maxSeconds = leaderboard[0]?.totalSeconds || 1;
  const myEntry = leaderboard.find(o => o.id === user?.id);
  const myRankIndex = myEntry ? leaderboard.indexOf(myEntry) : -1;

  const activeCount = useMemo(() => leaderboard.filter(o => o.isOnDuty).length, [leaderboard]);
  const totalDepartmentSeconds = useMemo(() => leaderboard.reduce((acc, o) => acc + (liveTicks[o.id] !== undefined ? liveTicks[o.id] : o.totalSeconds), 0), [leaderboard, liveTicks]);

  const filteredList = useMemo(() => {
    return leaderboard.filter((off, index) => {
      const matchesSearch = !searchTerm || 
        off.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        off.badge.toLowerCase().includes(searchTerm.toLowerCase()) || 
        off.rank.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDept === "ALL" || off.department === selectedDept;

      let matchesMode = true;
      if (filterMode === "ACTIVE") matchesMode = off.isOnDuty;
      else if (filterMode === "OFF_DUTY") matchesMode = !off.isOnDuty;
      else if (filterMode === "TOP10") matchesMode = index < 10;

      return matchesSearch && matchesDept && matchesMode;
    });
  }, [leaderboard, searchTerm, selectedDept, filterMode]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "#64748B", flexDirection: "column", gap: "1rem", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#38BDF8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", fontWeight: 600 }}>MESAİ VERİLERİ EŞİTLENİYOR</span>
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ color: "#F8FAFC", paddingBottom: "6rem", maxWidth: "1280px", margin: "0 auto", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      
      {/* ── TOP ULTRA-MINIMALIST BAR ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "3rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#38BDF8", letterSpacing: "0.18em", textTransform: "uppercase" }}>LAC • TIME LOGS</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#475569" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748B", fontFamily: "'Courier New', monospace" }}>PDT {currentTime}</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFF", margin: "0.2rem 0 0 0", letterSpacing: "-0.04em" }}>
            Devriye & Mesai Ağ Geçidi
          </h1>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em" }}>SAHADA AKTİF</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: activeCount > 0 ? "#34D399" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeCount > 0 ? "#34D399" : "#64748B", boxShadow: activeCount > 0 ? "0 0 8px #34D399" : "none" }} />
              {activeCount} <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>/ {leaderboard.length}</span>
            </div>
          </div>
          <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em" }}>DEPARTMAN EFORU</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFF", fontFamily: "'Courier New', monospace" }}>
              {formatHoursMinimal(totalDepartmentSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* ── THE ZEN SHIFT CONSOLE (LINEAR APP / GLASS FLOATING ISLAND) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: user?.isOnDuty
            ? "linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.7) 50%, rgba(10, 15, 29, 0.85))"
            : "linear-gradient(145deg, rgba(255, 255, 255, 0.025), rgba(15, 23, 42, 0.6))",
          border: `1px solid ${user?.isOnDuty ? "rgba(16, 185, 129, 0.35)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "24px",
          padding: "2.25rem 2.75rem",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "2.5rem",
          marginBottom: "3.5rem",
          boxShadow: user?.isOnDuty ? "0 20px 60px rgba(16, 185, 129, 0.12)" : "0 20px 50px rgba(0,0,0,0.35)",
          backdropFilter: "blur(20px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle breathing glow bar on top edge */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: user?.isOnDuty ? "linear-gradient(90deg, transparent, #34D399, transparent)" : "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

        {/* Left: Officer Bio & Monospace Chronometer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", borderRadius: "50px", background: user?.isOnDuty ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${user?.isOnDuty ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.08)"}`, fontSize: "0.72rem", fontWeight: 700, color: user?.isOnDuty ? "#34D399" : "#94A3B8", letterSpacing: "0.06em" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user?.isOnDuty ? "#34D399" : "#64748B", boxShadow: user?.isOnDuty ? "0 0 8px #34D399" : "none" }} />
              {user?.isOnDuty ? "CANLI DEVRİYE AKTİF" : "İSTİRAHAT DURUMUNDA"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
              #{user?.badge || "0000"} • {user?.rank || "Officer"}
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
              KÜMÜLATİF ŞAHSİ SÜRE
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "3.2rem", fontWeight: 900, color: user?.isOnDuty ? "#FFF" : "#E2E8F0", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {formatTime(mySeconds)}
            </div>
          </div>
        </div>

        {/* Center Divider / Pulse Capsule */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", padding: "0 1.5rem", borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>DEPARTMAN SIRAN</div>
          <div style={{ fontSize: "2.1rem", fontWeight: 900, color: myRankIndex >= 0 && myRankIndex < 3 ? "#F59E0B" : "#38BDF8", letterSpacing: "-0.03em" }}>
            {myRankIndex >= 0 ? `#${myRankIndex + 1}` : "—"}
          </div>
          <span style={{ fontSize: "0.72rem", color: "#94A3B8", background: "rgba(255,255,255,0.03)", padding: "0.2rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
            {formatHoursMinimal(mySeconds)}
          </span>
        </div>

        {/* Right: Sleek Magnetic Action Trigger */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
          <motion.button
            whileHover={!toggling ? { scale: 1.02, y: -1 } : {}}
            whileTap={!toggling ? { scale: 0.98 } : {}}
            onClick={toggleDuty}
            disabled={toggling}
            style={{
              padding: "1.1rem 2.2rem",
              borderRadius: "16px",
              cursor: toggling ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: "0.92rem",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
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
              <><i className="fa-solid fa-square" style={{ fontSize: "0.75rem" }} /> MESAİYİ VE DEVRİYEYİ KAPAT</>
            ) : (
              <><i className="fa-solid fa-play" style={{ fontSize: "0.75rem" }} /> AKTİF DEVRİYEYE BAŞLA</>
            )}
          </motion.button>
          <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
            {user?.isOnDuty ? "Sinyal kesintisiz telsiz ağına iletiliyor" : "Sisteme giriş yaptığınız an canlı saat başlar"}
          </span>
        </div>
      </motion.div>

      {/* ── ELITE TRIAD PODIUM (MINIMALIST THREE-COLUMN SHOWCASE) ── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B" }} />
          <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
            ELİT LİDERLER • EN YÜKSEK MESAİ EFORU
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {leaderboard.slice(0, 3).map((off, idx) => {
            const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;
            const medals = [
              { color: "#F59E0B", label: "01", border: "rgba(245, 158, 11, 0.3)" },
              { color: "#94A3B8", label: "02", border: "rgba(148, 163, 184, 0.25)" },
              { color: "#D97706", label: "03", border: "rgba(217, 119, 6, 0.25)" }
            ][idx] || { color: "#64748B", label: `0${idx + 1}`, border: "rgba(255,255,255,0.06)" };

            return (
              <motion.div
                key={off.id}
                whileHover={{ y: -3, borderColor: medals.color }}
                style={{
                  background: "rgba(15, 23, 42, 0.4)",
                  border: `1px solid ${medals.border}`,
                  borderRadius: "20px",
                  padding: "1.5rem 1.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s"
                }}
              >
                {/* Big watermark rank number behind */}
                <div style={{ position: "absolute", right: "1rem", bottom: "-0.5rem", fontSize: "4.5rem", fontWeight: 900, color: medals.color, opacity: 0.06, fontFamily: "monospace", pointerEvents: "none", lineHeight: 1 }}>
                  {medals.label}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.1rem", zIndex: 1 }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${medals.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: medals.color, flexShrink: 0 }}>
                    {medals.label}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "#FFF", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {off.name}
                      {off.isOnDuty && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34D399" }} title="Şu an devriyede" />}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, marginTop: "0.1rem" }}>
                      #{off.badge} • {off.rank}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", zIndex: 1 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.25rem", fontWeight: 800, color: "#FFF" }}>
                    {formatTime(secs)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: medals.color, fontWeight: 700 }}>
                    {formatHoursMinimal(secs)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── THE ROSTER SECTION (ULTRA-CLEAN LINEAR STYLE DATA GRID) ── */}
      <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "1.75rem 2rem" }}>
        
        {/* Filter & Search Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "Tüm Kadro", count: leaderboard.length },
              { id: "ACTIVE", label: "Aktif Devriyede", count: activeCount, activeColor: "#34D399" },
              { id: "OFF_DUTY", label: "İstirahatte", count: leaderboard.length - activeCount },
              { id: "TOP10", label: "Top 10", count: Math.min(10, leaderboard.length), activeColor: "#F59E0B" }
            ].map(tab => {
              const isActive = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id as any)}
                  style={{
                    background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(255,255,255,0.2)" : "transparent"}`,
                    color: isActive ? "#FFF" : "#64748B",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "all 0.15s"
                  }}
                >
                  {tab.label}
                  <span style={{ fontSize: "0.7rem", color: isActive ? "#38BDF8" : "#475569", background: "rgba(0,0,0,0.25)", padding: "0.1rem 0.45rem", borderRadius: "50px" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Capsule & View Switchers */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: "0.78rem" }} />
              <input
                type="text"
                placeholder="İsim, rozet veya rütbe ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: "2.3rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#FFF",
                  fontSize: "0.8rem",
                  width: "240px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "2px" }}>
              <button
                onClick={() => setViewMode("TABLE")}
                style={{
                  background: viewMode === "TABLE" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: viewMode === "TABLE" ? "#FFF" : "#64748B",
                  border: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600
                }}
              >
                <i className="fa-solid fa-list" /> Tablo
              </button>
              <button
                onClick={() => setViewMode("GRID")}
                style={{
                  background: viewMode === "GRID" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: viewMode === "GRID" ? "#FFF" : "#64748B",
                  border: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600
                }}
              >
                <i className="fa-solid fa-border-all" /> Izgara
              </button>
            </div>
          </div>
        </div>

        {/* Department Pills Sub-bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginRight: "0.25rem" }}>DEPARTMAN BİRİMİ:</span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                background: selectedDept === dept ? "rgba(56, 189, 248, 0.15)" : "transparent",
                border: `1px solid ${selectedDept === dept ? "rgba(56, 189, 248, 0.4)" : "transparent"}`,
                color: selectedDept === dept ? "#38BDF8" : "#64748B",
                padding: "0.3rem 0.75rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.15s"
              }}
            >
              {dept === "ALL" ? "Tüm Birimler" : dept}
            </button>
          ))}
        </div>

        {/* ── DATA RENDER (TABLE OR GRID) ── */}
        {filteredList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4.5rem", color: "#64748B" }}>
            <i className="fa-solid fa-user-clock" style={{ fontSize: "2rem", color: "#475569", marginBottom: "0.75rem", display: "block" }} />
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#E2E8F0" }}>Kayıtlı personel bulunamadı</div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>Aradığınız filtre veya isimle eşleşen mesai kaydı mevcut değil.</div>
          </div>
        ) : viewMode === "TABLE" ? (
          /* ULTRA-MINIMALIST TABLE */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#475569", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "left", width: "60px" }}>#</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>PERSONEL</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>BİRİM / RÜTBE</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "left" }}>GÖREV DURUMU</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>KÜMÜLATİF SÜRE</th>
                  {user?.role === 'admin' && <th style={{ padding: "0.85rem 1rem", textAlign: "center", width: "70px" }}>YÖNET</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredList.map((off) => {
                    const idx = leaderboard.indexOf(off);
                    const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;
                    const barWidth = maxSeconds > 0 ? Math.min((secs / maxSeconds) * 100, 100) : 0;
                    const isMe = off.id === user?.id;

                    return (
                      <motion.tr
                        key={off.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.035)",
                          background: isMe ? "rgba(56, 189, 248, 0.05)" : "transparent",
                          transition: "background 0.15s"
                        }}
                      >
                        {/* Rank Index */}
                        <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: idx < 3 ? "#F59E0B" : "#64748B" }}>
                          {idx < 3 ? <i className="fa-solid fa-crown" style={{ color: idx === 0 ? "#F59E0B" : idx === 1 ? "#94A3B8" : "#D97706" }} /> : (idx + 1).toString().padStart(2, "0")}
                        </td>

                        {/* Officer */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: isMe ? "#0284C7" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#FFF", fontSize: "0.85rem", flexShrink: 0 }}>
                              {off.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#FFF", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                {off.name}
                                {isMe && <span style={{ fontSize: "0.62rem", background: "#38BDF8", color: "#000", padding: "0.1rem 0.35rem", borderRadius: "3px", fontWeight: 900 }}>SEN</span>}
                              </div>
                              <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748B" }}>#{off.badge}</div>
                            </div>
                          </div>
                        </td>

                        {/* Unit / Rank */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#E2E8F0" }}>{off.rank}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B" }}>{off.department || "Patrol"}</div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "1rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: 700, color: off.isOnDuty ? "#34D399" : "#64748B" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: off.isOnDuty ? "#34D399" : "#475569", boxShadow: off.isOnDuty ? "0 0 6px #34D399" : "none" }} />
                            {off.isOnDuty ? "Devriyede" : "İstirahatte"}
                          </span>
                        </td>

                        {/* Time + Sub-bar */}
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.05rem", fontWeight: 800, color: off.isOnDuty ? "#34D399" : "#FFF" }}>
                            {formatTime(secs)}
                          </div>
                          <div style={{ width: "100%", maxWidth: "120px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginLeft: "auto", marginTop: "0.3rem", overflow: "hidden" }}>
                            <div style={{ width: `${barWidth}%`, height: "100%", background: idx === 0 ? "#F59E0B" : off.isOnDuty ? "#34D399" : "#64748B" }} />
                          </div>
                        </td>

                        {/* Admin Action */}
                        {user?.role === 'admin' && (
                          <td style={{ padding: "1rem", textAlign: "center" }}>
                            {off.isOnDuty && off.id !== user?.id && (
                              <button
                                onClick={() => forceEndShift(off)}
                                title="Mesaiyi Kapat (Admin)"
                                style={{ background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#F87171", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", transition: "all 0.15s" }}
                                onMouseOver={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; }}
                                onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
                              >
                                <i className="fa-solid fa-power-off" style={{ fontSize: "0.75rem" }} />
                              </button>
                            )}
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          /* ULTRA-MINIMALIST GRID CARDS */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            <AnimatePresence>
              {filteredList.map((off) => {
                const idx = leaderboard.indexOf(off);
                const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;
                const barWidth = maxSeconds > 0 ? Math.min((secs / maxSeconds) * 100, 100) : 0;
                const isMe = off.id === user?.id;

                return (
                  <motion.div
                    key={off.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: isMe ? "rgba(56, 189, 248, 0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isMe ? "rgba(56, 189, 248, 0.3)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: "16px",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "1rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#FFF", fontSize: "0.9rem" }}>
                          {off.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#FFF", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            {off.name}
                            {isMe && <span style={{ fontSize: "0.6rem", background: "#38BDF8", color: "#000", padding: "0.1rem 0.3rem", borderRadius: "3px", fontWeight: 900 }}>SEN</span>}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "monospace" }}>#{off.badge} • {off.rank}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: off.isOnDuty ? "#34D399" : "#475569" }}>
                        ● {off.isOnDuty ? "Canlı" : "Pasif"}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }}>#{idx + 1} Sırada</span>
                        <span style={{ fontFamily: "'Courier New', monospace", fontSize: "1.15rem", fontWeight: 800, color: off.isOnDuty ? "#34D399" : "#FFF" }}>{formatTime(secs)}</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${barWidth}%`, height: "100%", background: idx === 0 ? "#F59E0B" : off.isOnDuty ? "#34D399" : "#64748B" }} />
                      </div>
                      {user?.role === 'admin' && off.isOnDuty && off.id !== user?.id && (
                        <button
                          onClick={() => forceEndShift(off)}
                          style={{ marginTop: "0.85rem", width: "100%", padding: "0.35rem", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#F87171", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                        >
                          <i className="fa-solid fa-power-off" /> Kapat (Admin)
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
