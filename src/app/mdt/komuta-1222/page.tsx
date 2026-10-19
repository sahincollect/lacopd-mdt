"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface SiteImage {
  id: number;
  url: string;
  type: string;
  createdAt: string;
}

const CIVIL_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  memur: { label: "Memur Başvurusu", icon: "fa-shield-halved", color: "var(--LAC-orange)" },
  "ride-along": { label: "Ride Along", icon: "fa-car-side", color: "#8B5CF6" },
  sikayet: { label: "Şikayet", icon: "fa-triangle-exclamation", color: "#F59E0B" },
};
const STATUS_OPTIONS = ["Bekliyor", "Inceleniyor", "Onaylandi", "Reddedildi"];
const STATUS_COLORS: Record<string, string> = {
  Bekliyor: "#F59E0B",
  Inceleniyor: "var(--LAC-orange)",
  Onaylandi: "#34D399",
  Reddedildi: "#F87171",
};
const DIVISIONS = [
  { id: "detective", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "#0284c7" },
  { id: "gnd", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "#EC4899" },
  { id: "git", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "#8b5cf6" },
  { id: "k9", name: "K-9 Unit", icon: "fa-paw", color: "#F59E0B" },
  { id: "dive", name: "Dive Unit", icon: "fa-water", color: "#0ea5e9" },
  { id: "swat", name: "SWAT Unit", icon: "fa-crosshairs", color: "#0ea5e9" },
  { id: "patrol", name: "Traffic Unit", icon: "fa-car", color: "#10B981" },
  { id: "air", name: "Air Unit", icon: "fa-helicopter", color: "#0369a1" },
];

type TabKey = "PERSONEL" | "DENETIM" | "LOGLAR" | "DEPARTMAN" | "SIVIL" | "SISTEM";

