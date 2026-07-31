"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/* ─── Vercel-inspired palette ─── */
// bg:      #0a0a0a  (not pitch black, contrast OK in daylight)
// card:    #111111  with border rgba(255,255,255,0.08)
// cardAlt: #161616  slightly lifted
// text:    #ededed  primary | #888 secondary | #555 muted
// accent:  #1D6EF7  LACPD blue (used sparingly)
// green:   #00d26a
// border:  rgba(255,255,255,0.08)

/* ─── Live clock ─── */
function LiveClock() {
  const [t, setT] = useState({ time: "", date: "" });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({
        time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        date: d.toLocaleDateString("tr-TR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right", lineHeight: 1.3 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.55rem", fontWeight: 700, color: "#ededed", letterSpacing: "0.06em" }}>{t.time}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.15rem" }}>{t.date}</div>
    </div>
  );
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "Az önce";
  if (s < 3600) return `${Math.floor(s / 60)} dk`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa`;
  return `${Math.floor(s / 86400)} gün`;
}

function formatSecs(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sc.toString().padStart(2, "0")}`;
}

const QUICK = [
  { icon: "fa-pen-to-square", label: "Rapor Yaz",    href: "/mdt/raporlar",      dot: "#E84F2A" },
  { icon: "fa-fingerprint",   label: "Kriminal",      href: "/mdt/kriminal",      dot: "#8b5cf6" },
  { icon: "fa-users",         label: "Personel",      href: "/mdt/personel",      dot: "#1D6EF7" },
  { icon: "fa-clock",         label: "Mesai",         href: "/mdt/mesai",         dot: "#00d26a" },
  { icon: "fa-bullhorn",      label: "Duyurular",     href: "/mdt/duyurular",     dot: "#06b6d4" },
  { icon: "fa-scale-balanced",label: "Yönetmelik",    href: "/mdt/yonetmelikler", dot: "#f59e0b" },
  { icon: "fa-calendar-xmark",label: "Mazeret/İzin",  href: "/mdt/mazeretler",    dot: "#ec4899" },
  { icon: "fa-envelope",      label: "Mesajlar",      href: "/mdt/mesajlar",      dot: "#34d399" },
];

const RANK_MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#f59e0b", "#888", "#9a7850", "#666", "#555"];

/* ─── Base card — Vercel style ─── */
const card: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  overflow: "hidden",
};

const cardHdr: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0.85rem 1.1rem",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "0.55rem", fontWeight: 700,
  color: "#555", letterSpacing: "0.2em", textTransform: "uppercase",
};

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }             = useSWR("/api/auth/me", fetcher, { refreshInterval: 30000 });
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher, { refreshInterval: 15000 });
  const { data: reportsData }                          = useSWR("/api/reports",  fetcher, { refreshInterval: 30000 });
  const { data: shiftsData,   mutate: mutateShifts }   = useSWR("/api/shifts",   fetcher, { refreshInterval: 10000 });

  const user       = meData?.user ?? null;
  const officers   = officersData?.officers ?? [];
  const allReports = reportsData?.reports ?? [];
  const onDuty     = officers.filter((o: any) => o.isOnDuty);
  const leaderboard: any[] = shiftsData?.leaderboard ?? [];
  const topShift   = [...leaderboard].slice(0, 5);
  const myEntry    = leaderboard.find((e: any) => e.id === user?.id);
  const myRank     = leaderboard.findIndex((e: any) => e.id === user?.id) + 1;

  const [toggling, setToggling] = useState(false);
  const [liveTicks, setLiveTicks] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!shiftsData?.leaderboard) return;
    const ticks: Record<number, number> = {};
    shiftsData.leaderboard.forEach((off: any) => { ticks[off.id] = off.totalSeconds ?? 0; });
    setLiveTicks(ticks);
  }, [shiftsData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks(prev => {
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
      mutateOfficers({ officers: officersData.officers.map((o: any) => o.id === user.id ? { ...o, isOnDuty: next } : o) }, false);
    setToggling(true);
    try {
      await fetch(`/api/officers/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: next }),
      });
      toast.success(next ? "✦ Devriye başlatıldı." : "Devriye sonlandırıldı.", {
        style: { background: "#111", color: "#ededed", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono', monospace" },
      });
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
    { label: "Toplam Personel", value: officers.length,   sub: "kayıtlı memur",   icon: "fa-users",      color: "#1D6EF7", pct: null },
    { label: "Sahada Birim",    value: onDuty.length,     sub: `${officers.length ? Math.round(onDuty.length/officers.length*100) : 0}% aktif`, icon: "fa-car-side", color: "#00d26a", pct: officers.length ? onDuty.length/officers.length : 0 },
    { label: "Toplam Rapor",    value: allReports.length, sub: "sisteme girilmiş", icon: "fa-file-lines", color: "#f59e0b", pct: null },
    { label: "Mesai Sürem",     value: formatSecs(myLiveSecs), sub: myRank > 0 ? `Sıralama #${myRank}` : "—", icon: "fa-trophy", color: "#8b5cf6", pct: null, mono: true },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes blink-green { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .stat-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .stat-card:hover { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.06) !important; transform: translateY(-2px); }
        .ql-item  { transition: background 0.15s, border-color 0.15s; }
        .ql-item:hover  { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.14) !important; }
        .rep-row  { transition: background 0.14s; }
        .rep-row:hover  { background: rgba(255,255,255,0.04) !important; }
        .pat-row  { transition: background 0.14s; }
        .pat-row:hover  { background: rgba(255,255,255,0.04) !important; }
        .duty-btn { transition: all 0.22s ease; }
        .duty-btn:hover:not(:disabled) { filter: brightness(1.15) !important; }
        .vlink { transition: color 0.14s; }
        .vlink:hover { color: #ededed !important; }
        .lb-row { transition: background 0.14s; }
        .lb-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 1440, margin: "0 auto", paddingBottom: "2rem" }}>

        {/* ═══ ROW 1 — HERO ═══ */}
        <div style={{
          ...card,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
          padding: "1.5rem 2rem",
          borderTop: "1px solid rgba(29,110,247,0.4)",
          background: "#111111",
        }}>
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.65rem" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#1D6EF7", fontSize: "0.6rem" }} />
              <span style={{ ...sectionLabel }}>L.A.C.P.D. · KOMUTA MERKEZİ · MDT v3.2</span>
              <span style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                padding: "0.12rem 0.55rem", borderRadius: 4,
                background: "rgba(0,210,106,0.08)", border: "1px solid rgba(0,210,106,0.18)",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d26a", display: "inline-block" }} />
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#00d26a", letterSpacing: "0.1em" }}>CANLI</span>
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#ededed", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Hoş Geldin,{" "}
              <span style={{ color: "#1D6EF7" }}>
                {loading ? "—" : user?.name?.split(" ")[0] ?? "Memur"}
              </span>
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 700, color: "#1D6EF7", background: "rgba(29,110,247,0.08)", padding: "0.2rem 0.65rem", borderRadius: 4, border: "1px solid rgba(29,110,247,0.2)" }}>#{user?.badge ?? "—"}</span>
              <span style={{ fontSize: "0.7rem", color: "#888", padding: "0.2rem 0.65rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)" }}>{user?.rank ?? "—"}</span>
              <span style={{ fontSize: "0.7rem", color: "#555", padding: "0.2rem 0.65rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>{user?.department ?? "—"}</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
            <LiveClock />
            <button
              className="duty-btn"
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                padding: "0.7rem 1.5rem", borderRadius: 6,
                border: user?.isOnDuty ? "1px solid rgba(0,210,106,0.35)" : "1px solid rgba(255,255,255,0.12)",
                background: user?.isOnDuty ? "rgba(0,210,106,0.1)" : "#1a1a1a",
                color: user?.isOnDuty ? "#00d26a" : "#ededed",
                fontWeight: 700, fontSize: "0.76rem", textTransform: "uppercase",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                opacity: toggling ? 0.55 : 1,
                letterSpacing: "0.09em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: user?.isOnDuty ? "#00d26a" : "#333",
                boxShadow: user?.isOnDuty ? "0 0 8px #00d26a" : "none",
              }} />
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.65rem" }} />
              {toggling ? "İŞLENİYOR..." : user?.isOnDuty ? "GÖREVİ BİTİR" : "GÖREVE BAŞLA"}
            </button>
          </div>
        </div>

        {/* ═══ ROW 2 — STATS ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{ ...card, padding: "1.2rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...sectionLabel }}>{s.label}</span>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: "0.72rem", color: "#444" }} />
              </div>
              <div style={{
                fontFamily: (s as any).mono ? "'JetBrains Mono', monospace" : "inherit",
                fontSize: (s as any).mono ? "1.4rem" : "2.2rem",
                fontWeight: 800, color: "#ededed", lineHeight: 1.1,
                letterSpacing: (s as any).mono ? "0.04em" : "-0.04em",
              }}>
                {loading ? <span style={{ color: "#333" }}>—</span> : s.value}
              </div>
              {s.pct !== null && s.pct !== undefined && (
                <div style={{ height: 2, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.round(s.pct * 100)}%`,
                    background: s.color, borderRadius: 2, transition: "width 1s ease",
                  }} />
                </div>
              )}
              <div style={{ fontSize: "0.67rem", color: "#555", fontWeight: 600 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══ ROW 3 — MAIN GRID ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "0.75rem", alignItems: "start" }}>

          {/* ── Son Raporlar ── */}
          <div style={card}>
            <div style={cardHdr}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <i className="fa-solid fa-file-lines" style={{ fontSize: "0.72rem", color: "#444" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ededed" }}>Son Raporlar</span>
              </div>
              <Link href="/mdt/raporlar" className="vlink" style={{ fontSize: "0.63rem", color: "#555", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", letterSpacing: "0.04em" }}>
                TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.5rem" }} />
              </Link>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#333", fontSize: "0.75rem" }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Yükleniyor...
                </div>
              ) : allReports.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#333", fontSize: "0.75rem" }}>Henüz rapor girilmemiş.</div>
              ) : (
                allReports.slice(0, 8).map((r: any) => (
                  <Link key={r.id} href="/mdt/raporlar" style={{ textDecoration: "none", display: "block" }}>
                    <div className="rep-row" style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.65rem 1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div style={{ width: 4, height: 4, background: "#1D6EF7", borderRadius: "50%", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d4d4d4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                        <div style={{ fontSize: "0.62rem", color: "#555", marginTop: 3, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>#{r.officer?.badge}</span>
                          <span style={{ color: "#333" }}>·</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right" style={{ color: "#333", fontSize: "0.5rem", flexShrink: 0 }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Canlı Devriye ── */}
          <div style={card}>
            <div style={cardHdr}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <i className="fa-solid fa-car-side" style={{ fontSize: "0.72rem", color: "#444" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ededed" }}>Canlı Devriye</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 700,
                color: onDuty.length > 0 ? "#00d26a" : "#444",
                padding: "0.15rem 0.5rem", borderRadius: 4,
                background: onDuty.length > 0 ? "rgba(0,210,106,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${onDuty.length > 0 ? "rgba(0,210,106,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}>
                {onDuty.length} AKTİF
              </span>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#333", fontSize: "0.75rem" }}>Yükleniyor...</div>
              ) : onDuty.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                  <i className="fa-solid fa-car-side" style={{ display: "block", fontSize: "1.4rem", marginBottom: "0.5rem", color: "#222" }} />
                  <span style={{ fontSize: "0.75rem", color: "#333" }}>Sahada aktif birim yok.</span>
                </div>
              ) : (
                onDuty.map((o: any) => {
                  const initials = o.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                  return (
                    <div key={o.id} className="pat-row" style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.65rem 1.1rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                        background: o.profileImage ? "transparent" : "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                      }}>
                        {o.profileImage
                          ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>{initials}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d4d4d4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                        <div style={{ fontSize: "0.62rem", color: "#555", marginTop: 3, display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>#{o.badge}</span>
                          <span style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>{o.rank}</span>
                        </div>
                      </div>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d26a", flexShrink: 0, boxShadow: "0 0 6px #00d26a" }} />
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ padding: "0.6rem 1.1rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <Link href="/mdt/mesai" className="vlink" style={{ fontSize: "0.63rem", color: "#444", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                TÜM MESAİ LİSTESİ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.5rem" }} />
              </Link>
            </div>
          </div>

          {/* ── Col 3 ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {/* Hızlı Erişim */}
            <div style={card}>
              <div style={cardHdr}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  <i className="fa-solid fa-bolt" style={{ fontSize: "0.68rem", color: "#444" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ededed" }}>Hızlı Erişim</span>
                </div>
              </div>
              <div style={{ padding: "0.6rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {QUICK.map((q, i) => (
                  <Link key={i} href={q.href} style={{ textDecoration: "none" }}>
                    <div className="ql-item" style={{
                      display: "flex", alignItems: "center", gap: "0.55rem",
                      padding: "0.58rem 0.7rem", borderRadius: 5,
                      background: "#161616", border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: q.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#888" }}>{q.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Mesai */}
            <div style={card}>
              <div style={cardHdr}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  <i className="fa-solid fa-ranking-star" style={{ fontSize: "0.68rem", color: "#444" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ededed" }}>Top Mesai</span>
                </div>
                <Link href="/mdt/mesai" className="vlink" style={{ fontSize: "0.6rem", color: "#444", textDecoration: "none", fontWeight: 600, letterSpacing: "0.05em" }}>
                  TÜMÜ <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.48rem" }} />
                </Link>
              </div>
              <div>
                {!shiftsData ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#333", fontSize: "0.72rem" }}>Yükleniyor...</div>
                ) : topShift.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#333", fontSize: "0.72rem" }}>Henüz mesai kaydı yok.</div>
                ) : (
                  topShift.map((e: any, i: number) => {
                    const currentSecs = liveTicks[e.id] ?? e.totalSeconds ?? 0;
                    return (
                      <div key={e.id} className="lb-row" style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.6rem 1rem",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: i < 3 ? "0.8rem" : "0.65rem",
                          fontWeight: 800,
                          color: RANK_COLORS[i] ?? "#333",
                          width: 22, textAlign: "center", flexShrink: 0,
                        }}>
                          {i < 3 ? RANK_MEDAL[i] : `#${i + 1}`}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#d4d4d4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                          {e.isOnDuty && (
                            <div style={{ fontSize: "0.52rem", color: "#00d26a", fontWeight: 700, marginTop: 1, letterSpacing: "0.08em" }}>● AKTİF</div>
                          )}
                        </div>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem", fontWeight: 700,
                          color: e.isOnDuty ? "#00d26a" : "#555",
                          flexShrink: 0,
                        }}>
                          {formatSecs(currentSecs)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
