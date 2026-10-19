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

export default function MesaiSistemi() {
  const [toggling, setToggling] = useState(false);
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE" | "OFF_DUTY" | "TOP10">("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [currentTime, setCurrentTime] = useState<string>("");

  const { data: shiftsData, mutate: mutateShifts } = useSWR("/api/shifts", fetcher);
  const { data: meData, mutate: mutateMe } = useSWR("/api/auth/me", fetcher);

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
      setLiveTicks((prev) => {
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
    mutateShifts(
      {
        leaderboard: leaderboard.map((o) => (o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o)),
      },
      false
    );

    if (newIsOnDuty) {
      setLiveTicks((prev) => ({ ...prev, [user.id]: user.totalSeconds || 0 }));
    } else {
      setLiveTicks((prev) => {
        const n = { ...prev };
        delete n[user.id];
        return n;
      });
    }

    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty }),
      });
      if (!res.ok) throw new Error();
      toast.success(newIsOnDuty ? "Mesai başlatıldı (10-8)." : "Mesai sonlandırıldı (10-7).");
      mutateMe();
      mutateShifts();
    } catch {
      mutateMe({ user: { ...user, isOnDuty: !newIsOnDuty } }, false);
      mutateShifts(
        {
          leaderboard: leaderboard.map((o) => (o.id === user.id ? { ...o, isOnDuty: !newIsOnDuty } : o)),
        },
        false
      );
      toast.error("Durum güncellenemedi.");
    } finally {
      setToggling(false);
    }
  };

  const forceEndShift = async (off: OfficerShift) => {
    if (!confirm(`#${off.badge} ${off.name} personelinin aktif mesaisini kapatmak istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/officers/${off.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: false }),
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
    return (totalSeconds / 3600).toFixed(1) + " Saat";
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    leaderboard.forEach((o) => o.department && set.add(o.department));
    return ["ALL", ...Array.from(set)];
  }, [leaderboard]);

  const mySeconds = liveTicks[user?.id] !== undefined ? liveTicks[user?.id] : user?.totalSeconds || 0;
  const myEntry = leaderboard.find((o) => o.id === user?.id);
  const myRankIndex = myEntry ? leaderboard.indexOf(myEntry) : -1;

  const activeCount = useMemo(() => leaderboard.filter((o) => o.isOnDuty).length, [leaderboard]);
  const totalDepartmentSeconds = useMemo(
    () => leaderboard.reduce((acc, o) => acc + (liveTicks[o.id] !== undefined ? liveTicks[o.id] : o.totalSeconds), 0),
    [leaderboard, liveTicks]
  );

  const filteredList = useMemo(() => {
    return leaderboard.filter((off, index) => {
      const matchesSearch =
        !searchTerm ||
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--text-muted)" }}>
        Mesai verileri yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "2.5rem" }}>
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
            LAPD PATROL & DUTY MANAGEMENT // NÖBET VE MESAİ KONTROLÜ
          </div>
          <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Mesai ve Devriye Takip Sistemi
          </h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
            Bireysel vardiya durumunuzu yönetin ve departman genelindeki aktif devriye kadrosunu takip edin.
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 1rem",
            borderRadius: 6,
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-light)",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <i className="fa-regular fa-clock" style={{ color: "var(--LAC-orange)" }} />
          Sistem Saati: {currentTime || "--:--:--"}
        </div>
      </div>

      {/* ── TOP SPLIT: PERSONAL DUTY CONSOLE + 4 METRIC CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1.25rem", alignItems: "stretch" }}>
        {/* Left: Personal Duty Console */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderLeft: user?.isOnDuty ? "4px solid #16a34a" : "4px solid #041632",
            borderRadius: 8,
            padding: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                backgroundColor: user?.isOnDuty ? "rgba(22,163,74,0.12)" : "#041632",
                color: user?.isOnDuty ? "#16a34a" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.35rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0) || "P"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  #{user?.badge} {user?.name}
                </span>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "0.18rem 0.55rem",
                    borderRadius: 4,
                    backgroundColor: user?.isOnDuty ? "var(--color-success-bg)" : "var(--bg-tertiary)",
                    color: user?.isOnDuty ? "var(--color-success)" : "var(--text-muted)",
                    border: user?.isOnDuty ? "1px solid var(--color-success-border)" : "1px solid var(--border-light)",
                  }}
                >
                  {user?.isOnDuty ? "GÖREVDE (10-8)" : "GÖREV DIŞI (10-7)"}
                </span>
              </div>

              <div
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 800,
                  color: user?.isOnDuty ? "#16a34a" : "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.1,
                }}
              >
                {formatTime(mySeconds)}
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Kümülatif Mesai Süresi • Sıralama:{" "}
                <strong style={{ color: "var(--text-primary)" }}>{myRankIndex >= 0 ? `#${myRankIndex + 1}` : "—"}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={toggleDuty}
            disabled={toggling}
            style={{
              padding: "0.85rem 1.5rem",
              borderRadius: 8,
              backgroundColor: user?.isOnDuty ? "#dc2626" : "#16a34a",
              color: "#ffffff",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: toggling ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <i className={`fa-solid ${user?.isOnDuty ? "fa-power-off" : "fa-play"}`} />
            {user?.isOnDuty ? "Mesaiyi Bitir (10-7)" : "Mesaiye Başla (10-8)"}
          </button>
        </div>

        {/* Right: 4 Summary KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>Aktif Saha Gücü</div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#16a34a", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {activeCount}{" "}
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)" }}>/ {leaderboard.length}</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>Toplam Departman Mesaisi</div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {formatHoursMinimal(totalDepartmentSeconds)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>Görev Dışı Personel</div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--text-secondary)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {Math.max(0, leaderboard.length - activeCount)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>Birim / Departman</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--LAC-orange)", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.department || "Patrol Division"}
            </div>
          </div>
        </div>
      </div>

      {/* ── PERSONNEL SHIFT TABLE CARD ── */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Filter Toolbar */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: `Tüm Kadro (${leaderboard.length})` },
              { id: "ACTIVE", label: `Aktif Görevde (${activeCount})` },
              { id: "OFF_DUTY", label: `Görev Dışı (${leaderboard.length - activeCount})` },
              { id: "TOP10", label: "İlk 10 Sıralama" },
            ].map((tab) => {
              const isActive = filterMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id as any)}
                  style={{
                    padding: "0.48rem 0.9rem",
                    borderRadius: 6,
                    backgroundColor: isActive ? "#041632" : "var(--bg-primary)",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    border: isActive ? "1px solid #041632" : "1px solid var(--border-light)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: "0.48rem 0.85rem",
                borderRadius: 6,
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "0.84rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "ALL" ? "Tüm Birimler" : d}
                </option>
              ))}
            </select>

            <div style={{ position: "relative" }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.8rem" }}
              />
              <input
                type="text"
                placeholder="İsim, rozet veya rütbe ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "0.48rem 0.85rem 0.48rem 2.1rem",
                  borderRadius: 6,
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "0.84rem",
                  width: 230,
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", width: 80 }}>
                  Sıra
                </th>
                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Personel
                </th>
                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Rütbe & Birim
                </th>
                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Nöbet Durumu
                </th>
                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>
                  Toplam Süre
                </th>
                {user?.role === "admin" && (
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right", width: 120 }}>
                    İşlem
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === "admin" ? 6 : 5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Seçili filtreye uygun personel kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredList.map((off) => {
                  const idx = leaderboard.indexOf(off);
                  const secs = liveTicks[off.id] !== undefined ? liveTicks[off.id] : off.totalSeconds;
                  const isMe = off.id === user?.id;

                  return (
                    <tr
                      key={off.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        backgroundColor: isMe ? "rgba(4,22,50,0.03)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 32,
                            height: 28,
                            padding: "0 0.45rem",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            backgroundColor:
                              idx === 0
                                ? "rgba(217,119,6,0.14)"
                                : idx === 1
                                ? "rgba(100,116,139,0.14)"
                                : idx === 2
                                ? "rgba(232,79,42,0.14)"
                                : "var(--bg-tertiary)",
                            color:
                              idx === 0
                                ? "#b45309"
                                : idx === 1
                                ? "#475569"
                                : idx === 2
                                ? "var(--LAC-orange)"
                                : "var(--text-secondary)",
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              backgroundColor: off.isOnDuty ? "#041632" : "var(--bg-tertiary)",
                              color: off.isOnDuty ? "#ffffff" : "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {off.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                              {off.name}{" "}
                              <span style={{ color: "var(--LAC-orange)", fontWeight: 700, fontSize: "0.82rem" }}>
                                #{off.badge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)" }}>{off.rank}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{off.department || "Patrol Division"}</div>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.24rem 0.65rem",
                            borderRadius: 6,
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            backgroundColor: off.isOnDuty ? "var(--color-success-bg)" : "var(--bg-tertiary)",
                            color: off.isOnDuty ? "var(--color-success)" : "var(--text-muted)",
                            border: off.isOnDuty ? "1px solid var(--color-success-border)" : "1px solid var(--border-light)",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              backgroundColor: off.isOnDuty ? "#16a34a" : "#94a3b8",
                            }}
                          />
                          {off.isOnDuty ? "Görevde (10-8)" : "Görev Dışı"}
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: off.isOnDuty ? "#16a34a" : "var(--text-primary)" }}>
                          {formatTime(secs)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatHoursMinimal(secs)}</div>
                      </td>

                      {user?.role === "admin" && (
                        <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                          {off.isOnDuty && (
                            <button
                              onClick={() => forceEndShift(off)}
                              title="Mesaiyi Kapat"
                              style={{
                                padding: "0.38rem 0.7rem",
                                borderRadius: 6,
                                backgroundColor: "var(--color-danger-bg)",
                                border: "1px solid var(--color-danger-border)",
                                color: "var(--color-danger)",
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Mesaiyi Kapat
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
