// src/app/mdt/mesai/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

export default function MesaiSistemi() {
  const [toggling, setToggling] = useState(false);
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE" | "OFF_DUTY" | "TOP10">("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [currentTime, setCurrentTime] = useState<string>("");

  const { data: shiftsData, mutate: mutateShifts } = useSWR('/api/shifts', fetcher);
  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);

  const loading = !shiftsData || !meData;
  const leaderboard: OfficerShift[] = useMemo(() => shiftsData?.leaderboard || [], [shiftsData]);
  const user = meData?.user || null;

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
      toast.success(newIsOnDuty ? "Mesai başladı." : "Mesai bitirildi.");
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
        toast.success(`Mesai kapatıldı: ${off.name}`);
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
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--mdt-text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>MESAİ VERİLERİ YÜKLENİYOR...</span>
    </div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--mdt-border)' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · OPERASYON
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>DUTY LOGS</span>
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--mdt-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Mesai Takip Sistemi
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Personel devriye durumları ve aktif operasyon gücü.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--mdt-text-muted)", letterSpacing: '0.1em' }}>SAHADA AKTİF</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--mdt-accent)" }}>{activeCount} <span style={{ fontSize: "0.85rem", color: "var(--mdt-text-muted)" }}>/ {leaderboard.length}</span></div>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "var(--mdt-border)" }}></div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--mdt-text-muted)", letterSpacing: '0.1em' }}>DEPARTMAN EFORU</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--mdt-warning)" }}>{formatHoursMinimal(totalDepartmentSeconds)}</div>
          </div>
        </div>
      </div>

      {/* ── MY SHIFT CONSOLE ── */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem",
        background: user?.isOnDuty ? 'rgba(34, 197, 94, 0.08)' : 'var(--mdt-card-bg)', 
        border: `1px solid ${user?.isOnDuty ? 'rgba(34, 197, 94, 0.4)' : 'var(--mdt-border)'}`,
        padding: "2rem", borderRadius: "10px",
        boxShadow: user?.isOnDuty ? '0 0 20px rgba(34,197,94,0.05)' : 'none'
      }}>
        
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--mdt-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900 }}>
            {user?.name.charAt(0) || "U"}
          </div>
          
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--mdt-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>KÜMÜLATİF ŞAHSİ SÜRE</div>
            <div style={{ fontFamily: "monospace", fontSize: "2.5rem", fontWeight: 900, color: "var(--mdt-text-primary)", lineHeight: 1, margin: "0.25rem 0" }}>{formatTime(mySeconds)}</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--mdt-text-secondary)" }}>
              Departman Sıranız: <strong style={{ color: "var(--mdt-warning)" }}>{myRankIndex >= 0 ? `#${myRankIndex + 1}` : "Yok"}</strong>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={toggleDuty}
            disabled={toggling}
            style={{
              padding: "1rem 2rem",
              background: user?.isOnDuty ? "var(--mdt-danger)" : "var(--mdt-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 900,
              cursor: toggling ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.1s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
            onMouseOver={e => !toggling && ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
            onMouseOut={e => !toggling && ((e.currentTarget as HTMLElement).style.opacity = '1')}
            onMouseDown={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'scale(0.97)')}
            onMouseUp={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          >
            <i className={`fa-solid ${user?.isOnDuty ? 'fa-power-off' : 'fa-satellite-dish'}`}></i>
            {user?.isOnDuty ? "MESAİYİ BİTİR" : "MESAİYE BAŞLA"}
          </button>
        </div>
      </div>

      {/* ── FILTERS AND TABLE ── */}
      <div style={{ background: "var(--mdt-card-bg)", border: "1px solid var(--mdt-border)", borderRadius: "10px", padding: "1.5rem" }}>
        
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { id: "ALL", label: "Tüm Kadro" },
              { id: "ACTIVE", label: "Aktif Devriyede" },
              { id: "OFF_DUTY", label: "İstirahatte" },
              { id: "TOP10", label: "Top 10" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                style={{
                  background: filterMode === tab.id ? "var(--mdt-accent)" : "transparent",
                  color: filterMode === tab.id ? "#fff" : "var(--mdt-text-secondary)",
                  border: filterMode === tab.id ? "1px solid var(--mdt-accent)" : "1px solid var(--mdt-border)",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ 
                padding: "0.5rem 0.75rem", background: "var(--mdt-bg-main)", border: "1px solid var(--mdt-border)", 
                borderRadius: "6px", fontWeight: 600, color: "var(--mdt-text-primary)", fontSize: "0.85rem", outline: "none" 
              }}
            >
              {departments.map(d => <option key={d} value={d}>{d === "ALL" ? "Tüm Departmanlar" : d}</option>)}
            </select>

            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-search" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--mdt-text-muted)", fontSize: "0.8rem" }}></i>
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  padding: "0.5rem 0.75rem 0.5rem 2rem", background: "var(--mdt-bg-main)", border: "1px solid var(--mdt-border)", 
                  borderRadius: "6px", width: "200px", color: "var(--mdt-text-primary)", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Data List */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--mdt-border)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: '0.18em', color: "var(--mdt-text-muted)", textTransform: "uppercase" }}>SIRA</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: '0.18em', color: "var(--mdt-text-muted)", textTransform: "uppercase" }}>PERSONEL</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: '0.18em', color: "var(--mdt-text-muted)", textTransform: "uppercase" }}>BİRİM / RÜTBE</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: '0.18em', color: "var(--mdt-text-muted)", textTransform: "uppercase" }}>DURUM</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: "0.62rem", fontWeight: 700, letterSpacing: '0.18em', color: "var(--mdt-text-muted)", textTransform: "uppercase", textAlign: "right" }}>SÜRE</th>
                {user?.role === "admin" && <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}></th>}
              </tr>
            </thead>
            <tbody>
              {filteredList.map((off) => {
                const idx = leaderboard.indexOf(off);
                const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;

                return (
                  <tr key={off.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: "1rem", fontWeight: 900, color: idx < 3 ? "var(--mdt-warning)" : "var(--mdt-text-secondary)", fontSize: "1rem" }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--mdt-text-primary)", fontSize: "0.95rem" }}>{off.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-muted)", fontFamily: "monospace" }}>#{off.badge}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--mdt-text-primary)" }}>{off.rank}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-muted)" }}>{off.department}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {off.isOnDuty ? (
                        <span style={{ background: "rgba(34,197,94,0.12)", color: "var(--mdt-success)", border: "1px solid rgba(34,197,94,0.22)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em" }}>AKTİF</span>
                      ) : (
                        <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--mdt-text-muted)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em" }}>PASİF</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", fontFamily: "monospace", fontWeight: 800, fontSize: "1rem", color: off.isOnDuty ? "var(--mdt-success)" : "var(--mdt-text-secondary)" }}>
                      {formatTime(secs)}
                    </td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        {off.isOnDuty && off.id !== user?.id && (
                          <button onClick={() => forceEndShift(off)} title="Mesaiyi Kapat" style={{ background: "rgba(239,68,68,0.1)", color: "var(--mdt-danger)", border: "1px solid rgba(239,68,68,0.2)", width: "32px", height: "32px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                            <i className="fa-solid fa-power-off"></i>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--mdt-text-muted)" }}>
                    <i className="fa-solid fa-ghost" style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                    <div>Kayıt bulunamadı.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