export default function HighCommandSecretAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("LOGLAR");

  // ── SWR DATA FETCHING ──
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR("/api/officers", fetcher);
  const { data: logsData, mutate: mutateLogs } = useSWR("/api/honeypot", fetcher);
  const { data: reportsData, mutate: mutateReports } = useSWR("/api/reports", fetcher);
  const { data: criminalsData, mutate: mutateCriminals } = useSWR("/api/criminals", fetcher);
  const { data: shiftsData, mutate: mutateShifts } = useSWR("/api/shifts", fetcher);
  const { data: imagesData, mutate: mutateImages } = useSWR("/api/images", fetcher);
  const { data: appData, mutate: mutateApps } = useSWR("/api/basvuru", fetcher);
  const { data: civilData, mutate: mutateCivil } = useSWR("/api/civil-applications", fetcher);

  const user = meData?.user;
  const officers: any[] = officersData?.officers || [];
  const allLogs: any[] = logsData?.logs || [];
  const reports: any[] = reportsData?.reports || [];
  const criminals: any[] = criminalsData?.criminals || [];
  const shifts: any[] = shiftsData?.leaderboard || [];
  const images: SiteImage[] = imagesData?.images || [];
  const applications: any[] = appData?.applications || [];
  const civilApplications: any[] = civilData?.applications || [];

  // ── PERSONEL STATES ──
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerFilter, setOfficerFilter] = useState<"ALL" | "PENDING" | "ADMIN">("ALL");
  const [editingOfficer, setEditingOfficer] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    badge: "",
    name: "",
    password: "",
    rank: "Police Officer I",
    department: "Genel Devriye",
    role: "user",
    specialRoles: "",
  });

  // ── DENETIM SUB-TAB STATE ──
  const [auditSubTab, setAuditSubTab] = useState<"RAPORLAR" | "SABIKA" | "MESAI">("RAPORLAR");
  const [auditSearch, setAuditSearch] = useState("");

  // ── LOGS FILTER ──
  const [logFilter, setLogFilter] = useState<"HONEYPOT" | "LOGIN" | "ALL">("HONEYPOT");

  // ── SYSTEM & MEDIA STATES ──
  const [url, setUrl] = useState("");
  const [type, setType] = useState("GALERI");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── CIVIL APPS EXPAND STATE ──
  const [expandedCivilId, setExpandedCivilId] = useState<number | null>(null);

  if (!meData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid var(--border-light)", borderTopColor: "var(--LAC-orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>KOMUTA MERKEZİ YÜKLENİYOR</span>
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "#F87171" }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "3rem", marginBottom: "1rem" }} />
        <h2>YETKİSİZ ERİŞİM</h2>
        <p>Bu alana girmek için Yüksek Komuta (Admin) yetkisine sahip olmalısınız.</p>
      </div>
    );
  }

  // ── HANDLERS: PERSONEL ──
  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfficer),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Yeni personel başarıyla eklendi.");
        setShowAddModal(false);
        setNewOfficer({ badge: "", name: "", password: "", rank: "Police Officer I", department: "Genel Devriye", role: "user", specialRoles: "" });
        mutateOfficers();
      } else {
        toast.error(data.error || "Personel eklenemedi.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    }
  };

  const handleSaveOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficer) return;
    try {
      const payload: any = {
        badge: editingOfficer.badge,
        name: editingOfficer.name,
        rank: editingOfficer.rank,
        department: editingOfficer.department,
        role: editingOfficer.role,
        status: editingOfficer.status,
        specialRoles: editingOfficer.specialRoles || "",
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }
      const res = await fetch(`/api/officers/${editingOfficer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Personel bilgileri güncellendi.");
        setEditingOfficer(null);
        setNewPassword("");
        mutateOfficers();
      } else {
        const d = await res.json();
        toast.error(d.error || "Güncelleme başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    }
  };

  const handleQuickOfficerStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/officers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Hesap durumu ${status} olarak güncellendi.`);
        mutateOfficers();
      }
    } catch {
      toast.error("Hata oluştu.");
    }
  };

  const handleDeleteOfficer = async (id: number, name: string) => {
    if (!confirm(`${name} adlı personeli ve tüm kayıtlarını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/officers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Personel sistemden ihraç edildi / silindi.");
        mutateOfficers();
      } else {
        toast.error("Silinemedi.");
      }
    } catch {
      toast.error("Hata oluştu.");
    }
  };

  // ── HANDLERS: AUDIT (REPORTS, CRIMINALS, SHIFTS) ──
  const handleDeleteReport = async (id: number) => {
    if (!confirm("Bu raporu kalıcı olarak silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Rapor silindi.");
      mutateReports();
    } else toast.error("Rapor silinemedi.");
  };

  const handleDeleteCriminal = async (id: number) => {
    if (!confirm("Bu sabıka kaydını silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/criminals/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Sabıka kaydı silindi.");
      mutateCriminals();
    } else toast.error("Kayıt silinemedi.");
  };

  const handleResetShifts = async () => {
    if (!confirm("DİKKAT: TÜM PERSONEL MESAİ SÜRELERİNİ SIFIRLAMAK ÜZERESİNİZ. Onaylıyor musunuz?")) return;
    try {
      const res = await fetch("/api/shifts/reset", { method: "DELETE" });
      if (res.ok) {
        toast.success("Tüm mesai süreleri sıfırlandı.");
        mutateShifts();
      } else toast.error("Mesailer sıfırlanamadı.");
    } catch {
      toast.error("Sıfırlama hatası.");
    }
  };

  // ── HANDLERS: LOGS ──
  const handleClearLogs = async (mode: "honeypot" | "all") => {
    const msg = mode === "honeypot" ? "Sazan (/admin) kayıtlarını temizlemek istiyor musunuz?" : "TÜM güvenlik ve giriş loglarını temizlemek istiyor musunuz?";
    if (!confirm(msg)) return;
    const res = await fetch(`/api/honeypot?mode=${mode}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Loglar temizlendi.");
      mutateLogs();
    }
  };

  // ── HANDLERS: SYSTEM & MEDIA ──
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url.startsWith("/media") && !url.startsWith("/gallery") && !url.startsWith("http")) {
      setError("URL geçerli bir link veya /media... şeklinde olmalıdır.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      });
      if (res.ok) {
        setUrl("");
        toast.success("Medya başarıyla eklendi!");
        mutateImages();
      } else {
        const data = await res.json();
        setError(data.error || "Resim eklenemedi.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("Bu resmi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Medya silindi.");
      mutateImages();
    }
  };

  const handleDbSync = async () => {
    const res = await fetch("/api/admin/db-sync");
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      mutateOfficers();
    } else {
      toast.error(data.error || "Senkronizasyon hatası.");
    }
  };

  // ── HANDLERS: UNIT & CIVIL APPS ──
  const handleUpdateUnitStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/basvuru/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Birim başvurusu güncellendi.");
      mutateApps();
    }
  };

  const handleDeleteUnitApp = async (id: number) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/basvuru/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Başvuru silindi.");
      mutateApps();
    }
  };

  const updateCivilStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/civil-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Sivil başvuru durumu güncellendi.");
      mutateCivil();
    }
  };

  const deleteCivilApp = async (id: number) => {
    if (!confirm("Bu sivil başvuruyu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/civil-applications/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Sivil başvuru silindi.");
      mutateCivil();
      if (expandedCivilId === id) setExpandedCivilId(null);
    }
  };

  const parseContent = (content: string): Record<string, any> => {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  };

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h} sa ${m} dk`;
  };

  const honeypotLogs = allLogs.filter((l) => l.badge?.startsWith("HONEYPOT:"));
  const loginLogs = allLogs.filter((l) => !l.badge?.startsWith("HONEYPOT:"));
  const displayedLogs =
    logFilter === "HONEYPOT" ? honeypotLogs : logFilter === "LOGIN" ? loginLogs : allLogs;

  const filteredOfficers = officers.filter((o) => {
    const matchesSearch =
      o.name?.toLowerCase().includes(officerSearch.toLowerCase()) ||
      o.badge?.toLowerCase().includes(officerSearch.toLowerCase()) ||
      o.rank?.toLowerCase().includes(officerSearch.toLowerCase()) ||
      o.department?.toLowerCase().includes(officerSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (officerFilter === "PENDING") return o.status === "PENDING";
    if (officerFilter === "ADMIN") return o.role === "admin";
    return true;
  });

  const pendingOfficersCount = officers.filter((o) => o.status === "PENDING").length;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "5rem", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--LAC-orange)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              HIGH COMMAND OVERWATCH • GİZLİ YÖNETİM TERMİNALİ
            </span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#475569" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#34D399", letterSpacing: "0.1em" }}>
              /mdt/komuta-1222
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
            Yüksek Komuta Kontrol Merkezi
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "var(--bg-secondary)", padding: "0.4rem", borderRadius: "2px", border: "1px solid var(--border-light)", flexWrap: "wrap" }}>
          {[
            { key: "LOGLAR", label: `🎯 Sazan & Loglar (${honeypotLogs.length})` },
            { key: "PERSONEL", label: `👮 Personel (${officers.length})${pendingOfficersCount > 0 ? ` [${pendingOfficersCount} Onay]` : ""}` },
            { key: "DENETIM", label: "📂 Rapor / Sabıka / Mesai" },
            { key: "DEPARTMAN", label: `🛡️ Birim Başvuru (${applications.length})` },
            { key: "SIVIL", label: `📝 Sivil Başvuru (${civilApplications.length})` },
            { key: "SISTEM", label: "⚙️ Sistem & Medya" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "2px",
                background: activeTab === tab.key ? "var(--mdt-accent-alpha)" : "transparent",
                color: activeTab === tab.key ? "var(--LAC-orange)" : "#94A3B8",
                border: activeTab === tab.key ? "1px solid var(--mdt-accent-alpha)" : "1px solid transparent",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════
            TAB 1: SAZAN & GÜVENLİK LOGLARI (/admin TUZAĞI + GİRİŞLER)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "LOGLAR" && (
          <motion.div key="loglar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setLogFilter("HONEYPOT")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "2px",
                    background: logFilter === "HONEYPOT" ? "rgba(236, 72, 153, 0.2)" : "var(--bg-secondary)",
                    border: `1px solid ${logFilter === "HONEYPOT" ? "rgba(236, 72, 153, 0.45)" : "var(--border-light)"}`,
                    color: logFilter === "HONEYPOT" ? "#F472B6" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  💖 /admin Hayran Kulübü Sazanları ({honeypotLogs.length})
                </button>
                <button
                  onClick={() => setLogFilter("LOGIN")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "2px",
                    background: logFilter === "LOGIN" ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)",
                    border: `1px solid ${logFilter === "LOGIN" ? "var(--mdt-accent-alpha)" : "var(--border-light)"}`,
                    color: logFilter === "LOGIN" ? "var(--LAC-orange)" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🔐 MDT Giriş Denemeleri ({loginLogs.length})
                </button>
                <button
                  onClick={() => setLogFilter("ALL")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "2px",
                    background: logFilter === "ALL" ? "var(--border-strong)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: logFilter === "ALL" ? "#FFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Tümü ({allLogs.length})
                </button>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "2px",
                    background: "rgba(236, 72, 153, 0.12)",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                    color: "#F472B6",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  👁️ /admin Tuzak Sayfasını Gör
                </a>
                <button
                  onClick={() => handleClearLogs("honeypot")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "2px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#F87171",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Sazan Loglarını Temizle
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              {displayedLogs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3.5rem", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "18px", border: "1px dashed var(--border-light)" }}>
                  Henüz bu kategoride kayıtlı log bulunmuyor.
                </div>
              ) : (
                displayedLogs.map((log: any) => {
                  const isHoneypot = log.badge?.startsWith("HONEYPOT:");
                  const cleanDetail = isHoneypot ? log.badge.replace("HONEYPOT:", "") : `Rozet #${log.badge}`;
                  return (
                    <div
                      key={log.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                        padding: "1rem 1.4rem",
                        borderRadius: "2px",
                        background: isHoneypot ? "rgba(236, 72, 153, 0.06)" : "var(--bg-secondary)",
                        border: `1px solid ${
                          isHoneypot
                            ? "rgba(236, 72, 153, 0.25)"
                            : log.success
                            ? "rgba(52, 211, 153, 0.2)"
                            : "rgba(239, 68, 68, 0.25)"
                        }`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "260px" }}>
                        <div
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "2px",
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            background: isHoneypot
                              ? "rgba(236, 72, 153, 0.2)"
                              : log.success
                              ? "rgba(52, 211, 153, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                            color: isHoneypot ? "#F472B6" : log.success ? "#34D399" : "#F87171",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isHoneypot ? "💖 SAZAN (/admin)" : log.success ? "✓ BAŞARILI GİRİŞ" : "✕ BAŞARISIZ ŞİFRE"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.88rem", wordBreak: "break-all" }}>
                            {cleanDetail}
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                            IP Adresi:{" "}
                            <code style={{ color: "var(--LAC-orange)", fontWeight: 800 }}>{log.ipAddress}</code>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: PERSONEL & YETKİ YÖNETİMİ
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "PERSONEL" && (
          <motion.div key="personel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "0.75rem", flex: 1, flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  placeholder="Rozet, isim, rütbe veya birim ara..."
                  style={{
                    flex: "1 1 260px",
                    padding: "0.7rem 1rem",
                    borderRadius: "2px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => setOfficerFilter("ALL")}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "2px",
                    background: officerFilter === "ALL" ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: officerFilter === "ALL" ? "var(--LAC-orange)" : "#94A3B8",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Tümü ({officers.length})
                </button>
                <button
                  onClick={() => setOfficerFilter("PENDING")}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "2px",
                    background: officerFilter === "PENDING" ? "rgba(245, 158, 11, 0.2)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: officerFilter === "PENDING" ? "#FBBF24" : "#94A3B8",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Onay Bekleyenler ({pendingOfficersCount})
                </button>
                <button
                  onClick={() => setOfficerFilter("ADMIN")}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "2px",
                    background: officerFilter === "ADMIN" ? "rgba(16, 185, 129, 0.2)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: officerFilter === "ADMIN" ? "#34D399" : "#94A3B8",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Adminler
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: "0.7rem 1.25rem",
                  borderRadius: "2px",
                  background: "var(--LAC-orange)",
                  color: "var(--bg-secondary)",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                + YENİ PERSONEL EKLE
              </button>
            </div>

            {/* Officer List */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {filteredOfficers.map((off) => (
                <div
                  key={off.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    padding: "1rem 1.4rem",
                    borderRadius: "2px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "2px",
                        background: "#1E3A8A",
                        border: "1px solid #3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        color: "#BFDBFE",
                        overflow: "hidden",
                      }}
                    >
                      {off.profileImage ? (
                        <img src={off.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        off.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--LAC-orange)", fontWeight: 800, fontSize: "0.9rem" }}>#{off.badge}</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "0.95rem" }}>{off.name}</span>
                        {off.role === "admin" && (
                          <span style={{ background: "rgba(236, 72, 153, 0.18)", color: "#F472B6", border: "1px solid rgba(236, 72, 153, 0.35)", padding: "0.1rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>
                            ADMIN
                          </span>
                        )}
                        <span
                          style={{
                            background:
                              off.status === "APPROVED"
                                ? "rgba(52, 211, 153, 0.15)"
                                : off.status === "PENDING"
                                ? "rgba(245, 158, 11, 0.2)"
                                : "rgba(239, 68, 68, 0.2)",
                            color:
                              off.status === "APPROVED"
                                ? "#34D399"
                                : off.status === "PENDING"
                                ? "#FBBF24"
                                : "#F87171",
                            padding: "0.1rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.65rem",
                            fontWeight: 800,
                          }}
                        >
                          {off.status}
                        </span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                        {off.rank} • {off.department}
                        {off.specialRoles ? ` • [${off.specialRoles}]` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {off.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleQuickOfficerStatus(off.id, "APPROVED")}
                          style={{ padding: "0.45rem 0.85rem", borderRadius: "2px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.35)", color: "#34D399", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          ✓ ONAYLA
                        </button>
                        <button
                          onClick={() => handleQuickOfficerStatus(off.id, "REJECTED")}
                          style={{ padding: "0.45rem 0.85rem", borderRadius: "2px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#F87171", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          ✕ REDDET
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setEditingOfficer({ ...off });
                        setNewPassword("");
                      }}
                      style={{
                        padding: "0.45rem 0.85rem",
                        borderRadius: "2px",
                        background: "var(--mdt-accent-alpha)",
                        border: "1px solid var(--mdt-accent-alpha)",
                        color: "var(--LAC-orange)",
                        fontWeight: 700,
                        fontSize: "0.76rem",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square" style={{ marginRight: "0.35rem" }} />
                      Düzenle / Şifre
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(off.id, off.name)}
                      style={{
                        padding: "0.45rem 0.75rem",
                        borderRadius: "2px",
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#F87171",
                        fontWeight: 700,
                        fontSize: "0.76rem",
                        cursor: "pointer",
                      }}
                      title="İhraç Et / Sil"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Officer Modal */}
            {editingOfficer && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <form
                  onSubmit={handleSaveOfficer}
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--mdt-accent-alpha)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 800 }}>
                    Personel Düzenle: #{editingOfficer.badge} {editingOfficer.name}
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>ROZET NO</label>
                      <input type="text" value={editingOfficer.badge} onChange={(e) => setEditingOfficer({ ...editingOfficer, badge: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>AD SOYAD</label>
                      <input type="text" value={editingOfficer.name} onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>RÜTBE</label>
                      <input type="text" value={editingOfficer.rank} onChange={(e) => setEditingOfficer({ ...editingOfficer, rank: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>BİRİM / DEPARTMAN</label>
                      <input type="text" value={editingOfficer.department} onChange={(e) => setEditingOfficer({ ...editingOfficer, department: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>SİSTEM YETKİSİ</label>
                      <select value={editingOfficer.role} onChange={(e) => setEditingOfficer({ ...editingOfficer, role: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "#080E1A", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
                        <option value="user">Standart Memur (user)</option>
                        <option value="admin">Yüksek Komuta (admin)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>HESAP DURUMU</label>
                      <select value={editingOfficer.status} onChange={(e) => setEditingOfficer({ ...editingOfficer, status: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "#080E1A", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
                        <option value="APPROVED">APPROVED (Onaylı)</option>
                        <option value="PENDING">PENDING (Bekliyor)</option>
                        <option value="REJECTED">REJECTED (Reddedildi)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>ÖZEL ROLLER (Virgülle ayırın: FTO, SWAT, Internal Affairs)</label>
                    <input type="text" value={editingOfficer.specialRoles || ""} onChange={(e) => setEditingOfficer({ ...editingOfficer, specialRoles: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#FBBF24" }}>YENİ ŞİFRE BELİRLE (Değiştirmek istemiyorsan boş bırak)</label>
                    <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Yeni şifre..." style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(251, 191, 36, 0.3)", color: "var(--text-primary)" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button type="button" onClick={() => setEditingOfficer(null)} style={{ padding: "0.65rem 1.25rem", borderRadius: "2px", background: "var(--border-light)", border: "none", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}>
                      İptal
                    </button>
                    <button type="submit" style={{ padding: "0.65rem 1.5rem", borderRadius: "2px", background: "var(--LAC-orange)", border: "none", color: "var(--bg-secondary)", fontWeight: 800, cursor: "pointer" }}>
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Officer Modal */}
            {showAddModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <form
                  onSubmit={handleCreateOfficer}
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--mdt-accent-alpha)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 800 }}>Yeni Personel Ekle</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>ROZET NO *</label>
                      <input required type="text" value={newOfficer.badge} onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>AD SOYAD *</label>
                      <input required type="text" value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>ŞİFRE *</label>
                      <input required type="text" value={newOfficer.password} onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>RÜTBE</label>
                      <input type="text" value={newOfficer.rank} onChange={(e) => setNewOfficer({ ...newOfficer, rank: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>DEPARTMAN</label>
                      <input type="text" value={newOfficer.department} onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>YETKİ</label>
                      <select value={newOfficer.role} onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })} style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem", borderRadius: "2px", background: "#080E1A", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}>
                        <option value="user">Standart Memur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "0.65rem 1.25rem", borderRadius: "2px", background: "var(--border-light)", border: "none", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}>
                      İptal
                    </button>
                    <button type="submit" style={{ padding: "0.65rem 1.5rem", borderRadius: "2px", background: "var(--LAC-orange)", border: "none", color: "var(--bg-secondary)", fontWeight: 800, cursor: "pointer" }}>
                      Oluştur
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 3: OPERASYONEL DENETİM (RAPORLAR, SABIKA, MESAİLER)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "DENETIM" && (
          <motion.div key="denetim" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setAuditSubTab("RAPORLAR")}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: "2px",
                    background: auditSubTab === "RAPORLAR" ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: auditSubTab === "RAPORLAR" ? "var(--LAC-orange)" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  📄 Raporlar ({reports.length})
                </button>
                <button
                  onClick={() => setAuditSubTab("SABIKA")}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: "2px",
                    background: auditSubTab === "SABIKA" ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: auditSubTab === "SABIKA" ? "var(--LAC-orange)" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🕵️ Sabıka Kayıtları ({criminals.length})
                </button>
                <button
                  onClick={() => setAuditSubTab("MESAI")}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: "2px",
                    background: auditSubTab === "MESAI" ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    color: auditSubTab === "MESAI" ? "var(--LAC-orange)" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  ⏱️ Mesai Cetveli & Sıfırlama
                </button>
              </div>

              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Kayıtlarda ara..."
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "2px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "0.82rem",
                  outline: "none",
                  minWidth: "240px",
                }}
              />
            </div>

            {auditSubTab === "RAPORLAR" && (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {reports
                  .filter(
                    (r) =>
                      r.title?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      r.officer?.name?.toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        padding: "1.25rem 1.5rem",
                        borderRadius: "2px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem" }}>{rep.title}</div>
                        <div style={{ color: "var(--LAC-orange)", fontSize: "0.76rem", fontWeight: 700, marginTop: "0.2rem" }}>
                          Memur: #{rep.officer?.badge} {rep.officer?.name} • {new Date(rep.createdAt).toLocaleString("tr-TR")}
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", marginTop: "0.6rem", whiteSpace: "pre-wrap" }}>
                          {rep.content?.slice(0, 350)}
                          {rep.content?.length > 350 ? "..." : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        style={{
                          padding: "0.45rem 0.85rem",
                          borderRadius: "2px",
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#F87171",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-trash" /> Sil
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {auditSubTab === "SABIKA" && (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {criminals
                  .filter(
                    (c) =>
                      c.name?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      c.crimes?.toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map((crim) => (
                    <div
                      key={crim.id}
                      style={{
                        padding: "1.25rem 1.5rem",
                        borderRadius: "2px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem" }}>{crim.name}</div>
                        <div style={{ color: "#F87171", fontSize: "0.82rem", fontWeight: 700, marginTop: "0.25rem" }}>
                          Suçlar: {crim.crimes}
                        </div>
                        {crim.notes && (
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>Not: {crim.notes}</div>
                        )}
                        <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.4rem" }}>
                          Kaydeden: #{crim.officer?.badge} {crim.officer?.name} • {new Date(crim.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCriminal(crim.id)}
                        style={{
                          padding: "0.45rem 0.85rem",
                          borderRadius: "2px",
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#F87171",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        <i className="fa-solid fa-trash" /> Sil
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {auditSubTab === "MESAI" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-secondary) 100%)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "2px", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#F87171", margin: "0 0 0.3rem 0" }}>
                      Mesai Sıfırlama Protokolü
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      Tüm personelin birikmiş mesai sürelerini sıfırlar.
                    </p>
                  </div>
                  <button onClick={handleResetShifts} style={{ background: "#EF4444", color: "var(--text-primary)", border: "none", padding: "0.75rem 1.4rem", borderRadius: "2px", fontWeight: 800, cursor: "pointer" }}>
                    TÜM MESAİLERİ SIFIRLA
                  </button>
                </div>

                <div style={{ display: "grid", gap: "0.65rem" }}>
                  {shifts
                    .filter((s) => s.name?.toLowerCase().includes(auditSearch.toLowerCase()) || s.badge?.includes(auditSearch))
                    .map((s, idx) => (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.9rem 1.25rem",
                          borderRadius: "2px",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <span style={{ color: "var(--text-muted)", fontWeight: 800, width: "24px" }}>#{idx + 1}</span>
                          <span style={{ color: "var(--LAC-orange)", fontWeight: 800 }}>#{s.badge}</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{s.name}</span>
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>({s.rank})</span>
                          {s.isOnDuty && (
                            <span style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34D399", padding: "0.15rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>
                              MESAİDE
                            </span>
                          )}
                        </div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "0.9rem" }}>
                          {formatSeconds(s.totalSeconds)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 4: BİRİM BAŞVURULARI
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "DEPARTMAN" && (
          <motion.div key="departman" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {applications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "20px", border: "1px dashed var(--border-light)" }}>
                  Henüz birim başvurusu bulunmuyor.
                </div>
              ) : (
                applications.map((app: any) => {
                  const divInfo = DIVISIONS.find((d) => d.id === app.division) || DIVISIONS[0];
                  return (
                    <div key={app.id} style={{ background: "var(--bg-secondary)", borderRadius: "2px", border: "1px solid var(--border-light)", padding: "1.5rem", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: divInfo.color }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <div style={{ width: "42px", height: "42px", borderRadius: "2px", background: `${divInfo.color}15`, border: `1px solid ${divInfo.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: divInfo.color, fontSize: "1.1rem" }}>
                            <i className={`fa-solid ${divInfo.icon}`} />
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                              #{app.officer?.badge} - {app.officer?.name}
                            </h4>
                            <span style={{ fontSize: "0.75rem", color: divInfo.color, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                              {divInfo.name}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <span style={{ padding: "0.3rem 0.8rem", borderRadius: "2px", fontSize: "0.7rem", fontWeight: 800, background: app.status === "Onaylandı" ? "rgba(52, 211, 153, 0.15)" : app.status === "Reddedildi" ? "rgba(248, 113, 113, 0.15)" : "rgba(245, 158, 11, 0.15)", color: app.status === "Onaylandı" ? "#34D399" : app.status === "Reddedildi" ? "#F87171" : "#F59E0B" }}>
                            {app.status}
                          </span>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button onClick={() => handleUpdateUnitStatus(app.id, "Onaylandı")} style={{ width: "32px", height: "32px", borderRadius: "2px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.3)", color: "#34D399", cursor: "pointer" }}>
                              <i className="fa-solid fa-check" />
                            </button>
                            <button onClick={() => handleUpdateUnitStatus(app.id, "Reddedildi")} style={{ width: "32px", height: "32px", borderRadius: "2px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#F87171", cursor: "pointer" }}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                            <button onClick={() => handleDeleteUnitApp(app.id)} style={{ width: "32px", height: "32px", borderRadius: "2px", background: "var(--border-light)", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", cursor: "pointer" }}>
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "rgba(0,0,0,0.2)", padding: "1.25rem", borderRadius: "2px", borderLeft: `2px solid ${divInfo.color}40`, marginLeft: "0.5rem" }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: divInfo.color, fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>Neden Katılmak İstiyor?</div>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.reason}</p>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: divInfo.color, fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>Tecrübesi</div>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.experience}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 5: SİVİL BAŞVURULAR
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "SIVIL" && (
          <motion.div key="sivil" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {civilApplications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "20px", border: "1px dashed var(--border-light)" }}>
                  Henüz sivil başvuru bulunmuyor.
                </div>
              ) : (
                civilApplications.map((app: any) => {
                  const typeInfo = CIVIL_TYPE_LABELS[app.type] || { label: app.type, icon: "fa-file", color: "var(--text-secondary)" };
                  const content = parseContent(app.content);
                  const isExpanded = expandedCivilId === app.id;
                  const statusColor = STATUS_COLORS[app.status] || "#94A3B8";

                  return (
                    <div key={app.id}>
                      <div onClick={() => setExpandedCivilId(isExpanded ? null : app.id)} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem 1.5rem", background: isExpanded ? "var(--mdt-accent-alpha)" : "var(--bg-secondary)", border: `1px solid ${isExpanded ? "var(--mdt-accent-alpha)" : "var(--border-light)"}`, borderRadius: isExpanded ? "16px 16px 0 0" : "16px", cursor: "pointer" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "2px", background: `${typeInfo.color}15`, border: `1px solid ${typeInfo.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color, fontSize: "1rem", flexShrink: 0 }}>
                          <i className={`fa-solid ${typeInfo.icon}`} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.2rem" }}>
                            <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem" }}>{app.fullName}</span>
                            <span style={{ fontSize: "0.65rem", color: typeInfo.color, background: `${typeInfo.color}15`, padding: "0.2rem 0.6rem", borderRadius: "50px", fontWeight: 800 }}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            <i className="fa-regular fa-calendar" style={{ marginRight: "0.4rem" }} />
                            {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, padding: "0.3rem 0.8rem", borderRadius: "50px" }}>
                          {app.status}
                        </span>
                        <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }} />
                      </div>

                      {isExpanded && (
                        <div style={{ padding: "2rem", background: "rgba(8, 14, 28, 0.6)", border: "1px solid var(--mdt-accent-alpha)", borderTop: "none", borderRadius: "0 0 16px 16px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                            {app.fullName && (
                              <div>
                                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.3rem" }}>AD SOYAD</div>
                                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{app.fullName}</div>
                              </div>
                            )}
                            {app.discordName && (
                              <div>
                                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.3rem" }}>DISCORD</div>
                                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{app.discordName}</div>
                              </div>
                            )}
                            {app.age && (
                              <div>
                                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.3rem" }}>YAŞ</div>
                                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{app.age}</div>
                              </div>
                            )}
                            {app.email && (
                              <div>
                                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.3rem" }}>E-POSTA</div>
                                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{app.email}</div>
                              </div>
                            )}
                            {Object.entries(content).map(
                              ([key, val]) =>
                                val &&
                                typeof val === "string" &&
                                val.length < 200 && (
                                  <div key={key}>
                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.3rem", textTransform: "uppercase" }}>{key}</div>
                                    <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>{val}</div>
                                  </div>
                                )
                            )}
                          </div>
                          {Object.entries(content).map(
                            ([key, val]) =>
                              val &&
                              typeof val === "string" &&
                              val.length >= 200 && (
                                <div key={key} style={{ marginBottom: "1.5rem" }}>
                                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>{key}</div>
                                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "2px", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px solid var(--border-light)" }}>{val}</div>
                                </div>
                              )
                          )}
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--border-light)" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800 }}>DURUM:</span>
                            <select value={app.status} onChange={(e) => updateCivilStatus(app.id, e.target.value)} style={{ padding: "0.4rem 0.8rem", borderRadius: "2px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-strong)", color: statusColor, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", outline: "none" }}>
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => deleteCivilApp(app.id)} style={{ marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: "2px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#F87171", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                              <i className="fa-solid fa-trash" style={{ marginRight: "0.4rem" }} /> SİL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 6: SİSTEM & MEDYA
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "SISTEM" && (
          <motion.div key="sistem" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
              {/* DB Sync */}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--mdt-accent-alpha)", borderRadius: "18px", padding: "1.75rem 2.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--LAC-orange)", margin: "0 0 0.35rem 0" }}>
                    Yüksek Komuta Hesap Güvencesi & Senkronizasyon
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                    Kurucu Yüksek Komuta (#1222, #101, #261) yetkilerini doğrular ve veritabanı bağlantısını senkronize eder.
                  </p>
                </div>
                <button onClick={handleDbSync} style={{ background: "var(--mdt-accent-alpha)", color: "var(--LAC-orange)", border: "1px solid var(--mdt-accent-alpha)", padding: "0.75rem 1.4rem", borderRadius: "2px", fontWeight: 800, cursor: "pointer" }}>
                  SENKRONİZE ET
                </button>
              </div>

              {/* Media Upload */}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "20px", padding: "2.25rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ color: "var(--LAC-orange)" }} /> Medya Yükle
                </h3>
                {error && <div style={{ color: "#FCA5A5", background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "2px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.25rem", fontSize: "0.85rem", fontWeight: 600 }}>{error}</div>}
                <form onSubmit={handleAddImage} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 300px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>GÖRSEL URL</label>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/gallery/1.png veya https://..." required style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-light)", borderRadius: "2px", color: "var(--text-primary)", outline: "none", fontSize: "0.9rem" }} />
                  </div>
                  <div style={{ width: "220px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>KATEGORİ</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-light)", borderRadius: "2px", color: "var(--text-primary)", outline: "none", fontSize: "0.9rem" }}>
                      <option value="GALERI" style={{ background: "var(--bg-secondary)" }}>Galeri Sayfası</option>
                      <option value="GIRIS" style={{ background: "var(--bg-secondary)" }}>Giriş Arkaplanı</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ background: "var(--LAC-orange)", color: "var(--bg-secondary)", border: "none", padding: "0.8rem 2rem", borderRadius: "2px", fontWeight: 800, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                    {isSubmitting ? "YÜKLENİYOR..." : "SİSTEME YÜKLE"}
                  </button>
                </form>
              </div>

              {/* Media Gallery */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 1.25rem 0" }}>Sistem Medya Arşivi ({images.length})</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
                  {images.map((img) => (
                    <div key={img.id} style={{ background: "var(--bg-secondary)", borderRadius: "2px", border: "1px solid var(--border-light)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: "140px", background: "#000", position: "relative" }}>
                        <img src={img.url} alt="medya" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "rgba(0,0,0,0.7)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800, color: "var(--text-primary)" }}>{img.type}</span>
                      </div>
                      <div style={{ padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}>
                          {img.url.split("/").pop()}
                        </div>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "2px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
