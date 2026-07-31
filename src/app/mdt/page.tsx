"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/* ─── Live clock ─── */
function LiveClock() {
  const [t, setT] = useState({ time: "", date: "" });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({
        time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        date: d.toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right", lineHeight: 1.2 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.35rem", fontWeight: 700, color: "#e8ecf5", letterSpacing: "0.08em" }}>{t.time}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(29,110,247,0.55)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.date}</div>
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
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}s ${m}d`;
}

const card: React.CSSProperties = {
  background: "rgba(6,10,18,0.7)",
  backdropFilter: "blur(32px)",
  border: "1px solid rgba(29,110,247,0.15)",
  borderTop: "2px solid rgba(29,110,247,0.3)",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(29,110,247,0.1)",
};

const CARD_HDR: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0.85rem 1.1rem",
  borderBottom: "1px solid rgba(29,110,247,0.15)",
  background: "linear-gradient(90deg, rgba(29,110,247,0.08) 0%, transparent 100%)",
};

const SECT_LABEL: React.CSSProperties = {
  fontSize: "0.58rem", fontWeight: 800,
  color: "rgba(29,110,247,0.45)", letterSpacing: "0.22em", textTransform: "uppercase",
};

const ICON_BOX = (color: string): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
  background: `${color}12`,
  border: `1px solid ${color}28`,
  display: "flex", alignItems: "center", justifyContent: "center",
});

const QUICK = [
  { icon: "fa-pen-to-square", label: "Rapor Yaz",   href: "/mdt/raporlar",      color: "#E84F2A" },
  { icon: "fa-fingerprint",   label: "Kriminal",     href: "/mdt/kriminal",      color: "#8b5cf6" },
  { icon: "fa-users",         label: "Personel",     href: "/mdt/personel",      color: "#1D6EF7" },
  { icon: "fa-clock",         label: "Mesai",        href: "/mdt/mesai",         color: "#22c55e" },
  { icon: "fa-bullhorn",      label: "Duyurular",    href: "/mdt/duyurular",     color: "#06b6d4" },
  { icon: "fa-scale-balanced",label: "Yönetmelik",   href: "/mdt/yonetmelikler", color: "#f59e0b" },
  { icon: "fa-calendar-xmark",label: "Mazeret/İzin", href: "/mdt/mazeretler",    color: "#ec4899" },
  { icon: "fa-envelope",      label: "Mesajlar",     href: "/mdt/mesajlar",      color: "#34d399" },
];

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7f32", "#6366f1", "#6366f1"];

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe }             = useSWR("/api/auth/me", fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher);
  const { data: reportsData }                          = useSWR("/api/reports", fetcher);
  const { data: shiftsData }                           = useSWR("/api/shifts", fetcher);

  const user       = meData?.user ?? null;
  const officers   = officersData?.officers ?? [];
  const allReports = reportsData?.reports ?? [];
  const onDuty     = officers.filter((o: any) => o.isOnDuty);
  const topShift   = [...(shiftsData?.leaderboard ?? [])].sort((a: any, b: any) => b.totalSeconds - a.totalSeconds).slice(0, 5);
  const myEntry    = shiftsData?.leaderboard?.find((e: any) => e.id === user?.id);
  const myRank     = (shiftsData?.leaderboard ?? []).sort((a: any, b: any) => b.totalSeconds - a.totalSeconds).findIndex((e: any) => e.id === user?.id) + 1;

  const [toggling, setToggling] = useState(false);
  const [tick, setTick]         = useState(0);
  const dutyStart = useRef<number | null>(null);

  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    const next = !user.isOnDuty;
    if (next) dutyStart.current = Date.now();
    else dutyStart.current = null;
    mutateMe({ user: { ...user, isOnDuty: next } }, false);
    if (officersData?.officers)
      mutateOfficers({ officers: officersData.officers.map((o: any) => o.id === user.id ? { ...o, isOnDuty: next } : o) }, false);
    setToggling(true);
    try {
      await fetch(`/api/officers/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isOnDuty: next }) });
      toast.success(next ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", { style: { background: "#0d1220", color: "#e8ecf5", border: "1px solid rgba(29,110,247,0.2)" } });
      mutateMe(); mutateOfficers();
    } catch { toast.error("Bağlantı hatası."); }
    finally  { setToggling(false); }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  const loading = !meData || !officersData || !reportsData;

  const STATS = [
    { label: "Toplam Personel", value: officers.length,  sub: "kayıtlı memur",    icon: "fa-users",      color: "#1D6EF7", pct: null },
    { label: "Sahada Birim",    value: onDuty.length,    sub: `${officers.length ? Math.round(onDuty.length/officers.length*100) : 0}% aktif`, icon: "fa-car-side",   color: "#22c55e", pct: officers.length ? onDuty.length/officers.length : 0 },
    { label: "Toplam Rapor",    value: allReports.length, sub: "sisteme girilmiş", icon: "fa-file-lines", color: "#f59e0b", pct: null },
    { label: "Mesai Sıram",     value: myRank > 0 ? `#${myRank}` : "—", sub: formatSecs(myEntry?.totalSeconds ?? 0), icon: "fa-trophy", color: "#8b5cf6", pct: null },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .dash-ql { position: relative; overflow: hidden; }
        .dash-ql::before { content: ''; position: absolute; left: 0; top: 0; width: 2px; height: 100%; background: transparent; transition: all 0.2s ease; }
        .dash-ql:hover { background: rgba(29,110,247,0.08) !important; border-color: rgba(29,110,247,0.3) !important; }
        .dash-ql:hover::before { background: #1D6EF7; }
        .dash-stat { position: relative; overflow: hidden; }
        .dash-stat::after { content: ''; position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(29,110,247,0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .dash-stat:hover { border-color: rgba(29,110,247,0.4) !important; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(29,110,247,0.1); }
        .rep-row:hover { background: linear-gradient(90deg, rgba(29,110,247,0.1) 0%, transparent 100%) !important; border-left: 2px solid #1D6EF7; padding-left: calc(1.1rem - 2px) !important; }
        .patrol-row:hover { background: linear-gradient(90deg, rgba(34,197,94,0.1) 0%, transparent 100%) !important; border-left: 2px solid #22c55e; padding-left: calc(1.1rem - 2px) !important; }
        .duty-btn:hover:not(:disabled) { filter: brightness(1.2) !important; transform: scale(1.03) !important; box-shadow: 0 0 25px rgba(34,197,94,0.3) !important; }
        .view-link:hover { color: #1D6EF7 !important; letter-spacing: 0.05em; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 1440, margin: "0 auto" }}>

        {/* ═══════════ ROW 1 — HERO BANNER ═══════════ */}
        <div style={{
          ...card,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
          padding: "1.5rem 2rem",
          borderTop: "2px solid rgba(29,110,247,0.35)",
          background: "rgba(6,10,18,0.85)",
          boxShadow: "0 0 60px rgba(29,110,247,0.05)",
        }}>
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "rgba(29,110,247,0.45)", fontSize: "0.65rem" }} />
              <span style={{ ...SECT_LABEL }}>L.A.C.P.D. · KOMUTA MERKEZİ · MDT v3.2</span>
              {/* Live status dot */}
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginLeft: "0.5rem", padding: "0.18rem 0.6rem", borderRadius: 20, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block", animation: "mdt-pulse-green 2s infinite" }} />
                <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em" }}>CANLI</span>
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "#e8ecf5", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Hoş Geldin,{" "}
              <span style={{ background: "linear-gradient(90deg, #4A8EFA, #1D6EF7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {loading ? "—" : user?.name?.split(" ")[0] ?? "Memur"}
              </span>
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "rgba(29,110,247,0.6)", background: "rgba(29,110,247,0.06)", padding: "0.22rem 0.65rem", borderRadius: 20, border: "1px solid rgba(29,110,247,0.15)" }}>
                #{user?.badge ?? "—"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(200,208,230,0.45)", padding: "0.22rem 0.65rem", borderRadius: 20, border: "1px solid rgba(29,110,247,0.08)" }}>
                {user?.rank ?? "—"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "rgba(200,208,230,0.35)", padding: "0.22rem 0.65rem", borderRadius: 20, border: "1px solid rgba(29,110,247,0.06)" }}>
                {user?.department ?? "—"}
              </span>
            </div>
          </div>

          {/* Right — clock + duty */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
            <LiveClock />
            <button
              className="duty-btn"
              onClick={toggleDuty}
              disabled={toggling || !user}
              style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                padding: "0.75rem 1.5rem", borderRadius: 6,
                border: user?.isOnDuty ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(29,110,247,0.3)",
                background: user?.isOnDuty ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)" : "linear-gradient(135deg, rgba(29,110,247,0.15) 0%, rgba(29,110,247,0.05) 100%)",
                color: user?.isOnDuty ? "#4ade80" : "#e8ecf5",
                fontWeight: 800, fontSize: "0.82rem", textTransform: "uppercase",
                cursor: toggling || !user ? "not-allowed" : "pointer",
                opacity: toggling ? 0.6 : 1,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: user?.isOnDuty ? "0 0 20px rgba(34,197,94,0.2), inset 0 0 10px rgba(34,197,94,0.1)" : "inset 0 0 10px rgba(29,110,247,0.1)",
                letterSpacing: "0.08em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: user?.isOnDuty ? "#4ade80" : "rgba(200,208,230,0.3)", boxShadow: user?.isOnDuty ? "0 0 10px #4ade80" : "none", flexShrink: 0 }} />
              <i className={`fa-solid ${user?.isOnDuty ? "fa-stop" : "fa-play"}`} style={{ fontSize: "0.72rem" }} />
              {user?.isOnDuty ? "GÖREVİ BİTİR" : "GÖREVE BAŞLA"}
            </button>
          </div>
        </div>

        {/* ═══════════ ROW 2 — 4 STAT CARDS ═══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.9rem" }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              className="dash-stat"
              style={{
                ...card,
                padding: "1.1rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
                borderTop: `2px solid ${s.color}40`,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ ...SECT_LABEL }}>{s.label}</span>
                <div style={ICON_BOX(s.color)}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: "0.75rem", color: s.color }} />
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2.2rem", fontWeight: 900, color: "#e8ecf5", lineHeight: 1, letterSpacing: "-0.04em" }}>
                {loading ? <span style={{ opacity: 0.2 }}>—</span> : s.value}
              </div>
              {s.pct !== null && s.pct !== undefined && (
                <div style={{ height: 3, borderRadius: 2, background: "rgba(29,110,247,0.1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round(s.pct * 100)}%`, background: `linear-gradient(90deg, ${s.color}80, ${s.color})`, borderRadius: 2, transition: "width 0.8s ease" }} />
                </div>
              )}
              <div style={{ fontSize: "0.7rem", color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══════════ ROW 3 — 3-COL MAIN GRID ═══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: "0.9rem", alignItems: "start" }}>

          {/* ─── COL 1: Son Raporlar ─── */}
          <div style={card}>
            <div style={CARD_HDR}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={ICON_BOX("#1D6EF7")}><i className="fa-solid fa-file-lines" style={{ fontSize: "0.72rem", color: "#1D6EF7" }} /></div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5" }}>Son Raporlar</span>
              </div>
              <Link href="/mdt/raporlar" className="view-link" style={{ fontSize: "0.68rem", color: "rgba(29,110,247,0.5)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", transition: "color 0.15s" }}>
                Tümü <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.55rem" }} />
              </Link>
            </div>
            <div style={{ padding: "0.4rem 0" }}>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.2)", fontSize: "0.78rem" }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Yükleniyor...
                </div>
              ) : allReports.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.2)", fontSize: "0.78rem" }}>Henüz rapor girilmemiş.</div>
              ) : (
                allReports.slice(0, 7).map((r: any) => (
                  <Link key={r.id} href="/mdt/raporlar" style={{ textDecoration: "none", display: "block" }}>
                    <div className="rep-row" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.1rem", transition: "all 0.2s", borderBottom: "1px solid rgba(29,110,247,0.04)" }}>
                      <div style={{ width: 6, height: 6, background: "#1D6EF7", flexShrink: 0, boxShadow: "0 0 8px rgba(29,110,247,0.8)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.02em" }}>{r.title}</div>
                        <div style={{ fontSize: "0.65rem", color: "rgba(200,208,230,0.4)", marginTop: 4, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.7)", background: "rgba(29,110,247,0.08)", padding: "0.1rem 0.3rem", borderRadius: 2 }}>#{r.officer?.badge}</span>
                          <span style={{ color: "rgba(200,208,230,0.2)" }}>/</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right" style={{ color: "rgba(29,110,247,0.3)", fontSize: "0.55rem", flexShrink: 0 }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ─── COL 2: Canlı Devriye ─── */}
          <div style={card}>
            <div style={CARD_HDR}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={ICON_BOX("#22c55e")}><i className="fa-solid fa-car-side" style={{ fontSize: "0.72rem", color: "#22c55e" }} /></div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5" }}>Canlı Devriye</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 800, color: onDuty.length > 0 ? "#22c55e" : "rgba(200,208,230,0.25)", padding: "0.18rem 0.6rem", borderRadius: 20, background: onDuty.length > 0 ? "rgba(34,197,94,0.08)" : "rgba(29,110,247,0.03)", border: `1px solid ${onDuty.length > 0 ? "rgba(34,197,94,0.2)" : "rgba(29,110,247,0.06)"}` }}>
                {onDuty.length} AKTİF
              </span>
            </div>
            <div style={{ padding: "0.4rem 0" }}>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "rgba(200,208,230,0.2)", fontSize: "0.78rem" }}>Yükleniyor...</div>
              ) : onDuty.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center" }}>
                  <i className="fa-solid fa-car-side" style={{ display: "block", fontSize: "1.4rem", marginBottom: "0.5rem", color: "rgba(29,110,247,0.1)" }} />
                  <span style={{ fontSize: "0.78rem", color: "rgba(200,208,230,0.2)" }}>Sahada aktif birim yok.</span>
                </div>
              ) : (
                onDuty.map((o: any) => (
                  <div key={o.id} className="patrol-row" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.1rem", transition: "all 0.2s", borderBottom: "1px solid rgba(34,197,94,0.04)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "4px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {o.profileImage
                        ? <img src={o.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <i className="fa-solid fa-user-shield" style={{ fontSize: "0.8rem", color: "rgba(34,197,94,0.6)" }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.02em" }}>{o.name}</div>
                      <div style={{ fontSize: "0.62rem", color: "rgba(200,208,230,0.4)", marginTop: 4, display: "flex", gap: "0.4rem", alignItems: "center" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(34,197,94,0.7)", background: "rgba(34,197,94,0.08)", padding: "0.1rem 0.3rem", borderRadius: 2 }}>#{o.badge}</span>
                        <span style={{ textTransform: "uppercase" }}>{o.rank}</span>
                      </div>
                    </div>
                    <span style={{ width: 6, height: 6, background: "#22c55e", boxShadow: "0 0 10px #22c55e", flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: "0.6rem 1.1rem", borderTop: "1px solid rgba(34,197,94,0.06)" }}>
              <Link href="/mdt/mesai" className="view-link" style={{ fontSize: "0.68rem", color: "rgba(200,208,230,0.3)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", transition: "color 0.15s" }}>
                Tüm Mesai Listesi <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.55rem" }} />
              </Link>
            </div>
          </div>

          {/* ─── COL 3: Hızlı Erişim + Mesai Sıralaması ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

            {/* Hızlı Erişim */}
            <div style={card}>
              <div style={CARD_HDR}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={ICON_BOX("#E84F2A")}><i className="fa-solid fa-bolt" style={{ fontSize: "0.72rem", color: "#E84F2A" }} /></div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5" }}>Hızlı Erişim</span>
                </div>
              </div>
              <div style={{ padding: "0.6rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {QUICK.map((q, i) => (
                  <Link key={i} href={q.href} style={{ textDecoration: "none" }}>
                    <div
                      className="dash-ql"
                      style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.6rem 0.8rem", borderRadius: 4,
                        background: "rgba(29,110,247,0.03)", border: "1px solid rgba(29,110,247,0.1)",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      <i className={`fa-solid ${q.icon}`} style={{ fontSize: "0.8rem", color: q.color, width: 16, textAlign: "center" }} />
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(200,208,230,0.7)", letterSpacing: "0.02em" }}>{q.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mesai Sıralaması */}
            <div style={card}>
              <div style={CARD_HDR}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={ICON_BOX("#f59e0b")}><i className="fa-solid fa-ranking-star" style={{ fontSize: "0.72rem", color: "#f59e0b" }} /></div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e8ecf5" }}>Top Mesai</span>
                </div>
                <Link href="/mdt/mesai" className="view-link" style={{ fontSize: "0.65rem", color: "rgba(29,110,247,0.4)", textDecoration: "none", transition: "color 0.15s" }}>
                  Tümü <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.5rem" }} />
                </Link>
              </div>
              <div style={{ padding: "0.4rem 0" }}>
                {!shiftsData ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "rgba(200,208,230,0.2)", fontSize: "0.75rem" }}>Yükleniyor...</div>
                ) : topShift.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "rgba(200,208,230,0.2)", fontSize: "0.75rem" }}>Henüz mesai kaydı yok.</div>
                ) : (
                  topShift.map((e: any, i: number) => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 1.1rem", borderBottom: "1px solid rgba(29,110,247,0.04)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 800, color: RANK_COLORS[i] ?? "rgba(200,208,230,0.3)", width: 18, textAlign: "center" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e8ecf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: "rgba(29,110,247,0.6)", background: "rgba(29,110,247,0.08)", padding: "0.1rem 0.35rem", borderRadius: 2 }}>{formatSecs(e.totalSeconds)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
