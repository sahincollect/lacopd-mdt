"use client";

import { useState } from 'react';
import toast from "react-hot-toast";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

// ── TYPES & CONSTANTS ──
interface SiteImage {
  id: number;
  url: string;
  type: string;
  createdAt: string;
}

const CIVIL_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  memur: { label: "Memur Başvurusu", icon: "fa-shield-halved", color: "#38BDF8" },
  "ride-along": { label: "Ride Along", icon: "fa-car-side", color: "#8B5CF6" },
  sikayet: { label: "Şikayet", icon: "fa-triangle-exclamation", color: "#F59E0B" },
};
const STATUS_OPTIONS = ["Bekliyor", "Inceleniyor", "Onaylandi", "Reddedildi"];
const STATUS_COLORS: Record<string, string> = {
  Bekliyor: "#F59E0B",
  Inceleniyor: "#38BDF8",
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

export default function AdminOptionsPage() {
  const [activeTab, setActiveTab] = useState<"SISTEM" | "DEPARTMAN" | "SIVIL">("SISTEM");
  
  // ── SWR DATA FETCHING ──
  const { data: meData } = useSWR('/api/auth/me', fetcher);
  const { data: imagesData, mutate: mutateImages } = useSWR('/api/images', fetcher);
  const { data: appData, mutate: mutateApps } = useSWR('/api/basvuru', fetcher);
  const { data: civilData, mutate: mutateCivil } = useSWR('/api/civil-applications', fetcher);

  const loading = !meData || !imagesData || !appData || !civilData;
  const user = meData?.user;
  const images: SiteImage[] = imagesData?.images || [];
  const applications = appData?.applications || [];
  const civilApplications = civilData?.applications || [];

  // ── TAB 1: SYSTEM & MEDIA STATES ──
  const [url, setUrl] = useState('');
  const [type, setType] = useState('GALERI');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── TAB 2: CIVIL APPLICATIONS STATES ──
  const [expandedCivilId, setExpandedCivilId] = useState<number | null>(null);

  // ── ACTION HANDLERS (SYSTEM) ──
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.startsWith('/media') && !url.startsWith('http')) {
      setError('URL geçerli bir link veya /media... şeklinde olmalıdır.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      if (res.ok) {
        setUrl('');
        toast.success('Medya başarıyla eklendi!');
        mutateImages();
      } else {
        const data = await res.json();
        setError(data.error || 'Resim eklenemedi.');
      }
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Bu resmi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Medya sistemden silindi.');
        mutateImages();
      } else toast.error('Resim silinemedi.');
    } catch (err) { console.error(err); }
  };

  const handleResetShifts = async () => {
    if (!confirm('DİKKAT: TÜM PERSONEL MESAİ SÜRELERİNİ SIFIRLAMAK ÜZERESİNİZ. Bu işlemin geri dönüşü yoktur! Onaylıyor musunuz?')) return;
    try {
      const res = await fetch('/api/shifts/reset', { method: 'DELETE' });
      if (res.ok) toast.success('Tüm mesai süreleri başarıyla sıfırlandı.');
      else {
        const data = await res.json();
        toast.error(data.error || 'Mesailer sıfırlanamadı.');
      }
    } catch { toast.error('Sıfırlama hatası oluştu.'); }
  };

  // ── ACTION HANDLERS (UNIT APPS) ──
  const handleUpdateUnitStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/basvuru/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) { toast.success("Birim başvurusu güncellendi."); mutateApps(); }
    } catch { toast.error("Hata oluştu."); }
  };
  const handleDeleteUnitApp = async (id: number) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/basvuru/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Başvuru silindi."); mutateApps(); }
    } catch { toast.error("Hata oluştu."); }
  };

  // ── ACTION HANDLERS (CIVIL APPS) ──
  const updateCivilStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/civil-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success("Sivil başvuru durumu güncellendi."); mutateCivil(); }
    } catch { toast.error("Hata oluştu."); }
  };
  const deleteCivilApp = async (id: number) => {
    if (!confirm("Bu sivil başvuruyu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/civil-applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sivil başvuru silindi.");
        mutateCivil();
        if (expandedCivilId === id) setExpandedCivilId(null);
      }
    } catch { toast.error("Hata oluştu."); }
  };
  const parseContent = (content: string) => { try { return JSON.parse(content); } catch { return {}; } };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "#64748B", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#38BDF8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", fontWeight: 600 }}>YÖNETİM VERİLERİ YÜKLENİYOR</span>
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "#F87171" }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "3rem", marginBottom: "1rem" }} />
        <h2>YETKİSİZ ERİŞİM</h2>
        <p>Bu alana girmek için gerekli yetkilere sahip değilsiniz.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "5rem", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.15em", textTransform: "uppercase" }}>LOS ANGELES POLICE DEPARTMENT</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#475569" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#F87171", letterSpacing: "0.1em" }}>RESTRICTED ACCESS</span>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>Admin Seçenekleri</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem", backgroundColor: "rgba(15, 23, 42, 0.4)", padding: "0.4rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setActiveTab("SISTEM")} style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", background: activeTab === "SISTEM" ? "rgba(56, 189, 248, 0.15)" : "transparent", color: activeTab === "SISTEM" ? "#38BDF8" : "#94A3B8", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>Sistem & Medya</button>
          <button onClick={() => setActiveTab("DEPARTMAN")} style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", background: activeTab === "DEPARTMAN" ? "rgba(56, 189, 248, 0.15)" : "transparent", color: activeTab === "DEPARTMAN" ? "#38BDF8" : "#94A3B8", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>Birim Başvuruları</button>
          <button onClick={() => setActiveTab("SIVIL")} style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", background: activeTab === "SIVIL" ? "rgba(56, 189, 248, 0.15)" : "transparent", color: activeTab === "SIVIL" ? "#38BDF8" : "#94A3B8", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>Başvurular</button>
        </div>
      </div>

      <>
        
        {/* ── TAB 1: SYSTEM & MEDIA ── */}
        {activeTab === "SISTEM" && (
          <div key="sistem">
            <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
              {/* Reset Shifts */}
              <div style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "20px", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F87171", margin: "0 0 0.4rem 0" }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "0.5rem" }} /> Mesai Sıfırlama Protokolü</h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#94A3B8" }}>Tüm personelin mevcut mesai saatlerini sıfırlar. Bu işlem geri alınamaz.</p>
                </div>
                <button onClick={handleResetShifts} style={{ background: "#EF4444", color: "var(--text-primary)", border: "none", padding: "0.8rem 1.5rem", borderRadius: "10px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)" }}>
                  TÜM MESAİLERİ SIFIRLA
                </button>
              </div>

              {/* Media Upload */}
              <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "2.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ color: "#38BDF8" }} /> Medya Yükle
                </h3>
                {error && <div style={{ color: "#FCA5A5", background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem", fontSize: "0.85rem", fontWeight: 600 }}>{error}</div>}
                <form onSubmit={handleAddImage} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 300px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", marginBottom: "0.5rem" }}>GÖRSEL URL</label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="/media__123.png veya https://..." required style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "var(--text-primary)", outline: "none", fontSize: "0.9rem" }} />
                  </div>
                  <div style={{ width: "220px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", marginBottom: "0.5rem" }}>KATEGORİ</label>
                    <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "var(--text-primary)", outline: "none", fontSize: "0.9rem", appearance: "none" }}>
                      <option value="GALERI" style={{ background: "#0F172A" }}>Galeri Sayfası</option>
                      <option value="GIRIS" style={{ background: "#0F172A" }}>Giriş Arkaplanı</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ background: "#38BDF8", color: "#0F172A", border: "none", padding: "0.8rem 2rem", borderRadius: "10px", fontWeight: 800, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? "YÜKLENİYOR..." : "SİSTEME YÜKLE"}
                  </button>
                </form>
              </div>

              {/* Media Gallery */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Sistem Medya Arşivi</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  {images.map(img => (
                    <div key={img.id} style={{ background: "rgba(15, 23, 42, 0.4)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: "140px", background: "#000", position: "relative" }}>
                        {/* eslint-disable-next-line */}
                        <img src={img.url} alt="medya" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "rgba(0,0,0,0.7)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800, color: "var(--text-primary)" }}>{img.type}</span>
                      </div>
                      <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "0.7rem", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{img.url.split('/').pop()}</div>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><i className="fa-solid fa-trash" /></button>
                      </div>
                    </div>
                  ))}
                  {images.length === 0 && <div style={{ color: "#64748B", fontSize: "0.85rem", padding: "2rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px", textAlign: "center" }}>Medya bulunamadı.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: DEPARTMAN (BİRİM) BAŞVURULARI ── */}
        {activeTab === "DEPARTMAN" && (
          <div key="departman">
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {applications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#64748B", background: "rgba(15, 23, 42, 0.3)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.06)" }}>Henüz birim başvurusu bulunmuyor.</div>
              ) : applications.map((app: any) => {
                const divInfo = DIVISIONS.find(d => d.id === app.division) || DIVISIONS[0];
                return (
                  <div key={app.id} style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: divInfo.color }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${divInfo.color}15`, border: `1px solid ${divInfo.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: divInfo.color, fontSize: "1.1rem" }}><i className={`fa-solid ${divInfo.icon}`} /></div>
                        <div>
                          <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>#{app.officer?.badge} - {app.officer?.name}</h4>
                          <span style={{ fontSize: "0.75rem", color: divInfo.color, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{divInfo.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ padding: "0.3rem 0.8rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 800, background: app.status === "Onaylandı" ? "rgba(52, 211, 153, 0.15)" : app.status === "Reddedildi" ? "rgba(248, 113, 113, 0.15)" : "rgba(245, 158, 11, 0.15)", color: app.status === "Onaylandı" ? "#34D399" : app.status === "Reddedildi" ? "#F87171" : "#F59E0B" }}>{app.status}</span>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Onaylandı')} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.3)", color: "#34D399", cursor: "pointer" }}><i className="fa-solid fa-check" /></button>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Reddedildi')} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#F87171", cursor: "pointer" }}><i className="fa-solid fa-xmark" /></button>
                          <button onClick={() => handleDeleteUnitApp(app.id)} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: '1px solid var(--border-light)', color: "#94A3B8", cursor: "pointer" }}><i className="fa-solid fa-trash" /></button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "rgba(0,0,0,0.2)", padding: "1.25rem", borderRadius: "12px", borderLeft: `2px solid ${divInfo.color}40`, marginLeft: "0.5rem" }}>
                      <div><div style={{ fontSize: "0.7rem", color: divInfo.color, fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>Neden Katılmak İstiyor?</div><p style={{ margin: 0, fontSize: "0.85rem", color: "#E2E8F0", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.reason}</p></div>
                      <div><div style={{ fontSize: "0.7rem", color: divInfo.color, fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>Tecrübesi</div><p style={{ margin: 0, fontSize: "0.85rem", color: "#E2E8F0", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.experience}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: SİVİL BAŞVURULAR ── */}
        {activeTab === "SIVIL" && (
          <div key="sivil">
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {civilApplications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#64748B", background: "rgba(15, 23, 42, 0.3)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.06)" }}>Henüz sivil başvuru bulunmuyor.</div>
              ) : civilApplications.map((app: any) => {
                const typeInfo = CIVIL_TYPE_LABELS[app.type] || { label: app.type, icon: "fa-file", color: 'var(--text-secondary)' };
                const content = parseContent(app.content);
                const isExpanded = expandedCivilId === app.id;
                const statusColor = STATUS_COLORS[app.status] || "#94A3B8";

                return (
                  <div key={app.id}>
                    <div onClick={() => setExpandedCivilId(isExpanded ? null : app.id)} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem 1.5rem", background: isExpanded ? "rgba(56, 189, 248, 0.05)" : "rgba(15, 23, 42, 0.6)", border: `1px solid ${isExpanded ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: isExpanded ? "16px 16px 0 0" : "16px", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${typeInfo.color}15`, border: `1px solid ${typeInfo.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color, fontSize: "1rem", flexShrink: 0 }}><i className={`fa-solid ${typeInfo.icon}`} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.2rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem" }}>{app.fullName}</span>
                          <span style={{ fontSize: "0.65rem", color: typeInfo.color, background: `${typeInfo.color}15`, padding: "0.2rem 0.6rem", borderRadius: "50px", fontWeight: 800 }}>{typeInfo.label}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}><i className="fa-regular fa-calendar" style={{ marginRight: "0.4rem" }} />{new Date(app.createdAt).toLocaleDateString("tr-TR")}</div>
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, padding: "0.3rem 0.8rem", borderRadius: "50px" }}>{app.status}</span>
                      <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "#64748B", fontSize: "0.8rem", marginLeft: "0.5rem" }} />
                    </div>
                    
                    {isExpanded && (
                      <div style={{ padding: "2rem", background: "rgba(8, 14, 28, 0.6)", border: "1px solid rgba(56, 189, 248, 0.2)", borderTop: "none", borderRadius: "0 0 16px 16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                          {app.fullName && <div><div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.3rem" }}>AD SOYAD</div><div style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>{app.fullName}</div></div>}
                          {app.discordName && <div><div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.3rem" }}>DISCORD</div><div style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>{app.discordName}</div></div>}
                          {app.age && <div><div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.3rem" }}>YAŞ</div><div style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>{app.age}</div></div>}
                          {app.email && <div><div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.3rem" }}>E-POSTA</div><div style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>{app.email}</div></div>}
                          {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length < 200 && (
                            <div key={key}><div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.3rem", textTransform: "uppercase" }}>{key}</div><div style={{ color: "#E2E8F0", fontSize: "0.85rem", fontWeight: 600 }}>{val}</div></div>
                          ))}
                        </div>
                        {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length >= 200 && (
                          <div key={key} style={{ marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>{key}</div>
                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "10px", color: "#CBD5E1", fontSize: "0.85rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,0.05)" }}>{val}</div>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 800 }}>DURUM:</span>
                          <select value={app.status} onChange={e => updateCivilStatus(app.id, e.target.value)} style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: '1px solid var(--border-light)', color: statusColor, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", outline: "none" }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: "#0F172A", color: "var(--text-primary)" }}>{s}</option>)}
                          </select>
                          <button onClick={() => deleteCivilApp(app.id)} style={{ marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#F87171", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}><i className="fa-solid fa-trash" style={{ marginRight: "0.4rem" }} /> SİL</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    </div>
  );
}
