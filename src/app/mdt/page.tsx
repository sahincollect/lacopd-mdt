"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

function LiveClock() {
  const [t, setT] = useState({ time: "", date: "" });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({
        time: d.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        date: d.toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right", lineHeight: 1.3 }}>
      <div
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {t.time}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}
      >
        {t.date}
      </div>
    </div>
  );
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "Az önce";
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return `${Math.floor(s / 86400)} gün önce`;
}

function formatSecs(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sc.toString().padStart(2, "0")}`;
}

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe } = useSWR("/api/auth/me", fetcher, { refreshInterval: 30000 });
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher, { refreshInterval: 15000 });
  const { data: reportsData } = useSWR("/api/reports", fetcher, { refreshInterval: 30000 });
  const { data: shiftsData, mutate: mutateShifts } = useSWR("/api/shifts", fetcher, { refreshInterval: 10000 });

  const user = meData?.user ?? null;
  const officers = officersData?.officers ?? [];
  const allReports = reportsData?.reports ?? [];
  const onDuty = officers.filter((o: any) => o.isOnDuty);
  const leaderboard: any[] = shiftsData?.leaderboard ?? [];
  const topShift = [...leaderboard].slice(0, 5);
  const myEntry = leaderboard.find((e: any) => e.id === user?.id);
  const myRank = leaderboard.findIndex((e: any) => e.id === user?.id) + 1;

  const [toggling, setToggling] = useState(false);
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!shiftsData?.leaderboard) return;
    const ticks: Record<number, number> = {};
    shiftsData.leaderboard.forEach((off: any) => {
      ticks[off.id] = off.totalSeconds ?? 0;
    });
    setLiveTicks(ticks);
  }, [shiftsData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks((prev) => {
        if (!shiftsData?.leaderboard) return prev;
        const next = { ...prev };
        shiftsData.leaderboard.forEach((off: any) => {
          if (off.isOnDuty) next[off.id] = (next[off.id] ?? off.totalSeconds ?? 0) + 1;
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
      mutateOfficers(
        { officers: officersData.officers.map((o: any) => (o.id === user.id ? { ...o, isOnDuty: next } : o)) },
        false
      );
    setToggling(true);
    try {
      await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: next }),
      });
      toast.success(next ? "Mesai başlatıldı." : "Mesai sonlandırıldı.");
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
      label: "Kayıtlı Personel",
      value: officers.length,
      sub: "Aktif sicil kaydı",
      icon: "fa-users",
    },
    {
      label: "Aktif Saha Birimi",
      value: onDuty.length,
      sub: `${officers.length ? Math.round((onDuty.length / officers.length) * 100) : 0}% görev başında`,
      icon: "fa-car-side",
    },
    {
      label: "Arşivlenen Rapor",
      value: allReports.length,
      sub: "Resmi vaka dosyası",
      icon: "fa-file-lines",
    },
    {
      label: "Kişisel Mesai Süresi",
      value: formatSecs(myLiveSecs),
      sub: myRank > 0 ? `Departman sıralaması: #${myRank}` : "Mesai kaydı",
      icon: "fa-clock",
    },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-light)",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      {/* ── CLEAN WELCOME & ACTION HEADER ── */}
      <section
        style={{
          ...cardStyle,
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              marginBottom: "0.25rem",
            }}
          >
            Los Angeles Community Police Department · Komuta & Operasyon Paneli
          </div>
          <h1
            style={{
              fontSize: "1.65rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Hoş geldiniz, {loading ? "..." : user?.name ?? "Memur"}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: "#041632",
                color: "#FFFFFF",
                fontSize: "0.76rem",
                fontWeight: 600,
                padding: "0.25rem 0.65rem",
                borderRadius: "5px",
              }}
            >
              Rozet #{user?.badge ?? "—"}
            </span>
            <span
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                fontSize: "0.76rem",
                fontWeight: 600,
                padding: "0.25rem 0.65rem",
                borderRadius: "5px",
              }}
            >
              {user?.rank ?? "—"}
            </span>
            <span
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-light)",
                color: "var(--text-muted)",
                fontSize: "0.76rem",
                fontWeight: 500,
                padding: "0.25rem 0.65rem",
                borderRadius: "5px",
              }}
            >
              {user?.department ?? "Patrol Division"}
            </span>
          </div>
        </div>

        {/* Right: Clock + Clean Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <LiveClock />

          <div style={{ display: "flex", gap: "0.65rem" }}>
            <Link
              href="/mdt/raporlar"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
                padding: "0.6rem 1.1rem",
                fontSize: "0.84rem",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: "0.75rem" }} />
              Yeni Rapor
            </Link>

            <button
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                backgroundColor: user?.isOnDuty ? "var(--color-danger)" : "#041632",
                color: "#FFFFFF",
                padding: "0.6rem 1.2rem",
                fontSize: "0.84rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                opacity: toggling ? 0.7 : 1,
              }}
            >
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.72rem" }} />
              {toggling ? "İşleniyor..." : user?.isOnDuty ? "Mesaiyi Bitir" : "Mesaiye Başla"}
            </button>
          </div>
        </div>
      </section>

      {/* ── 4 CLEAN METRIC CARDS ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              ...cardStyle,
              padding: "1.25rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-primary)",
                  fontSize: "0.88rem",
                }}
              >
                <i className={`fa-solid ${s.icon}`} />
              </div>
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {loading ? "—" : s.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* ── 3 SYSTEMATIC DATA PANELS ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: "1.25rem", alignItems: "start" }}>
        {/* PANEL 1: SON VAKA RAPORLARI */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Son Vaka Raporları
            </h2>
            <Link
              href="/mdt/raporlar"
              style={{
                color: "var(--LAC-orange)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              Tümünü Gör →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "2.25rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Yükleniyor...
            </div>
          ) : allReports.length === 0 ? (
            <div style={{ padding: "2.5rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Sistemde henüz kayıtlı rapor bulunmuyor.
            </div>
          ) : (
            <div>
              {allReports.slice(0, 7).map((r: any, idx: number) => (
                <Link
                  key={r.id}
                  href="/mdt/raporlar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    borderBottom: idx < Math.min(allReports.length, 7) - 1 ? "1px solid var(--border-light)" : "none",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Memur #{r.officer?.badge} · {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* PANEL 2: AKTİF SAHA BİRİMLERİ */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Aktif Saha Birimleri
              </h2>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}
              >
                {onDuty.length}
              </span>
            </div>
            <Link
              href="/mdt/mesai"
              style={{
                color: "var(--LAC-orange)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              Mesai Listesi →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "2.25rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Yükleniyor...
            </div>
          ) : onDuty.length === 0 ? (
            <div style={{ padding: "2.5rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Şu anda sahada aktif birim bulunmuyor.
            </div>
          ) : (
            <div>
              {onDuty.map((o: any, idx: number) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.8rem 1.25rem",
                    borderBottom: idx < onDuty.length - 1 ? "1px solid var(--border-light)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {o.profileImage ? (
                        <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        o.name?.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{o.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        #{o.badge} · {o.rank}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "var(--color-success-bg)",
                      border: "1px solid var(--color-success-border)",
                      color: "var(--color-success)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "5px",
                    }}
                  >
                    Görevde
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL 3: MESAİ SIRALAMASI */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Mesai Sıralaması
            </h2>
          </div>

          {!shiftsData ? (
            <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.84rem" }}>
              Yükleniyor...
            </div>
          ) : topShift.length === 0 ? (
            <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.84rem" }}>
              Mesai kaydı bulunamadı.
            </div>
          ) : (
            <div>
              {topShift.map((e: any, i: number) => {
                const currentSecs = liveTicks[e.id] ?? e.totalSeconds ?? 0;
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.8rem 1.25rem",
                      borderBottom: i < topShift.length - 1 ? "1px solid var(--border-light)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", minWidth: 0 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "5px",
                          backgroundColor: i === 0 ? "#041632" : "var(--bg-primary)",
                          border: i === 0 ? "none" : "1px solid var(--border-light)",
                          color: i === 0 ? "#FFFFFF" : "var(--text-secondary)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {e.name}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                          #{e.badge} · {e.rank}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: e.isOnDuty ? "var(--color-success)" : "var(--text-secondary)",
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {formatSecs(currentSecs)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
