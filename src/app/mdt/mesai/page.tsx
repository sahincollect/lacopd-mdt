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
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
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
    return <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>MESAİ VERİLERİ YÜKLENİYOR...</div>;
  }

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "3rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-orange)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            L.A.C.P.D. MESAİ TAKİP SİSTEMİ
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--lapd-blue-dark)", margin: "0.5rem 0 0", letterSpacing: "-0.03em" }}>
            MESAİ & DEVRİYE LİSTESİ
          </h1>
        </div>

        <div style={{ textAlign: "right", display: "flex", gap: "2rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>SAHADA AKTİF</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--lapd-blue-dark)" }}>{activeCount} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {leaderboard.length}</span></div>
          </div>
          <div style={{ width: "2px", backgroundColor: "var(--border-light)" }}></div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>DEPARTMAN EFORU</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--lapd-orange)" }}>{formatHoursMinimal(totalDepartmentSeconds)}</div>
          </div>
        </div>
      </div>

      {/* ── MY SHIFT CONSOLE ── */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        background: user?.isOnDuty ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)', 
        border: `2px solid ${user?.isOnDuty ? 'var(--color-success)' : 'var(--border-light)'}`,
        padding: "2rem", borderRadius: "8px"
      }}>
        
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--lapd-blue-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 900 }}>
            {user?.name.charAt(0) || "U"}
          </div>
          
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>KÜMÜLATİF ŞAHSİ SÜRE</div>
            <div style={{ fontFamily: "monospace", fontSize: "3rem", fontWeight: 900, color: "var(--lapd-blue-dark)", lineHeight: 1 }}>{formatTime(mySeconds)}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.5rem" }}>
              Departman Sıranız: <strong style={{ color: "var(--lapd-orange)" }}>{myRankIndex >= 0 ? `#${myRankIndex + 1}` : "Yok"}</strong>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={toggleDuty}
            disabled={toggling}
            style={{
              padding: "1.5rem 3rem",
              background: user?.isOnDuty ? "var(--color-danger)" : "var(--lapd-blue-dark)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1.2rem",
              fontWeight: 900,
              cursor: toggling ? "not-allowed" : "pointer",
              transition: "opacity 0.2s"
            }}
          >
            {user?.isOnDuty ? "MESAİYİ BİTİR" : "MESAİYE BAŞLA"}
          </button>
        </div>
      </div>

      {/* ── FILTERS AND TABLE ── */}
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "8px", padding: "2rem" }}>
        
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          
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
                  background: filterMode === tab.id ? "var(--lapd-blue-dark)" : "var(--bg-tertiary)",
                  color: filterMode === tab.id ? "#fff" : "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ padding: "0.5rem 1rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "4px", fontWeight: 700, color: "var(--text-primary)" }}
            >
              {departments.map(d => <option key={d} value={d}>{d === "ALL" ? "Tüm Departmanlar" : d}</option>)}
            </select>

            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: "0.5rem 1rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "4px", width: "200px" }}
            />
          </div>
        </div>

        {/* Data List */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--lapd-blue-dark)", textAlign: "left" }}>
              <th style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-blue-dark)" }}>SIRA</th>
              <th style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-blue-dark)" }}>PERSONEL</th>
              <th style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-blue-dark)" }}>BİRİM / RÜTBE</th>
              <th style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-blue-dark)" }}>DURUM</th>
              <th style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: 800, color: "var(--lapd-blue-dark)", textAlign: "right" }}>SÜRE</th>
              {user?.role === "admin" && <th style={{ padding: "1rem", textAlign: "right" }}>YÖNET</th>}
            </tr>
          </thead>
          <tbody>
            {filteredList.map((off) => {
              const idx = leaderboard.indexOf(off);
              const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;

              return (
                <tr key={off.id} style={{ borderBottom: "1px solid var(--border-light)", background: off.id === user?.id ? "rgba(232, 79, 42, 0.05)" : "transparent" }}>
                  <td style={{ padding: "1rem", fontWeight: 900, color: idx < 3 ? "var(--lapd-orange)" : "var(--text-muted)", fontSize: "1.1rem" }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{off.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{off.badge}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 700 }}>{off.rank}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{off.department}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {off.isOnDuty ? (
                      <span style={{ background: "var(--color-success)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800 }}>AKTİF</span>
                    ) : (
                      <span style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800 }}>PASİF</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right", fontFamily: "monospace", fontWeight: 900, fontSize: "1.1rem", color: off.isOnDuty ? "var(--color-success)" : "var(--text-primary)" }}>
                    {formatTime(secs)}
                  </td>
                  {user?.role === "admin" && (
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {off.isOnDuty && off.id !== user?.id && (
                        <button onClick={() => forceEndShift(off)} style={{ background: "var(--color-danger)", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}>
                          KAPAT
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Kayıt bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
