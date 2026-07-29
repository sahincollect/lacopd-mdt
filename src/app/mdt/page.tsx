"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/* ─── Mini Sparkline ─────────────────────────────── */
function SparkLine({ color = "#E84F2A" }: { color?: string }) {
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
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${pathD} 100,100`}
        fill={`url(#${id})`}
      />
      <polyline
        points={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
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
  { icon: "fa-pen-to-square",   label: "Yeni Rapor",       href: "/mdt/raporlar" },
  { icon: "fa-users",           label: "Personel",         href: "/mdt/personel" },
  { icon: "fa-fingerprint",     label: "Kriminal",         href: "/mdt/kriminal" },
  { icon: "fa-scale-balanced",  label: "Yönetmelik",      href: "/mdt/yonetmelikler" },
  { icon: "fa-bullhorn",        label: "Duyurular",        href: "/mdt/duyurular" },
  { icon: "fa-calendar-xmark",  label: "İzin / Mazeret",  href: "/mdt/mazeretler" },
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
    { label: "Toplam Personel", value: loading ? "—" : String(officers.length), sub: "kayıtlı memur", icon: "fa-users",       color: "#E84F2A" },
    { label: "Sahada Birim",   value: loading ? "—" : String(onDuty.length),    sub: `${officers.length > 0 ? Math.round(onDuty.length / officers.length * 100) : 0}% aktif`,  icon: "fa-car-side",  color: "#22c55e" },
    { label: "Toplam Rapor",   value: loading ? "—" : String(allReports.length),sub: "sisteme girilmiş",  icon: "fa-file-lines",color: "#f59e0b" },
    { label: "Mesaim",         value: loading ? "—" : `${myHours}s`,            sub: "toplam saat",      icon: "fa-clock",     color: "#E84F2A" },
  ];

  /* ─── Styles ─── */
  const card: React.CSSProperties = {
    background: "var(--mdt-card-bg)",
    border: "1px solid var(--mdt-border)",
    borderRadius: 14,
    overflow: "hidden",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "0.25rem",
          borderBottom: "1px solid var(--mdt-border)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--mdt-text-muted)",
              margin: "0 0 0.2rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Los Angeles Community Police Department
          </p>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              margin: 0,
              color: "var(--mdt-text-primary)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Hoş Geldin, {user?.name?.split(" ")[0] ?? "Memur"} 👋
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--mdt-text-muted)",
              margin: "0.35rem 0 0",
              fontWeight: 400,
            }}
          >
            #{user?.badge ?? "—"} · {user?.rank ?? "—"} · MDT v3.1
          </p>
        </div>

        {/* Duty toggle */}
        <button
          onClick={toggleDuty}
          disabled={toggling || !user}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
            padding: "0.75rem 1.5rem",
            borderRadius: 10,
            border: user?.isOnDuty ? "1px solid rgba(34,197,94,0.35)" : "1px solid var(--mdt-border)",
            background: user?.isOnDuty ? "rgba(34,197,94,0.08)" : "var(--mdt-card-bg)",
            color: user?.isOnDuty ? "#22c55e" : "var(--mdt-text-secondary)",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: toggling || !user ? "not-allowed" : "pointer",
            transition: "all 0.18s",
            opacity: toggling ? 0.6 : 1,
            letterSpacing: "0.02em",
          }}
          onMouseOver={e => { if (!toggling && user) (e.currentTarget as HTMLElement).style.borderColor = "var(--mdt-accent)"; }}
          onMouseOut={e  => { if (!toggling && user) (e.currentTarget as HTMLElement).style.borderColor = user?.isOnDuty ? "rgba(34,197,94,0.35)" : "var(--mdt-border)"; }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: user?.isOnDuty ? "#22c55e" : "var(--mdt-text-muted)",
              boxShadow: user?.isOnDuty ? "0 0 10px #22c55e" : "none",
              flexShrink: 0,
            }}
          />
          <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.75rem" }} />
          {user?.isOnDuty ? "Görevi Sonlandır" : "Göreve Başla"}
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "1rem",
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              ...card,
              padding: "1.35rem 1.4rem 0",
              position: "relative",
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "1.4rem",
                right: "1.4rem",
                height: 2,
                borderRadius: "0 0 2px 2px",
                background: s.color,
                opacity: 0.7,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.85rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
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
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${s.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "0.85rem" }} />
              </div>
            </div>

            <div
              style={{
                fontSize: "2.6rem",
                fontWeight: 900,
                color: "var(--mdt-text-primary)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: s.color,
                fontWeight: 600,
                marginTop: "0.3rem",
                paddingBottom: "0.75rem",
                opacity: 0.85,
              }}
            >
              {s.sub}
            </div>

            <SparkLine color={s.color} />
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left – Recent Reports */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.1rem 1.35rem",
              borderBottom: "1px solid var(--mdt-border)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--mdt-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "rgba(232,79,42,0.12)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-file-lines" style={{ color: "#E84F2A", fontSize: "0.8rem" }} />
              </span>
              Son Raporlar
            </h3>
            <Link
              href="/mdt/raporlar"
              style={{
                fontSize: "0.73rem",
                color: "var(--mdt-accent)",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                opacity: 0.85,
              }}
            >
              Tümünü Gör <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.6rem" }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ display: "block", fontSize: "1.4rem", marginBottom: "0.6rem" }} />
              Yükleniyor...
            </div>
          ) : recentReports.length === 0 ? (
            <div style={{ padding: "3.5rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-folder-open" style={{ display: "block", fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }} />
              Henüz rapor yok.
            </div>
          ) : (
            recentReports.map((rep: any, idx: number) => (
              <Link key={rep.id} href="/mdt/raporlar" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.9rem",
                    padding: "0.95rem 1.35rem",
                    borderBottom: idx < recentReports.length - 1 ? "1px solid var(--mdt-border)" : "none",
                    transition: "background 0.12s",
                    cursor: "pointer",
                  }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "var(--mdt-hover)"}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(232,79,42,0.08)",
                      border: "1px solid rgba(232,79,42,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-file-alt" style={{ color: "#E84F2A", fontSize: "0.78rem" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--mdt-text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {rep.title}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", marginTop: 2 }}>
                      #{rep.officer?.badge ?? "—"} {rep.officer?.name} · {timeAgo(rep.createdAt)}
                    </div>
                  </div>

                  <i className="fa-solid fa-chevron-right" style={{ color: "var(--mdt-text-muted)", fontSize: "0.6rem", opacity: 0.5 }} />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Active Patrols */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.1rem 1.35rem",
                borderBottom: "1px solid var(--mdt-border)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--mdt-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 7px #22c55e",
                    display: "inline-block",
                  }}
                />
                Canlı Devriye
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#22c55e",
                  background: "rgba(34,197,94,0.1)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: 6,
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                {onDuty.length} Aktif
              </span>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.82rem" }}>Yükleniyor...</div>
            ) : onDuty.length === 0 ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.82rem" }}>
                Sahada aktif birim yok.
              </div>
            ) : (
              onDuty.slice(0, 7).map((o: any, idx: number) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    padding: "0.75rem 1.35rem",
                    borderBottom: idx < Math.min(onDuty.length, 7) - 1 ? "1px solid var(--mdt-border)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {o.profileImage
                      ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <i className="fa-solid fa-user" style={{ fontSize: "0.7rem", color: "#22c55e" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--mdt-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {o.name}
                    </div>
                    <div style={{ fontSize: "0.67rem", color: "var(--mdt-text-muted)", marginTop: 1 }}>
                      #{o.badge} · {o.rank}
                    </div>
                  </div>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 5px #22c55e", flexShrink: 0 }} />
                </div>
              ))
            )}

            <div
              style={{
                padding: "0.65rem 1.35rem",
                borderTop: "1px solid var(--mdt-border)",
              }}
            >
              <Link
                href="/mdt/mesai"
                style={{
                  fontSize: "0.73rem",
                  color: "var(--mdt-accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  opacity: 0.85,
                }}
              >
                Tüm Mesai Verilerini Gör
                <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.6rem" }} />
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div style={{ ...card, padding: "1.1rem 1.35rem" }}>
            <h3
              style={{
                margin: "0 0 0.85rem",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--mdt-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "rgba(232,79,42,0.12)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-bolt" style={{ color: "#E84F2A", fontSize: "0.75rem" }} />
              </span>
              Hızlı Erişim
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
              {QUICK_LINKS.map((ql, i) => (
                <Link key={i} href={ql.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.9rem 0.5rem",
                      borderRadius: 9,
                      border: "1px solid var(--mdt-border)",
                      background: "transparent",
                      transition: "all 0.14s",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                    onMouseOver={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(232,79,42,0.07)";
                      el.style.borderColor = "rgba(232,79,42,0.3)";
                    }}
                    onMouseOut={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "transparent";
                      el.style.borderColor = "var(--mdt-border)";
                    }}
                  >
                    <i className={`fa-solid ${ql.icon}`} style={{ fontSize: "1.05rem", color: "#E84F2A" }} />
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--mdt-text-secondary)", lineHeight: 1.2 }}>
                      {ql.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
