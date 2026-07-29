"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

function SparkLine({ color = "#3b82f6" }: { color?: string }) {
  // Simple decorative SVG sparkline
  const pts = [28, 45, 35, 55, 40, 60, 48, 52, 65, 55, 70, 58];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = (v: number) => 100 - ((v - min) / (max - min)) * 80 - 10;
  const path = pts
    .map((v, i) => `${(i / (pts.length - 1)) * 100},${norm(v)}`)
    .join(" L ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 56, display: "block", opacity: 0.6 }}>
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,100 ${path} 100,100`}
        fill={`url(#g${color.replace("#", "")})`}
        opacity="0.18"
      />
      <defs>
        <linearGradient id={`g${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

const QUICK_LINKS = [
  { icon: "fa-pen-to-square",   label: "Yeni Rapor",       href: "/mdt/raporlar",     color: "#3b82f6" },
  { icon: "fa-users",           label: "Personel Listesi", href: "/mdt/personel",     color: "#8b5cf6" },
  { icon: "fa-fingerprint",     label: "Kriminal Kayıt",   href: "/mdt/kriminal",     color: "#f59e0b" },
  { icon: "fa-scale-balanced",  label: "Yönetmelikler",   href: "/mdt/yonetmelikler", color: "#10b981" },
  { icon: "fa-bullhorn",        label: "Duyurular",        href: "/mdt/duyurular",    color: "#E84F2A" },
  { icon: "fa-calendar-xmark",  label: "Mazeret / İzin",  href: "/mdt/mazeretler",   color: "#ec4899" },
];

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }           = useSWR("/api/auth/me", fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher);
  const { data: reportsData }                          = useSWR("/api/reports", fetcher);
  const { data: shiftsData }                           = useSWR("/api/shifts", fetcher);

  const loading   = !officersData || !reportsData || !meData;
  const user      = meData?.user ?? null;
  const officers  = officersData?.officers ?? [];
  const allReports = reportsData?.reports ?? [];
  const reports   = allReports.slice(0, 5);
  const onDutyOfficers = officers.filter((o: any) => o.isOnDuty);
  const totalOfficers  = officers.length;
  const reportCount    = allReports.length;

  const myShiftEntry = shiftsData?.leaderboard?.find((e: any) => e.id === user?.id);
  const mySeconds    = myShiftEntry?.totalSeconds ?? 0;
  const myHours      = (mySeconds / 3600).toFixed(1);

  const [toggling, setToggling] = useState(false);

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    const newIsOnDuty = !user.isOnDuty;
    mutateMe({ user: { ...user, isOnDuty: newIsOnDuty } }, false);
    if (officersData?.officers) {
      mutateOfficers({
        officers: officersData.officers.map((o: any) =>
          o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o
        ),
      }, false);
    }
    setToggling(true);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty }),
      });
      if (!res.ok) throw new Error();
      toast.success(newIsOnDuty ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", {
        style: { background: "#161820", color: "#e8eaf0", border: "1px solid rgba(255,255,255,0.08)" },
        id: "duty-toast",
      });
      mutateMe(); mutateOfficers();
    } catch {
      mutateMe({ user }, false);
      mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally {
      setToggling(false);
    }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  const STAT_CARDS = [
    {
      label: "Toplam Personel",
      value: loading ? "…" : String(totalOfficers),
      sub: "kayıtlı memur",
      icon: "fa-users",
      color: "#3b82f6",
    },
    {
      label: "Sahada Birim",
      value: loading ? "…" : String(onDutyOfficers.length),
      sub: `${totalOfficers > 0 ? Math.round((onDutyOfficers.length / totalOfficers) * 100) : 0}% aktif`,
      icon: "fa-car-side",
      color: "#10b981",
    },
    {
      label: "Toplam Rapor",
      value: loading ? "…" : String(reportCount),
      sub: "sisteme girilmiş",
      icon: "fa-file-lines",
      color: "#f59e0b",
    },
    {
      label: "Mesaim",
      value: loading ? "…" : `${myHours}s`,
      sub: "toplam mesai saati",
      icon: "fa-clock",
      color: "#8b5cf6",
    },
  ];

  const cardStyle: React.CSSProperties = {
    background: "var(--mdt-card-bg)",
    border: "1px solid var(--mdt-border)",
    borderRadius: 12,
    padding: "1.5rem 1.5rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 1400, margin: "0 auto" }}>

      {/* ── WELCOME HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.85rem", color: "var(--mdt-text-muted)", margin: "0 0 0.25rem", fontWeight: 600 }}>
            Hoş Geldin,
          </p>
          <h1 style={{
            fontSize: "2.4rem", fontWeight: 900, margin: 0,
            color: "var(--mdt-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            {user?.name ?? "Memur"} 👋
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--mdt-text-secondary)", margin: "0.4rem 0 0", fontWeight: 500 }}>
            Los Angeles Community Police Department · MDT v3.1
          </p>
        </div>

        {/* Duty toggle button */}
        <button
          onClick={toggleDuty}
          disabled={toggling || !user}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.85rem 1.75rem",
            borderRadius: 10,
            border: user?.isOnDuty ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--mdt-border)",
            background: user?.isOnDuty ? "rgba(16,185,129,0.1)" : "var(--mdt-card-bg)",
            color: user?.isOnDuty ? "#10b981" : "var(--mdt-text-secondary)",
            fontWeight: 800, fontSize: "0.9rem",
            cursor: toggling || !user ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: toggling ? 0.6 : 1,
          }}
        >
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: user?.isOnDuty ? "#10b981" : "var(--mdt-text-muted)",
            boxShadow: user?.isOnDuty ? "0 0 8px #10b981" : "none",
            flexShrink: 0,
            animation: user?.isOnDuty ? "mdt-pulse 2s infinite" : "none",
          }} />
          {user?.isOnDuty ? "Görevi Sonlandır" : "Göreve Başla"}
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        {STAT_CARDS.map((card, i) => (
          <div key={i} style={cardStyle}>
            {/* Top: icon + label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mdt-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {card.label}
              </span>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${card.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`fa-solid ${card.icon}`} style={{ fontSize: "0.9rem", color: card.color }} />
              </div>
            </div>

            {/* Value */}
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--mdt-text-primary)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: card.color, fontWeight: 600, paddingBottom: "0.5rem" }}>
              {card.sub}
            </div>

            {/* Sparkline */}
            <SparkLine color={card.color} />
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>

        {/* Left: Recent Reports */}
        <div style={{ background: "var(--mdt-card-bg)", border: "1px solid var(--mdt-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--mdt-border)",
          }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--mdt-text-primary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <i className="fa-solid fa-file-lines" style={{ color: "#3b82f6", fontSize: "0.85rem" }} />
              Son Raporlar
            </h3>
            <Link href="/mdt/raporlar" style={{ fontSize: "0.78rem", color: "#3b82f6", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              Tümünü Gör <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--mdt-text-muted)" }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ marginBottom: "0.75rem", fontSize: "1.5rem" }} /><br />
              Yükleniyor...
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--mdt-text-muted)" }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }} /><br />
              Henüz rapor girişi yapılmadı.
            </div>
          ) : (
            reports.map((rep: any, idx: number) => (
              <Link key={rep.id} href="/mdt/raporlar" style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "1.1rem 1.5rem",
                  borderBottom: idx < reports.length - 1 ? "1px solid var(--mdt-border)" : "none",
                  display: "flex", alignItems: "center", gap: "1rem",
                  transition: "background 0.15s", cursor: "pointer",
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "var(--mdt-hover)"}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "rgba(59,130,246,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <i className="fa-solid fa-file-alt" style={{ color: "#3b82f6", fontSize: "0.85rem" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--mdt-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {rep.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-muted)", marginTop: "0.15rem" }}>
                      #{rep.officer?.badge ?? "—"} {rep.officer?.name} · {timeAgo(rep.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 800,
                    backgroundColor: "rgba(59,130,246,0.12)",
                    color: "#3b82f6", padding: "0.2rem 0.6rem",
                    borderRadius: 6, flexShrink: 0,
                  }}>
                    YENİ
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Active Patrols */}
          <div style={{ background: "var(--mdt-card-bg)", border: "1px solid var(--mdt-border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--mdt-border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--mdt-text-primary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
                Canlı Devriye
              </h3>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                {onDutyOfficers.length} Aktif
              </span>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>Yükleniyor...</div>
            ) : onDutyOfficers.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--mdt-text-muted)", fontSize: "0.85rem" }}>
                Sahada aktif birim yok.
              </div>
            ) : (
              onDutyOfficers.slice(0, 6).map((officer: any, idx: number) => (
                <div key={officer.id} style={{
                  display: "flex", alignItems: "center", gap: "0.85rem",
                  padding: "0.85rem 1.5rem",
                  borderBottom: idx < Math.min(onDutyOfficers.length, 6) - 1 ? "1px solid var(--mdt-border)" : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(16,185,129,0.1)",
                    border: "1.5px solid rgba(16,185,129,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0,
                  }}>
                    {officer.profileImage
                      ? <img src={officer.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <i className="fa-solid fa-user" style={{ fontSize: "0.75rem", color: "#10b981" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "var(--mdt-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {officer.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)" }}>
                      #{officer.badge} · {officer.rank}
                    </div>
                  </div>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 5px #10b981", flexShrink: 0 }} />
                </div>
              ))
            )}

            <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid var(--mdt-border)" }}>
              <Link href="/mdt/mesai" style={{ fontSize: "0.78rem", color: "#3b82f6", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                Tüm Mesai Verilerini Gör <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.65rem" }} />
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div style={{ background: "var(--mdt-card-bg)", border: "1px solid var(--mdt-border)", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 800, color: "var(--mdt-text-primary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <i className="fa-solid fa-bolt" style={{ color: "#f59e0b", fontSize: "0.85rem" }} />
              Hızlı Erişim
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              {QUICK_LINKS.map((ql, i) => (
                <Link key={i} href={ql.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                    padding: "0.9rem",
                    borderRadius: 8, border: "1px solid var(--mdt-border)",
                    background: "transparent",
                    transition: "all 0.15s", cursor: "pointer",
                    textAlign: "center",
                  }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `${ql.color}10`;
                    el.style.borderColor = `${ql.color}30`;
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "var(--mdt-border)";
                  }}
                  >
                    <i className={`fa-solid ${ql.icon}`} style={{ fontSize: "1.15rem", color: ql.color }} />
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mdt-text-secondary)" }}>{ql.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mdt-pulse {
          0%, 100% { box-shadow: 0 0 6px #10b981; }
          50%       { box-shadow: 0 0 14px #10b981; }
        }
      `}</style>
    </div>
  );
}
