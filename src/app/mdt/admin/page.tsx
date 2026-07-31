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
  memur: { label: "Memur Başvurusu", icon: "fa-shield-halved", color: "var(--mdt-accent)" },
  "ride-along": { label: "Ride Along", icon: "fa-car-side", color: "var(--mdt-warning)" },
  sikayet: { label: "Şikayet", icon: "fa-triangle-exclamation", color: "var(--mdt-danger)" },
};

const STATUS_OPTIONS = ["Bekliyor", "Inceleniyor", "Onaylandi", "Reddedildi"];
const STATUS_COLORS: Record<string, string> = {
  Bekliyor: "var(--mdt-warning)",
  Inceleniyor: "var(--mdt-accent)",
  Onaylandi: "var(--mdt-success)",
  Reddedildi: "var(--mdt-danger)",
};

const DIVISIONS = [
  { id: "detective", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "var(--mdt-accent)" },
  { id: "gnd", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "var(--mdt-accent)" },
  { id: "git", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "var(--mdt-accent)" },
  { id: "k9", name: "K-9 Unit", icon: "fa-paw", color: "var(--mdt-warning)" },
  { id: "dive", name: "Dive Unit", icon: "fa-water", color: "var(--mdt-accent)" },
  { id: "swat", name: "SWAT Unit", icon: "fa-crosshairs", color: "var(--mdt-warning)" },
  { id: "patrol", name: "Traffic Unit", icon: "fa-car", color: "var(--mdt-success)" },
  { id: "air", name: "Air Unit", icon: "fa-helicopter", color: "var(--mdt-accent)" },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--mdt-text-muted)", flexDirection: "column", gap: "1rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>YÖNETİM VERİLERİ YÜKLENİYOR...</span>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--mdt-danger)" }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "3rem", marginBottom: "1rem" }} />
        <h2>YETKİSİZ ERİŞİM</h2>
        <p>Bu alana girmek için gerekli yetkilere sahip değilsiniz.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem",
    background: 'var(--mdt-bg-main)', border: "1px solid var(--mdt-border)",
    borderRadius: '8px', color: 'var(--mdt-text-primary)', fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s"
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--mdt-border)", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · YÖNETİM
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-danger)" }}>RESTRICTED ACCESS</span>
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--mdt-text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Admin Paneli
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Sistem yönetimi ve başvuru değerlendirme paneli.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: 'var(--mdt-card-bg)', padding: "0.5rem", borderRadius: '8px', border: "1px solid var(--mdt-border)" }}>
          <button onClick={() => setActiveTab("SISTEM")} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: activeTab === "SISTEM" ? "var(--mdt-accent)" : "transparent", color: activeTab === "SISTEM" ? "#fff" : "var(--mdt-text-secondary)", border: "none", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }}>SİSTEM & MEDYA</button>
          <button onClick={() => setActiveTab("DEPARTMAN")} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: activeTab === "DEPARTMAN" ? "var(--mdt-accent)" : "transparent", color: activeTab === "DEPARTMAN" ? "#fff" : "var(--mdt-text-secondary)", border: "none", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }}>BİRİM BAŞVURULARI</button>
          <button onClick={() => setActiveTab("SIVIL")} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: activeTab === "SIVIL" ? "var(--mdt-accent)" : "transparent", color: activeTab === "SIVIL" ? "#fff" : "var(--mdt-text-secondary)", border: "none", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }}>SİVİL BAŞVURULAR</button>
        </div>
      </div>

      <>
        {/* ── TAB 1: SYSTEM & MEDIA ── */}
        {activeTab === "SISTEM" && (
          <div key="sistem">
            <div style={{ display: "flex", gap: "1.5rem", flexDirection: "column" }}>
              
              {/* Reset Shifts */}
              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--mdt-danger)", margin: "0 0 0.5rem 0", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-triangle-exclamation" /> Mesai Sıfırlama Protokolü
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--mdt-text-secondary)", fontWeight: 500 }}>Tüm personelin mevcut mesai saatlerini sıfırlar. Bu işlem geri alınamaz.</p>
                </div>
                <button onClick={handleResetShifts} style={{ background: "rgba(239,68,68,0.1)", color: "var(--mdt-danger)", border: "1px solid rgba(239,68,68,0.3)", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 800, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                  TÜM MESAİLERİ SIFIRLA
                </button>
              </div>

              {/* Media Upload */}
              <div style={{ background: 'var(--mdt-card-bg)', border: "1px solid var(--mdt-border)", borderRadius: "10px", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--mdt-text-primary)", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--mdt-accent)' }} /> MEDYA YÜKLE
                </h3>
                {error && <div style={{ color: "var(--mdt-danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.85rem", fontWeight: 700 }}><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
                
                <form onSubmit={handleAddImage} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 300px" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: '0.12em', color: "var(--mdt-text-muted)", marginBottom: "0.5rem" }}>GÖRSEL URL</label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="/media__123.png veya https://..." required style={inputStyle} 
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div style={{ width: "220px" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: '0.12em', color: "var(--mdt-text-muted)", marginBottom: "0.5rem" }}>KATEGORİ</label>
                    <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}>
                      <option value="GALERI">Galeri Sayfası</option>
                      <option value="GIRIS">Giriş Arkaplanı</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ background: "var(--mdt-accent)", color: "#111", border: "1px solid var(--mdt-accent)", padding: "0.85rem 2rem", borderRadius: "8px", fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "opacity 0.15s" }}
                    onMouseOver={e => !isSubmitting && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                    onMouseOut={e => !isSubmitting && ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                    {isSubmitting ? "YÜKLENİYOR..." : "SİSTEME YÜKLE"}
                  </button>
                </form>
              </div>

              {/* Media Gallery */}
              <div style={{ background: 'var(--mdt-card-bg)', border: "1px solid var(--mdt-border)", borderRadius: "10px", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--mdt-text-primary)", margin: "0 0 1.5rem 0", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-images" style={{ color: 'var(--mdt-accent)' }}></i> SİSTEM MEDYA ARŞİVİ
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  {images.map(img => (
                    <div key={img.id} style={{ background: 'var(--mdt-bg-main)', borderRadius: '8px', border: "1px solid var(--mdt-border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: "140px", background: "rgba(0,0,0,0.2)", position: "relative" }}>
                        <img src={img.url} alt="medya" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)', border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: '0.05em', color: "#fff" }}>
                          {img.type}
                        </span>
                      </div>
                      <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px", fontWeight: 600 }}>{img.url.split('/').pop()}</div>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ background: "rgba(239,68,68,0.1)", color: "var(--mdt-danger)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div style={{ color: "var(--mdt-text-muted)", fontSize: "0.95rem", padding: "3rem", border: '1px dashed var(--mdt-border)', borderRadius: '8px', textAlign: "center", gridColumn: "1 / -1" }}>
                      Medya bulunamadı.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: DEPARTMAN (BİRİM) BAŞVURULARI ── */}
        {activeTab === "DEPARTMAN" && (
          <div key="departman">
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {applications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--mdt-text-muted)", background: "var(--mdt-card-bg)", borderRadius: "10px", border: "1px dashed var(--mdt-border)", fontWeight: 600 }}>
                  Henüz birim başvurusu bulunmuyor.
                </div>
              ) : applications.map((app: any) => {
                const divInfo = DIVISIONS.find(d => d.id === app.division) || DIVISIONS[0];
                return (
                  <div key={app.id} style={{ background: "var(--mdt-card-bg)", borderRadius: '10px', border: "1px solid var(--mdt-border)", padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: `color-mix(in srgb, ${divInfo.color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${divInfo.color} 30%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: divInfo.color, fontSize: "1.25rem" }}>
                          <i className={`fa-solid ${divInfo.icon}`} />
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", fontWeight: 800, color: "var(--mdt-text-primary)" }}>#{app.officer?.badge} - {app.officer?.name}</h4>
                          <span style={{ fontSize: "0.75rem", color: divInfo.color, fontWeight: 700, letterSpacing: '0.05em' }}>{divInfo.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ 
                          padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
                          background: app.status === "Onaylandı" ? "rgba(34,197,94,0.1)" : app.status === "Reddedildi" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", 
                          color: app.status === "Onaylandı" ? "var(--mdt-success)" : app.status === "Reddedildi" ? "var(--mdt-danger)" : "var(--mdt-warning)",
                          border: `1px solid ${app.status === "Onaylandı" ? "rgba(34,197,94,0.2)" : app.status === "Reddedildi" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`
                        }}>
                          {app.status}
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Onaylandı')} style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "var(--mdt-success)", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; }}><i className="fa-solid fa-check" /></button>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Reddedildi')} style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--mdt-danger)", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}><i className="fa-solid fa-xmark" /></button>
                          <button onClick={() => handleDeleteUnitApp(app.id)} style={{ width: "36px", height: "36px", borderRadius: "6px", background: "transparent", border: '1px solid var(--mdt-border)', color: "var(--mdt-text-secondary)", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}><i className="fa-solid fa-trash" /></button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "var(--mdt-bg-main)", padding: "1.5rem", borderRadius: '8px', border: "1px solid var(--mdt-border)" }}>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: '0.1em' }}>Neden Katılmak İstiyor?</div>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--mdt-text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.reason}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: '0.1em' }}>Tecrübesi</div>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--mdt-text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.experience}</p>
                      </div>
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
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {civilApplications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--mdt-text-muted)", background: "var(--mdt-card-bg)", borderRadius: "10px", border: "1px dashed var(--mdt-border)", fontWeight: 600 }}>
                  Henüz sivil başvuru bulunmuyor.
                </div>
              ) : civilApplications.map((app: any) => {
                const typeInfo = CIVIL_TYPE_LABELS[app.type] || { label: app.type, icon: "fa-file", color: 'var(--mdt-text-secondary)' };
                const content = parseContent(app.content);
                const isExpanded = expandedCivilId === app.id;
                const statusColor = STATUS_COLORS[app.status] || "var(--mdt-text-muted)";

                return (
                  <div key={app.id} style={{ background: "var(--mdt-card-bg)", borderRadius: '10px', border: "1px solid var(--mdt-border)", overflow: "hidden" }}>
                    
                    {/* Compact Header */}
                    <div onClick={() => setExpandedCivilId(isExpanded ? null : app.id)} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem", cursor: "pointer", borderBottom: isExpanded ? "1px solid var(--mdt-border)" : "none", background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.15s" }}
                      onMouseOver={e => !isExpanded && ((e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)')}
                      onMouseOut={e => !isExpanded && ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "8px", background: `color-mix(in srgb, ${typeInfo.color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${typeInfo.color} 30%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color, fontSize: "1.2rem", flexShrink: 0 }}>
                        <i className={`fa-solid ${typeInfo.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.2rem" }}>
                          <span style={{ color: "var(--mdt-text-primary)", fontWeight: 800, fontSize: "1.05rem" }}>{app.fullName}</span>
                          <span style={{ fontSize: "0.65rem", color: typeInfo.color, background: `color-mix(in srgb, ${typeInfo.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${typeInfo.color} 20%, transparent)`, padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: 700 }}>{typeInfo.label}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--mdt-text-secondary)", fontWeight: 500 }}>
                          <i className="fa-regular fa-calendar" style={{ marginRight: "0.4rem" }} />{new Date(app.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: statusColor, background: `color-mix(in srgb, ${statusColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor} 20%, transparent)`, padding: "0.3rem 0.8rem", borderRadius: "6px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {app.status}
                      </span>
                      <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "var(--mdt-text-muted)", fontSize: "1rem", marginLeft: "1rem" }} />
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: "2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                          {app.fullName && <div><div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.3rem", letterSpacing: '0.1em' }}>AD SOYAD</div><div style={{ color: "var(--mdt-text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.fullName}</div></div>}
                          {app.discordName && <div><div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.3rem", letterSpacing: '0.1em' }}>DISCORD</div><div style={{ color: "var(--mdt-text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.discordName}</div></div>}
                          {app.age && <div><div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.3rem", letterSpacing: '0.1em' }}>YAŞ</div><div style={{ color: "var(--mdt-text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.age}</div></div>}
                          {app.email && <div><div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.3rem", letterSpacing: '0.1em' }}>E-POSTA</div><div style={{ color: "var(--mdt-text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.email}</div></div>}
                          {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length < 200 && (
                            <div key={key}><div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: '0.1em' }}>{key}</div><div style={{ color: "var(--mdt-text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{val}</div></div>
                          ))}
                        </div>
                        {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length >= 200 && (
                          <div key={key} style={{ marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: "0.7rem", color: "var(--mdt-text-muted)", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: '0.1em' }}>{key}</div>
                            <div style={{ background: "var(--mdt-bg-main)", padding: "1.5rem", borderRadius: "8px", color: "var(--mdt-text-primary)", fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px solid var(--mdt-border)" }}>{val}</div>
                          </div>
                        ))}
                        
                        {/* Actions */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--mdt-border)", marginTop: "2rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--mdt-text-secondary)", fontWeight: 700 }}>DURUM GÜNCELLE:</span>
                          <select value={app.status} onChange={e => updateCivilStatus(app.id, e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "var(--mdt-bg-main)", border: '1px solid var(--mdt-border)', color: "var(--mdt-text-primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", outline: "none", transition: "border-color 0.15s" }}
                            onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => deleteCivilApp(app.id)} style={{ marginLeft: "auto", padding: "0.6rem 1.25rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--mdt-danger)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: '0.5rem', transition: "background 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                            <i className="fa-solid fa-trash" /> BAŞVURUYU SİL
                          </button>
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
