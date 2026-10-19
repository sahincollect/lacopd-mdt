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
    <div style={{ textAlign: "right", lineHeight: 1.25 }}>
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          color: "var(--accent-primary)",
          fontFamily: "'Oswald', sans-serif",
          letterSpacing: "0.04em",
        }}
      >
        {t.time}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: "0.15rem",
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

const QUICK_LINKS = [
  { icon: "fa-file-signature", label: "Rapor Yaz", href: "/mdt/raporlar" },
  { icon: "fa-fingerprint", label: "Kriminal Kayıt", href: "/mdt/kriminal" },
  { icon: "fa-users", label: "Personel Ağı", href: "/mdt/personel" },
  { icon: "fa-clock", label: "Mesai Sistemi", href: "/mdt/mesai" },
  { icon: "fa-bullhorn", label: "Duyurular", href: "/mdt/duyurular" },
  { icon: "fa-scale-balanced", label: "Yönetmelikler", href: "/mdt/yonetmelikler" },
];

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
      toast.success(next ? "10-8: Göreve başlandı." : "10-7: Görev sonlandırıldı.");
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
      label: "KAYITLI PERSONEL",
      value: officers.length,
      sub: "Aktif Sicil Kaydı",
      icon: "fa-users",
    },
    {
      label: "SAHADA AKTİF BİRİM",
      value: onDuty.length,
      sub: `${officers.length ? Math.round((onDuty.length / officers.length) * 100) : 0}% Devriyede`,
      icon: "fa-car-side",
    },
    {
      label: "ARŞİVLENEN RAPOR",
      value: allReports.length,
      sub: "Resmi Vaka Dosyası",
      icon: "fa-file-lines",
    },
    {
      label: "KİŞİSEL MESAİ SÜRESİ",
      value: formatSecs(myLiveSecs),
      sub: myRank > 0 ? `Departman Sıralaması: #${myRank}` : "Mesai Kaydı",
      icon: "fa-clock",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "2.5rem" }}>
      {/* ── HERO BANNER (LAPDOnline Style) ── */}
      <section
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--LAC-border)",
          borderTop: "4px solid var(--LAC-orange)",
          padding: "2rem 2.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--LAC-text-muted)",
              marginBottom: "0.25rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Los Angeles Community Polis Departmanı · Resmi Komuta ve Operasyon Merkezi
          </p>
          <h1
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "var(--LAC-blue-dark)",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            To Protect and to Serve —{" "}
            <span style={{ color: "var(--LAC-orange)" }}>
              {loading ? "..." : user?.name ?? "Memur"}
            </span>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: "#041632",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "0.3rem 0.75rem",
                borderRadius: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              ROZET #{user?.badge ?? "—"}
            </span>
            <span
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.3rem 0.75rem",
                borderRadius: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {user?.rank ?? "—"}
            </span>
            <span
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.3rem 0.75rem",
                borderRadius: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {user?.department ?? "Patrol Division"}
            </span>
          </div>
        </div>

        {/* Right: Clock + Corporate Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
          <LiveClock />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              href="/mdt/raporlar"
              style={{
                backgroundColor: "#041632",
                color: "#FFFFFF",
                padding: "0.7rem 1.25rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i className="fa-solid fa-plus" /> YENİ RAPOR OLUŞTUR
            </Link>

            <button
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                backgroundColor: user?.isOnDuty ? "var(--color-danger)" : "var(--LAC-orange)",
                color: "#FFFFFF",
                padding: "0.7rem 1.4rem",
                fontSize: "0.78rem",
                fontWeight: 800,
                border: "none",
                borderRadius: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: toggling ? 0.7 : 1,
              }}
            >
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} />
              {toggling ? "İŞLENİYOR..." : user?.isOnDuty ? "MESAİYİ BİTİR (10-7)" : "MESAİYE BAŞLA (10-8)"}
            </button>
          </div>
        </div>
      </section>

      {/* ── HIZLI BAĞLANTILAR (Exact LAPDOnline Quicklinks Grid from src/app/page.tsx) ── */}
      <section>
        <h3
          style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
            color: "var(--text-primary)",
          }}
        >
          HIZLI BAĞLANTILAR
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            border: "1px solid var(--LAC-border)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {QUICK_LINKS.map((item, idx) => (
            <Link
              href={item.href}
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.6rem 1rem",
                borderRight: idx !== QUICK_LINKS.length - 1 ? "1px solid var(--LAC-border)" : "none",
                textAlign: "center",
                cursor: "pointer",
                transition: "background-color 0.2s",
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <i
                className={`fa-solid ${item.icon}`}
                style={{ fontSize: "1.65rem", color: "var(--LAC-blue-dark)", marginBottom: "0.75rem" }}
              />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4 CORPORATE STAT CARDS ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderTop: i % 2 === 0 ? "3px solid var(--LAC-orange)" : "3px solid #041632",
              padding: "1.35rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </span>
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: "1rem", color: "var(--LAC-orange)" }} />
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "var(--LAC-blue-dark)",
                fontFamily: "'Oswald', sans-serif",
                lineHeight: 1.15,
              }}
            >
              {loading ? "—" : s.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* ── MAIN DATA COLUMNS (LAPDOnline Newsroom Tab Style) ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: "1.5rem", alignItems: "start" }}>
        {/* COLUMN 1: SON RAPORLAR */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--LAC-orange)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                padding: "0.4rem 0.75rem",
                color: "var(--LAC-orange)",
                fontWeight: 800,
                fontSize: "0.82rem",
                borderBottom: "3px solid var(--LAC-orange)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              SON VAKA RAPORLARI
            </div>
            <Link
              href="/mdt/raporlar"
              style={{
                color: "var(--accent-secondary)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              TÜMÜNÜ GÖR →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Yükleniyor...
            </div>
          ) : allReports.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Sistemde henüz kayıtlı rapor bulunmuyor.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {allReports.slice(0, 7).map((r: any) => (
                <Link
                  key={r.id}
                  href="/mdt/raporlar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 0.5rem",
                    borderBottom: "1px solid var(--border-light)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: 600 }}>
                      Memur #{r.officer?.badge} · {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    İNCELE
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: AKTİF DEVRİYE BİRİMLERİ */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--LAC-orange)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                padding: "0.4rem 0.75rem",
                color: "var(--LAC-orange)",
                fontWeight: 800,
                fontSize: "0.82rem",
                borderBottom: "3px solid var(--LAC-orange)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              AKTİF SAHA BİRİMLERİ ({onDuty.length})
            </div>
            <Link
              href="/mdt/mesai"
              style={{
                color: "var(--accent-secondary)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              MESAİ LİSTESİ →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Yükleniyor...
            </div>
          ) : onDuty.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Şu anda sahada aktif (10-8) birim bulunmuyor.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {onDuty.map((o: any) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.8rem 0.5rem",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {o.profileImage ? (
                        <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        o.name?.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>{o.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        Rozet #{o.badge} · {o.rank}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "var(--color-success-bg)",
                      border: "1px solid var(--color-success-border)",
                      color: "var(--color-success)",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    10-8 GÖREVDE
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 3: HAFTALIK MESAİ LİDERLİĞİ */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--LAC-orange)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                padding: "0.4rem 0.75rem",
                color: "var(--LAC-orange)",
                fontWeight: 800,
                fontSize: "0.82rem",
                borderBottom: "3px solid var(--LAC-orange)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              MESAİ SIRALAMASI
            </div>
          </div>

          {!shiftsData ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Yükleniyor...
            </div>
          ) : topShift.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Mesai kaydı bulunamadı.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topShift.map((e: any, i: number) => {
                const currentSecs = liveTicks[e.id] ?? e.totalSeconds ?? 0;
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0.25rem",
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "2px",
                          backgroundColor: i === 0 ? "var(--LAC-orange)" : "var(--bg-tertiary)",
                          color: i === 0 ? "#FFFFFF" : "var(--text-primary)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {e.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          #{e.badge} · {e.rank}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: e.isOnDuty ? "var(--color-success)" : "var(--accent-primary)",
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
