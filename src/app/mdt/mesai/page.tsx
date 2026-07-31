"use client";

import { useEffect, useState, useMemo } from "react";
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

const glassCard: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "0.55rem 0.9rem",
  color: "#ededed",
  fontSize: "0.83rem",
  outline: "none",
  transition: "all 0.18s ease",
  fontFamily: "'Inter', sans-serif",
};

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

  const getRankBadge = (idx: number) => {
    if (idx === 0) return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", icon: "fa-trophy" }; // Gold
    if (idx === 1) return { bg: "#2a2a2a", color: "#ededed", border: "1px solid #555", icon: "fa-medal" }; // Silver
    if (idx === 2) return { bg: "rgba(232,79,42,0.1)", color: "#E84F2A", border: "1px solid rgba(232,79,42,0.3)", icon: "fa-award" }; // Bronze
    return { bg: "transparent", color: "#555", border: "1px solid transparent", icon: "fa-hashtag" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column", gap: "1rem" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        `}</style>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "1.8rem", color: "#555" }} />
        <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600, letterSpacing: "0.1em" }}>YÜKLENİYOR...</span>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#ededed", paddingBottom: "3rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .filter-btn {
          background: transparent;
          color: #888;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-btn:hover {
          background: #161616;
          color: #ededed;
        }
        .filter-btn.active {
          background: rgba(255,255,255,0.08);
          color: #1D6EF7;
          border-color: rgba(255,255,255,0.16);
        }

        .custom-input:focus {
          border-color: rgba(255,255,255,0.16) !important;
          background: #161616 !important;
        }

        .leaderboard-row {
          transition: all 0.2s ease;
        }
        .leaderboard-row:hover {
          background: rgba(255,255,255,0.03) !important;
        }

        .action-btn {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .action-btn:hover {
          background: rgba(239,68,68,0.2);
        }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#333", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            L.A.C.P.D. · OPERASYON
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ededed", margin: 0, letterSpacing: "-0.02em" }}>
            Mesai Takip Sistemi
          </h1>
          <p style={{ color: "#666", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
            Personel devriye durumları ve aktif operasyon gücü
          </p>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center", background: "rgba(13,18,32,0.6)", padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#666", letterSpacing: '0.1em' }}>SAHADA AKTİF</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#00d26a", fontFamily: "'JetBrains Mono', monospace" }}>{activeCount} <span style={{ fontSize: "0.9rem", color: "#555" }}>/ {leaderboard.length}</span></div>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#2a2a2a" }}></div>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#666", letterSpacing: '0.1em' }}>DEPARTMAN EFORU</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1D6EF7", fontFamily: "'JetBrains Mono', monospace" }}>{formatHoursMinimal(totalDepartmentSeconds)}</div>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#2a2a2a" }}></div>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#666", letterSpacing: '0.1em' }}>SAAT</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#ededed", fontFamily: "'JetBrains Mono', monospace" }}>{currentTime || "--:--:--"}</div>
          </div>
        </div>
      </div>

      {/* MY SHIFT CONSOLE */}
      <div style={{ 
        ...glassCard,
        padding: "2rem",
        marginBottom: "2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem",
        border: user?.isOnDuty ? "1px solid rgba(0,210,106,0.3)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: user?.isOnDuty ? "0 8px 32px -8px rgba(0,210,106,0.15), inset 0 1px 0 rgba(255,255,255,0.03)" : glassCard.boxShadow
      }}>
        
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ 
            width: "64px", height: "64px", borderRadius: "16px", 
            background: user?.isOnDuty ? "rgba(0,210,106,0.1)" : "rgba(255,255,255,0.08)", 
            color: user?.isOnDuty ? "#00d26a" : "#1D6EF7", 
            border: user?.isOnDuty ? "1px solid rgba(0,210,106,0.2)" : "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900 
          }}>
            {user?.name.charAt(0) || "U"}
          </div>
          
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>KÜMÜLATİF ŞAHSİ SÜRE</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2.5rem", fontWeight: 700, color: user?.isOnDuty ? "#00d26a" : "#ededed", lineHeight: 1, margin: "0.25rem 0" }}>
              {formatTime(mySeconds)}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666", marginTop: "0.5rem" }}>
              Departman Sıranız: <strong style={{ color: myRankIndex < 3 ? "#f59e0b" : "#1D6EF7", marginLeft: "0.25rem" }}>{myRankIndex >= 0 ? `#${myRankIndex + 1}` : "Yok"}</strong>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={toggleDuty}
            disabled={toggling}
            style={{
              padding: "1rem 2rem",
              background: user?.isOnDuty ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
              color: user?.isOnDuty ? "#ef4444" : "#fff",
              border: user?.isOnDuty ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.16)",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: toggling ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: user?.isOnDuty ? "none" : "0 4px 12px rgba(255,255,255,0.14)"
            }}
            onMouseOver={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseOut={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
            onMouseDown={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'scale(0.97)')}
            onMouseUp={e => !toggling && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
          >
            <i className={`fa-solid ${user?.isOnDuty ? 'fa-power-off' : 'fa-satellite-dish'}`}></i>
            {user?.isOnDuty ? "MESAİYİ BİTİR" : "MESAİYE BAŞLA"}
          </button>
        </div>
      </div>

      {/* FILTERS AND TABLE */}
      <div style={glassCard}>
        
        {/* Toolbar */}
        <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,14,26,0.5)" }}>
          
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
                className={`filter-btn ${filterMode === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="custom-input"
              style={{ 
                ...inputStyle,
                width: "auto",
                cursor: "pointer",
              }}
            >
              {departments.map(d => <option key={d} value={d} style={{ background: "#0a0a0a", color: "#ededed" }}>{d === "ALL" ? "Tüm Departmanlar" : d}</option>)}
            </select>

            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-search" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: "0.8rem" }}></i>
              <input
                type="text"
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="custom-input"
                style={{ 
                  ...inputStyle,
                  paddingLeft: "2.2rem",
                  width: "220px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Data List Header */}
        <div style={{ display: "flex", padding: "1rem 1.5rem", fontSize: "0.65rem", fontWeight: 800, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
          <div style={{ flex: "0 0 80px" }}>SIRA</div>
          <div style={{ flex: "2" }}>PERSONEL</div>
          <div style={{ flex: "1.5" }}>BİRİM / RÜTBE</div>
          <div style={{ flex: "1" }}>DURUM</div>
          <div style={{ flex: "1", textAlign: "right" }}>SÜRE</div>
          {user?.role === "admin" && <div style={{ flex: "0 0 60px" }}></div>}
        </div>

        {/* Data List Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredList.map((off) => {
            const idx = leaderboard.indexOf(off);
            const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;
            const rankStyle = getRankBadge(idx);

            return (
              <div key={off.id} className="leaderboard-row" style={{ display: "flex", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.02)", background: idx % 2 === 0 ? "rgba(29,110,247,0.01)" : "transparent" }}>
                
                {/* SIRA */}
                <div style={{ flex: "0 0 80px", display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "36px", height: "36px", borderRadius: "10px", 
                    background: rankStyle.bg, color: rankStyle.color, border: rankStyle.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.9rem", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {idx < 3 ? <i className={`fa-solid ${rankStyle.icon}`}></i> : `#${idx + 1}`}
                  </div>
                </div>

                {/* PERSONEL */}
                <div style={{ flex: "2", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 700, color: "#ededed", fontSize: "0.95rem" }}>{off.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#666", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.15rem" }}>#{off.badge}</div>
                </div>

                {/* BİRİM / RÜTBE */}
                <div style={{ flex: "1.5", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#ededed" }}>{off.rank}</div>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.15rem" }}>{off.department || "-"}</div>
                </div>

                {/* DURUM */}
                <div style={{ flex: "1" }}>
                  {off.isOnDuty ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(0,210,106,0.08)", color: "#00d26a", border: "1px solid rgba(0,210,106,0.2)", padding: "0.3rem 0.6rem", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em" }}>
                      <span className="pulse-dot"></span>
                      AKTİF
                    </div>
                  ) : (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#161616", color: "#666", border: "1px solid rgba(255,255,255,0.05)", padding: "0.3rem 0.6rem", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em" }}>
                      <i className="fa-solid fa-moon"></i>
                      PASİF
                    </div>
                  )}
                </div>

                {/* SÜRE */}
                <div style={{ flex: "1", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.1rem", color: off.isOnDuty ? "#00d26a" : "#888" }}>
                  {formatTime(secs)}
                </div>

                {/* ACTION */}
                {user?.role === "admin" && (
                  <div style={{ flex: "0 0 60px", display: "flex", justifyContent: "flex-end" }}>
                    {off.isOnDuty && off.id !== user?.id && (
                      <button onClick={() => forceEndShift(off)} title="Mesaiyi Kapat" className="action-btn">
                        <i className="fa-solid fa-power-off"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredList.length === 0 && (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <i className="fa-solid fa-ghost" style={{ color: "rgba(255,255,255,0.12)", fontSize: "1.3rem" }} />
              </div>
              <div style={{ fontSize: "0.85rem", color: "#555", fontWeight: 500 }}>Kayıt bulunamadı.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
