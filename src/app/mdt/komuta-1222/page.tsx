"use client";

import { useState } from "react";
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
  memur: { label: "Memur Başvurusu", icon: "fa-shield-halved", color: "#041632" },
  "ride-along": { label: "Ride Along", icon: "fa-car-side", color: "#0284c7" },
  sikayet: { label: "Sivil Şikayet", icon: "fa-triangle-exclamation", color: "#d97706" },
};

const STATUS_OPTIONS = ["Bekliyor", "Inceleniyor", "Onaylandi", "Reddedildi"];

const DIVISIONS = [
  { id: "detective", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "#0284c7" },
  { id: "gnd", name: "Gangs & Narcotics (GND)", icon: "fa-shield-virus", color: "#dc2626" },
  { id: "git", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "#4f46e5" },
  { id: "k9", name: "K-9 Unit", icon: "fa-paw", color: "#d97706" },
  { id: "dive", name: "Dive Unit", icon: "fa-water", color: "#0891b2" },
  { id: "swat", name: "SWAT Unit", icon: "fa-crosshairs", color: "#041632" },
  { id: "patrol", name: "Traffic Unit", icon: "fa-car", color: "#16a34a" },
  { id: "air", name: "Air Support Unit", icon: "fa-helicopter", color: "#0369a1" },
];

type TabKey = "PERSONEL" | "DENETIM" | "DEPARTMAN" | "SIVIL" | "LOGLAR" | "SISTEM";

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  borderRadius: 6,
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-strong)",
  color: "var(--text-primary)",
  fontSize: "0.86rem",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function HighCommandSecretAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("PERSONEL");

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
    department: "Patrol Division",
    role: "user",
    specialRoles: "",
  });

  const [auditSubTab, setAuditSubTab] = useState<"RAPORLAR" | "SABIKA" | "MESAI">("RAPORLAR");
  const [auditSearch, setAuditSearch] = useState("");
  const [logFilter, setLogFilter] = useState<"HONEYPOT" | "LOGIN" | "ALL">("HONEYPOT");

  const [url, setUrl] = useState("");
  const [type, setType] = useState("GALERI");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedCivilId, setExpandedCivilId] = useState<number | null>(null);

  if (!meData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
        Yüksek Komuta verileri yükleniyor...
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--color-danger-border)",
          borderTop: "4px solid var(--color-danger)",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <i className="fa-solid fa-lock" style={{ fontSize: "2.25rem", color: "var(--color-danger)", marginBottom: "0.75rem" }} />
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Yetkisiz Erişim
        </h2>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Bu yönetim paneline erişmek için Yüksek Komuta (Admin) yetkisine sahip olmanız gerekmektedir.
        </p>
      </div>
    );
  }

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
        toast.success("Yeni personel kaydı oluşturuldu.");
        setShowAddModal(false);
        setNewOfficer({ badge: "", name: "", password: "", rank: "Police Officer I", department: "Patrol Division", role: "user", specialRoles: "" });
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
      if (newPassword.trim()) payload.password = newPassword.trim();
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
        toast.success("Personel sistemden silindi.");
        mutateOfficers();
      } else {
        toast.error("Silinemedi.");
      }
    } catch {
      toast.error("Hata oluştu.");
    }
  };

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
    if (!confirm("TÜM PERSONEL MESAİ SÜRELERİNİ SIFIRLAMAK ÜZERESİNİZ. Onaylıyor musunuz?")) return;
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

  const handleClearLogs = async (mode: "honeypot" | "all") => {
    const msg =
      mode === "honeypot"
        ? "Yetkisiz (/admin) erişim kayıtlarını temizlemek istiyor musunuz?"
        : "Tüm güvenlik ve giriş loglarını temizlemek istiyor musunuz?";
    if (!confirm(msg)) return;
    const res = await fetch(`/api/honeypot?mode=${mode}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Log kayıtları temizlendi.");
      mutateLogs();
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url.startsWith("/media") && !url.startsWith("/gallery") && !url.startsWith("http")) {
      setError("URL geçerli bir bağlantı veya /gallery/... biçiminde olmalıdır.");
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
        toast.success("Medya eklendi.");
        mutateImages();
      } else {
        const data = await res.json();
        setError(data.error || "Medya eklenemedi.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Görsel silindi.");
      mutateImages();
    }
  };

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
    if (!confirm("Bu birim başvurusunu silmek istediğinize emin misiniz?")) return;
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
  const displayedLogs = logFilter === "HONEYPOT" ? honeypotLogs : logFilter === "LOGIN" ? loginLogs : allLogs;

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

  const TABS: { key: TabKey; label: string; icon: string; badge?: number }[] = [
    { key: "PERSONEL", label: `Personel Yönetimi (${officers.length})`, icon: "fa-users-gear", badge: pendingOfficersCount },
    { key: "DENETIM", label: "Operasyonel Denetim", icon: "fa-clipboard-check" },
    { key: "DEPARTMAN", label: `Birim Başvuruları (${applications.length})`, icon: "fa-building-shield" },
    { key: "SIVIL", label: `Sivil Başvurular (${civilApplications.length})`, icon: "fa-file-signature" },
    { key: "LOGLAR", label: `Güvenlik Logları (${allLogs.length})`, icon: "fa-shield-halved" },
    { key: "SISTEM", label: "Sistem ve Medya", icon: "fa-server" },
  ];

  return (
    <div style={{ maxWidth: 1380, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "3rem" }}>
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
            LAPD HIGH COMMAND // YÜKSEK KOMUTA YÖNETİM PANELİ
          </div>
          <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Yüksek Komuta Kontrol Merkezi
          </h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
            Personel yetkilerini, sicil başvurularını, operasyon kayıtlarını ve sistem güvenliğini yönetin.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            Onay Bekleyen Personel:{" "}
            <strong style={{ color: pendingOfficersCount > 0 ? "var(--LAC-orange)" : "var(--text-primary)" }}>
              {pendingOfficersCount}
            </strong>
          </div>
          <div
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            Yetkisiz (/admin) Kaydı: <strong style={{ color: "var(--text-primary)" }}>{honeypotLogs.length}</strong>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS (NO EMOJIS) ── */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          padding: "0.45rem",
          display: "flex",
          gap: "0.35rem",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: 6,
                border: "none",
                backgroundColor: isActive ? "#041632" : "transparent",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i className={`fa-solid ${t.icon}`} style={{ color: isActive ? "#ffffff" : "var(--LAC-orange)", fontSize: "0.82rem" }} />
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span
                  style={{
                    backgroundColor: "var(--LAC-orange)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.05rem 0.45rem",
                    borderRadius: 999,
                  }}
                >
                  {t.badge} Onay
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1: PERSONEL YÖNETİMİ
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "PERSONEL" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
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
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
              {[
                { id: "ALL", label: `Tüm Personel (${officers.length})` },
                { id: "PENDING", label: `Onay Bekleyenler (${pendingOfficersCount})` },
                { id: "ADMIN", label: "Yüksek Komuta (Admin)" },
              ].map((f) => {
                const isActive = officerFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setOfficerFilter(f.id as any)}
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
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                placeholder="Rozet, isim, rütbe veya birim ara..."
                style={{ ...inputBase, width: 250, padding: "0.48rem 0.85rem" }}
              />
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: "0.52rem 1rem",
                  borderRadius: 6,
                  backgroundColor: "var(--LAC-orange)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <i className="fa-solid fa-user-plus" />
                Yeni Personel Ekle
              </button>
            </div>
          </div>

          {/* Personnel Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    Rozet & İsim
                  </th>
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    Rütbe & Birim
                  </th>
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    Yetki
                  </th>
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    Hesap Durumu
                  </th>
                  <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((off) => (
                  <tr key={off.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "#041632",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {off.profileImage ? (
                            <img src={off.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            off.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            {off.name}{" "}
                            <span style={{ color: "var(--LAC-orange)", fontWeight: 700, fontSize: "0.82rem" }}>
                              #{off.badge}
                            </span>
                          </div>
                          {off.specialRoles && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                              Özel Görev: {off.specialRoles}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)" }}>{off.rank}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{off.department}</div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.55rem",
                          borderRadius: 4,
                          backgroundColor: off.role === "admin" ? "rgba(4,22,50,0.1)" : "var(--bg-tertiary)",
                          color: off.role === "admin" ? "#041632" : "var(--text-secondary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {off.role === "admin" ? "Yüksek Komuta" : "Standart Memur"}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.22rem 0.6rem",
                          borderRadius: 4,
                          backgroundColor:
                            off.status === "APPROVED"
                              ? "var(--color-success-bg)"
                              : off.status === "PENDING"
                              ? "var(--color-warning-bg)"
                              : "var(--color-danger-bg)",
                          color:
                            off.status === "APPROVED"
                              ? "var(--color-success)"
                              : off.status === "PENDING"
                              ? "var(--color-warning)"
                              : "var(--color-danger)",
                          border: `1px solid ${
                            off.status === "APPROVED"
                              ? "var(--color-success-border)"
                              : off.status === "PENDING"
                              ? "var(--color-warning-border)"
                              : "var(--color-danger-border)"
                          }`,
                        }}
                      >
                        {off.status === "APPROVED" ? "Onaylı" : off.status === "PENDING" ? "Onay Bekliyor" : "Reddedildi"}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {off.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleQuickOfficerStatus(off.id, "APPROVED")}
                              style={{
                                padding: "0.38rem 0.75rem",
                                borderRadius: 6,
                                backgroundColor: "#16a34a",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleQuickOfficerStatus(off.id, "REJECTED")}
                              style={{
                                padding: "0.38rem 0.75rem",
                                borderRadius: 6,
                                backgroundColor: "var(--color-danger-bg)",
                                border: "1px solid var(--color-danger-border)",
                                color: "var(--color-danger)",
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingOfficer({ ...off });
                            setNewPassword("");
                          }}
                          style={{
                            padding: "0.38rem 0.75rem",
                            borderRadius: 6,
                            backgroundColor: "var(--bg-tertiary)",
                            border: "1px solid var(--border-strong)",
                            color: "var(--text-primary)",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square" style={{ marginRight: 5 }} />
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteOfficer(off.id, off.name)}
                          style={{
                            padding: "0.38rem 0.65rem",
                            borderRadius: 6,
                            backgroundColor: "var(--color-danger-bg)",
                            border: "1px solid var(--color-danger-border)",
                            color: "var(--color-danger)",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          title="Personeli Sil"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Officer Modal */}
          {editingOfficer && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              <form
                onSubmit={handleSaveOfficer}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  padding: "1.75rem",
                  width: "100%",
                  maxWidth: 540,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Personel Düzenle: #{editingOfficer.badge} {editingOfficer.name}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Rozet Numarası
                    </label>
                    <input
                      type="text"
                      value={editingOfficer.badge}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, badge: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={editingOfficer.name}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Rütbe
                    </label>
                    <input
                      type="text"
                      value={editingOfficer.rank}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, rank: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Birim / Departman
                    </label>
                    <input
                      type="text"
                      value={editingOfficer.department}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, department: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Sistem Yetkisi
                    </label>
                    <select
                      value={editingOfficer.role}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, role: e.target.value })}
                      style={inputBase}
                    >
                      <option value="user">Standart Memur (user)</option>
                      <option value="admin">Yüksek Komuta (admin)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Hesap Durumu
                    </label>
                    <select
                      value={editingOfficer.status}
                      onChange={(e) => setEditingOfficer({ ...editingOfficer, status: e.target.value })}
                      style={inputBase}
                    >
                      <option value="APPROVED">APPROVED (Onaylı)</option>
                      <option value="PENDING">PENDING (Bekliyor)</option>
                      <option value="REJECTED">REJECTED (Reddedildi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Özel Görev / Birim Rolleri (Virgülle ayırın: FTO, SWAT, Internal Affairs)
                  </label>
                  <input
                    type="text"
                    value={editingOfficer.specialRoles || ""}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, specialRoles: e.target.value })}
                    style={inputBase}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Yeni Şifre Belirle (Değiştirmek istemiyorsanız boş bırakın)
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifre..."
                    style={inputBase}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingOfficer(null)}
                    style={{
                      padding: "0.55rem 1.1rem",
                      borderRadius: 6,
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.55rem 1.35rem",
                      borderRadius: 6,
                      backgroundColor: "#041632",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Officer Modal */}
          {showAddModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              <form
                onSubmit={handleCreateOfficer}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  padding: "1.75rem",
                  width: "100%",
                  maxWidth: 520,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Yeni Personel Kaydı Oluştur
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Rozet Numarası *
                    </label>
                    <input
                      required
                      type="text"
                      value={newOfficer.badge}
                      onChange={(e) => setNewOfficer({ ...newOfficer, badge: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Ad Soyad *
                    </label>
                    <input
                      required
                      type="text"
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Geçici Şifre *
                    </label>
                    <input
                      required
                      type="text"
                      value={newOfficer.password}
                      onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Rütbe
                    </label>
                    <input
                      type="text"
                      value={newOfficer.rank}
                      onChange={(e) => setNewOfficer({ ...newOfficer, rank: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Birim / Departman
                    </label>
                    <input
                      type="text"
                      value={newOfficer.department}
                      onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Sistem Yetkisi
                    </label>
                    <select
                      value={newOfficer.role}
                      onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                      style={inputBase}
                    >
                      <option value="user">Standart Memur</option>
                      <option value="admin">Yüksek Komuta (Admin)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: "0.55rem 1.1rem",
                      borderRadius: 6,
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.55rem 1.35rem",
                      borderRadius: 6,
                      backgroundColor: "var(--LAC-orange)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Personel Ekle
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: OPERASYONEL DENETİM (RAPORLAR, SABIKA, MESAİLER)
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "DENETIM" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
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
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {[
                { id: "RAPORLAR", label: `Vaka Raporları (${reports.length})`, icon: "fa-file-lines" },
                { id: "SABIKA", label: `Sabıka Kayıtları (${criminals.length})`, icon: "fa-fingerprint" },
                { id: "MESAI", label: "Mesai Cetveli ve Sıfırlama", icon: "fa-clock" },
              ].map((st) => {
                const isActive = auditSubTab === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setAuditSubTab(st.id as any)}
                    style={{
                      padding: "0.48rem 0.9rem",
                      borderRadius: 6,
                      backgroundColor: isActive ? "#041632" : "var(--bg-primary)",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                      border: isActive ? "1px solid #041632" : "1px solid var(--border-light)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                    }}
                  >
                    <i className={`fa-solid ${st.icon}`} />
                    {st.label}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Kayıtlarda ara..."
              style={{ ...inputBase, width: 250, padding: "0.48rem 0.85rem" }}
            />
          </div>

          <div style={{ padding: "1.25rem" }}>
            {auditSubTab === "RAPORLAR" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                        padding: "1rem 1.25rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{rep.title}</div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--LAC-orange)", marginTop: 2 }}>
                          Memur: #{rep.officer?.badge} {rep.officer?.name} • {new Date(rep.createdAt).toLocaleString("tr-TR")}
                        </div>
                        <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {rep.content?.slice(0, 350)}
                          {rep.content?.length > 350 ? "..." : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          backgroundColor: "var(--color-danger-bg)",
                          border: "1px solid var(--color-danger-border)",
                          color: "var(--color-danger)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                        Sil
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {auditSubTab === "SABIKA" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                        padding: "1rem 1.25rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{crim.name}</div>
                        <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--color-danger)", marginTop: 3 }}>
                          Suçlar: {crim.crimes}
                        </div>
                        {crim.notes && (
                          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 }}>Not: {crim.notes}</div>
                        )}
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4 }}>
                          Kaydeden: #{crim.officer?.badge} {crim.officer?.name} • {new Date(crim.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCriminal(crim.id)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          backgroundColor: "var(--color-danger-bg)",
                          border: "1px solid var(--color-danger-border)",
                          color: "var(--color-danger)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                        Sil
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {auditSubTab === "MESAI" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRadius: 8,
                    backgroundColor: "var(--color-danger-bg)",
                    border: "1px solid var(--color-danger-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--color-danger)" }}>
                      Mesai Sürelerini Sıfırlama Protokolü
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                      Haftalık veya aylık periyot sonunda tüm personelin birikmiş mesai kayıtlarını sıfırlar.
                    </p>
                  </div>
                  <button
                    onClick={handleResetShifts}
                    style={{
                      padding: "0.6rem 1.2rem",
                      borderRadius: 6,
                      backgroundColor: "var(--color-danger)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Tüm Mesaileri Sıfırla
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {shifts
                    .filter((s) => s.name?.toLowerCase().includes(auditSearch.toLowerCase()) || s.badge?.includes(auditSearch))
                    .map((s, idx) => (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.8rem 1.15rem",
                          borderRadius: 6,
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", minWidth: 28 }}>
                            #{idx + 1}
                          </span>
                          <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--LAC-orange)" }}>#{s.badge}</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>({s.rank})</span>
                          {s.isOnDuty && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.5rem",
                                borderRadius: 4,
                                backgroundColor: "var(--color-success-bg)",
                                color: "var(--color-success)",
                              }}
                            >
                              Görevde
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {formatSeconds(s.totalSeconds)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 3: BİRİM BAŞVURULARI
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "DEPARTMAN" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "3rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Henüz birim başvurusu bulunmuyor.
            </div>
          ) : (
            applications.map((app: any) => {
              const divInfo = DIVISIONS.find((d) => d.id === app.division) || DIVISIONS[0];
              return (
                <div
                  key={app.id}
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderLeft: `4px solid ${divInfo.color}`,
                    borderRadius: 8,
                    padding: "1.25rem 1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: `${divInfo.color}14`,
                          color: divInfo.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                        }}
                      >
                        <i className={`fa-solid ${divInfo.icon}`} />
                      </div>
                      <div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          #{app.officer?.badge} {app.officer?.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: divInfo.color }}>{divInfo.name}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.65rem",
                          borderRadius: 4,
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {app.status}
                      </span>
                      <button
                        onClick={() => handleUpdateUnitStatus(app.id, "Onaylandı")}
                        style={{
                          padding: "0.4rem 0.75rem",
                          borderRadius: 6,
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleUpdateUnitStatus(app.id, "Reddedildi")}
                        style={{
                          padding: "0.4rem 0.75rem",
                          borderRadius: 6,
                          backgroundColor: "var(--color-danger-bg)",
                          border: "1px solid var(--color-danger-border)",
                          color: "var(--color-danger)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => handleDeleteUnitApp(app.id)}
                        style={{
                          padding: "0.4rem 0.65rem",
                          borderRadius: 6,
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "var(--bg-primary)", padding: "1rem", borderRadius: 6, border: "1px solid var(--border-light)" }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                        Katılma Gerekçesi
                      </div>
                      <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {app.reason}
                      </p>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                        Saha Tecrübesi
                      </div>
                      <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {app.experience}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 4: SİVİL BAŞVURULAR
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "SIVIL" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {civilApplications.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "3rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Henüz sivil başvuru bulunmuyor.
            </div>
          ) : (
            civilApplications.map((app: any) => {
              const typeInfo = CIVIL_TYPE_LABELS[app.type] || { label: app.type, icon: "fa-file", color: "#041632" };
              const content = parseContent(app.content);
              const isExpanded = expandedCivilId === app.id;

              return (
                <div
                  key={app.id}
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => setExpandedCivilId(isExpanded ? null : app.id)}
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: `${typeInfo.color}12`,
                          color: typeInfo.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className={`fa-solid ${typeInfo.icon}`} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{app.fullName}</span>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              padding: "0.15rem 0.5rem",
                              borderRadius: 4,
                              backgroundColor: `${typeInfo.color}12`,
                              color: typeInfo.color,
                            }}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "0.22rem 0.65rem",
                          borderRadius: 4,
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {app.status}
                      </span>
                      <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "1.25rem", borderTop: "1px solid var(--border-light)", backgroundColor: "var(--bg-primary)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                        {app.fullName && (
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Ad Soyad</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{app.fullName}</div>
                          </div>
                        )}
                        {app.discordName && (
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Discord</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{app.discordName}</div>
                          </div>
                        )}
                        {app.age && (
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Yaş</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{app.age}</div>
                          </div>
                        )}
                        {Object.entries(content).map(
                          ([key, val]) =>
                            val &&
                            typeof val === "string" &&
                            val.length < 200 && (
                              <div key={key}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>{key}</div>
                                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{val}</div>
                              </div>
                            )
                        )}
                      </div>

                      {Object.entries(content).map(
                        ([key, val]) =>
                          val &&
                          typeof val === "string" &&
                          val.length >= 200 && (
                            <div key={key} style={{ marginBottom: "1rem" }}>
                              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{key}</div>
                              <div
                                style={{
                                  padding: "0.85rem",
                                  borderRadius: 6,
                                  backgroundColor: "var(--bg-secondary)",
                                  border: "1px solid var(--border-light)",
                                  fontSize: "0.86rem",
                                  color: "var(--text-primary)",
                                  lineHeight: 1.55,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {val}
                              </div>
                            </div>
                          )
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-light)" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Başvuru Durumu:</span>
                        <select
                          value={app.status}
                          onChange={(e) => updateCivilStatus(app.id, e.target.value)}
                          style={{ ...inputBase, width: 180, padding: "0.4rem 0.75rem" }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteCivilApp(app.id)}
                          style={{
                            marginLeft: "auto",
                            padding: "0.42rem 0.85rem",
                            borderRadius: 6,
                            backgroundColor: "var(--color-danger-bg)",
                            border: "1px solid var(--color-danger-border)",
                            color: "var(--color-danger)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                          Başvuruyu Sil
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 5: GÜVENLİK LOGLARI
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "LOGLAR" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
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
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {[
                { id: "HONEYPOT", label: `Yetkisiz (/admin) İhlalleri (${honeypotLogs.length})` },
                { id: "LOGIN", label: `MDT Giriş Kayıtları (${loginLogs.length})` },
                { id: "ALL", label: `Tüm Loglar (${allLogs.length})` },
              ].map((lf) => {
                const isActive = logFilter === lf.id;
                return (
                  <button
                    key={lf.id}
                    onClick={() => setLogFilter(lf.id as any)}
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
                    {lf.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.48rem 0.85rem",
                  borderRadius: 6,
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: 5 }} />
                /admin Sayfasını Görüntüle
              </a>
              <button
                onClick={() => handleClearLogs("honeypot")}
                style={{
                  padding: "0.48rem 0.85rem",
                  borderRadius: 6,
                  backgroundColor: "var(--color-danger-bg)",
                  border: "1px solid var(--color-danger-border)",
                  color: "var(--color-danger)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                İhlal Loglarını Temizle
              </button>
            </div>
          </div>

          {displayedLogs.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              Seçili kategoride kayıtlı güvenlik logu bulunmuyor.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Olay Türü
                    </th>
                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Detay / Kullanıcı
                    </th>
                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      IP Adresi
                    </th>
                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>
                      Zaman Damgası
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLogs.map((log: any) => {
                    const isHoneypot = log.badge?.startsWith("HONEYPOT:");
                    const cleanDetail = isHoneypot ? log.badge.replace("HONEYPOT:", "") : `Rozet #${log.badge}`;
                    return (
                      <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "0.85rem 1.25rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.55rem",
                              borderRadius: 4,
                              backgroundColor: isHoneypot
                                ? "var(--color-warning-bg)"
                                : log.success
                                ? "var(--color-success-bg)"
                                : "var(--color-danger-bg)",
                              color: isHoneypot
                                ? "var(--color-warning)"
                                : log.success
                                ? "var(--color-success)"
                                : "var(--color-danger)",
                            }}
                          >
                            {isHoneypot ? "YETKİSİZ (/admin)" : log.success ? "BAŞARILI GİRİŞ" : "BAŞARISIZ GİRİŞ"}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem", fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {cleanDetail}
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                          {log.ipAddress}
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "right" }}>
                          {new Date(log.createdAt).toLocaleString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 6: SİSTEM VE MEDYA
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "SISTEM" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Galeri ve Medya Yönetimi ({images.length})
            </h3>

            {error && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 6,
                  backgroundColor: "var(--color-danger-bg)",
                  border: "1px solid var(--color-danger-border)",
                  color: "var(--color-danger)",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleAddImage} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              <div style={{ flex: "1 1 280px" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Görsel Bağlantısı (URL)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/gallery/1.png veya https://..."
                  required
                  style={inputBase}
                />
              </div>
              <div style={{ width: 200 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Kategori
                </label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputBase}>
                  <option value="GALERI">Galeri Sayfası</option>
                  <option value="GIRIS">Giriş Arkaplanı</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "0.62rem 1.25rem",
                  borderRadius: 6,
                  backgroundColor: "var(--LAC-orange)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Yükleniyor..." : "Görsel Ekle"}
              </button>
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "1rem" }}>
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    borderRadius: 6,
                    border: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-primary)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: 130, backgroundColor: "#0f172a", position: "relative" }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(15,23,42,0.8)",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                      }}
                    >
                      {img.type}
                    </span>
                  </div>
                  <div style={{ padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 130,
                      }}
                    >
                      {img.url.split("/").pop()}
                    </span>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      style={{
                        padding: "0.3rem 0.55rem",
                        borderRadius: 6,
                        backgroundColor: "var(--color-danger-bg)",
                        border: "1px solid var(--color-danger-border)",
                        color: "var(--color-danger)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
