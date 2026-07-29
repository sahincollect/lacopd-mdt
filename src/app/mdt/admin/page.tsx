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
  memur: { label: "Memur Başvurusu", icon: "fa-shield-halved", color: "var(--lapd-blue-dark)" },
  "ride-along": { label: "Ride Along", icon: "fa-car-side", color: "var(--lapd-orange)" },
  sikayet: { label: "Şikayet", icon: "fa-triangle-exclamation", color: "var(--color-danger)" },
};

const STATUS_OPTIONS = ["Bekliyor", "Inceleniyor", "Onaylandi", "Reddedildi"];
const STATUS_COLORS: Record<string, string> = {
  Bekliyor: "var(--lapd-orange)",
  Inceleniyor: "var(--lapd-blue-dark)",
  Onaylandi: "var(--color-success)",
  Reddedildi: "var(--color-danger)",
};

const DIVISIONS = [
  { id: "detective", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "var(--lapd-blue-dark)" },
  { id: "gnd", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "var(--lapd-blue-dark)" },
  { id: "git", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "var(--lapd-blue-dark)" },
  { id: "k9", name: "K-9 Unit", icon: "fa-paw", color: "var(--lapd-orange)" },
  { id: "dive", name: "Dive Unit", icon: "fa-water", color: "var(--lapd-blue-dark)" },
  { id: "swat", name: "SWAT Unit", icon: "fa-crosshairs", color: "var(--lapd-orange)" },
  { id: "patrol", name: "Traffic Unit", icon: "fa-car", color: "var(--color-success)" },
  { id: "air", name: "Air Unit", icon: "fa-helicopter", color: "var(--lapd-blue-dark)" },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>YÖNETİM VERİLERİ YÜKLENİYOR...</span>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-danger)" }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "3rem", marginBottom: "1rem" }} />
        <h2>YETKİSİZ ERİŞİM</h2>
        <p>Bu alana girmek için gerekli yetkilere sahip değilsiniz.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem",
    background: 'var(--bg-tertiary)', border: "1px solid var(--border-light)",
    borderRadius: '4px', color: 'var(--text-primary)', fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--lapd-blue-dark)", textTransform: "uppercase" }}>LOS ANGELES POLICE DEPARTMENT</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--text-muted)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--color-danger)", textTransform: "uppercase" }}>RESTRICTED ACCESS</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--lapd-blue-dark)", margin: 0, letterSpacing: "-0.03em", textTransform: 'uppercase' }}>
            ADMİN PANELİ
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: 'var(--bg-secondary)', padding: "0.5rem", borderRadius: '4px', border: "1px solid var(--border-light)" }}>
          <button onClick={() => setActiveTab("SISTEM")} style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: activeTab === "SISTEM" ? "var(--lapd-blue-dark)" : "transparent", color: activeTab === "SISTEM" ? "#fff" : "var(--text-muted)", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>SİSTEM & MEDYA</button>
          <button onClick={() => setActiveTab("DEPARTMAN")} style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: activeTab === "DEPARTMAN" ? "var(--lapd-blue-dark)" : "transparent", color: activeTab === "DEPARTMAN" ? "#fff" : "var(--text-muted)", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>BİRİM BAŞVURULARI</button>
          <button onClick={() => setActiveTab("SIVIL")} style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: activeTab === "SIVIL" ? "var(--lapd-blue-dark)" : "transparent", color: activeTab === "SIVIL" ? "#fff" : "var(--text-muted)", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>SİVİL BAŞVURULAR</button>
        </div>
      </div>

      <>
        
        {/* ── TAB 1: SYSTEM & MEDIA ── */}
        {activeTab === "SISTEM" && (
          <div key="sistem">
            <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
              
              {/* Reset Shifts */}
              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "2px solid var(--color-danger)", borderRadius: "8px", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--color-danger)", margin: "0 0 0.5rem 0", textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "0.5rem" }} /> Mesai Sıfırlama Protokolü
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 600 }}>Tüm personelin mevcut mesai saatlerini sıfırlar. Bu işlem geri alınamaz.</p>
                </div>
                <button onClick={handleResetShifts} style={{ background: "var(--color-danger)", color: "#fff", border: "none", padding: "1rem 2rem", borderRadius: "4px", fontWeight: 900, cursor: "pointer" }}>
                  TÜM MESAİLERİ SIFIRLA
                </button>
              </div>

              {/* Media Upload */}
              <div style={{ background: 'var(--bg-secondary)', border: "1px solid var(--border-light)", borderRadius: "8px", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--lapd-blue-dark)", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: 'uppercase' }}>
                  <i className="fa-solid fa-cloud-arrow-up" /> MEDYA YÜKLE
                </h3>
                {error && <div style={{ color: "#fff", background: "var(--color-danger)", padding: "1rem", borderRadius: "4px", marginBottom: "1.5rem", fontSize: "0.85rem", fontWeight: 700 }}><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
                
                <form onSubmit={handleAddImage} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 300px" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>GÖRSEL URL</label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="/media__123.png veya https://..." required style={inputStyle} />
                  </div>
                  <div style={{ width: "220px" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>KATEGORİ</label>
                    <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                      <option value="GALERI">Galeri Sayfası</option>
                      <option value="GIRIS">Giriş Arkaplanı</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ background: "var(--lapd-blue-dark)", color: "#fff", border: "none", padding: "0.75rem 2rem", borderRadius: "4px", fontWeight: 900, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                    {isSubmitting ? "YÜKLENİYOR..." : "SİSTEME YÜKLE"}
                  </button>
                </form>
              </div>

              {/* Media Gallery */}
              <div style={{ background: 'var(--bg-secondary)', border: "1px solid var(--border-light)", borderRadius: "8px", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--lapd-blue-dark)", margin: "0 0 1.5rem 0", textTransform: 'uppercase' }}>
                  <i className="fa-solid fa-images"></i> SİSTEM MEDYA ARŞİVİ
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  {images.map(img => (
                    <div key={img.id} style={{ background: 'var(--bg-primary)', borderRadius: '4px', border: "1px solid var(--border-light)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: "140px", background: "var(--bg-tertiary)", position: "relative" }}>
                        <img src={img.url} alt="medya" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {img.type}
                        </span>
                      </div>
                      <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px", fontWeight: 600 }}>{img.url.split('/').pop()}</div>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ background: "var(--color-danger)", color: "#fff", border: "none", borderRadius: "4px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", padding: "3rem", border: '1px dashed var(--border-light)', borderRadius: '4px', textAlign: "center", gridColumn: "1 / -1" }}>
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
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px dashed var(--border-light)", fontWeight: 600 }}>
                  Henüz birim başvurusu bulunmuyor.
                </div>
              ) : applications.map((app: any) => {
                const divInfo = DIVISIONS.find(d => d.id === app.division) || DIVISIONS[0];
                return (
                  <div key={app.id} style={{ background: "var(--bg-secondary)", borderRadius: '8px', border: "1px solid var(--border-light)", padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "4px", background: "var(--bg-tertiary)", border: `1px solid var(--border-light)`, display: "flex", alignItems: "center", justifyContent: "center", color: divInfo.color, fontSize: "1.25rem" }}>
                          <i className={`fa-solid ${divInfo.icon}`} />
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", fontWeight: 900, color: "var(--text-primary)" }}>#{app.officer?.badge} - {app.officer?.name}</h4>
                          <span style={{ fontSize: "0.8rem", color: divInfo.color, fontWeight: 800, textTransform: "uppercase" }}>{divInfo.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ 
                          padding: "0.4rem 1rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 900, textTransform: 'uppercase',
                          background: app.status === "Onaylandı" ? "var(--color-success)" : app.status === "Reddedildi" ? "var(--color-danger)" : "var(--lapd-orange)", 
                          color: "#fff" 
                        }}>
                          {app.status}
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Onaylandı')} style={{ width: "36px", height: "36px", borderRadius: "4px", background: "var(--color-success)", border: "none", color: "#fff", cursor: "pointer" }}><i className="fa-solid fa-check" /></button>
                          <button onClick={() => handleUpdateUnitStatus(app.id, 'Reddedildi')} style={{ width: "36px", height: "36px", borderRadius: "4px", background: "var(--color-danger)", border: "none", color: "#fff", cursor: "pointer" }}><i className="fa-solid fa-xmark" /></button>
                          <button onClick={() => handleDeleteUnitApp(app.id)} style={{ width: "36px", height: "36px", borderRadius: "4px", background: "var(--bg-tertiary)", border: '1px solid var(--border-light)', color: "var(--text-muted)", cursor: "pointer" }}><i className="fa-solid fa-trash" /></button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "var(--bg-tertiary)", padding: "1.5rem", borderRadius: '4px', border: "1px solid var(--border-light)" }}>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.5rem", textTransform: "uppercase" }}>Neden Katılmak İstiyor?</div>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.reason}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.5rem", textTransform: "uppercase" }}>Tecrübesi</div>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{app.experience}</p>
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
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px dashed var(--border-light)", fontWeight: 600 }}>
                  Henüz sivil başvuru bulunmuyor.
                </div>
              ) : civilApplications.map((app: any) => {
                const typeInfo = CIVIL_TYPE_LABELS[app.type] || { label: app.type, icon: "fa-file", color: 'var(--text-secondary)' };
                const content = parseContent(app.content);
                const isExpanded = expandedCivilId === app.id;
                const statusColor = STATUS_COLORS[app.status] || "var(--text-muted)";

                return (
                  <div key={app.id} style={{ background: "var(--bg-secondary)", borderRadius: '8px', border: "1px solid var(--border-light)", overflow: "hidden" }}>
                    
                    {/* Compact Header */}
                    <div onClick={() => setExpandedCivilId(isExpanded ? null : app.id)} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem", cursor: "pointer", borderBottom: isExpanded ? "1px solid var(--border-light)" : "none", background: isExpanded ? "var(--bg-tertiary)" : "transparent" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "4px", background: "var(--bg-tertiary)", border: `1px solid var(--border-light)`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color, fontSize: "1.2rem", flexShrink: 0 }}>
                        <i className={`fa-solid ${typeInfo.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.2rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 900, fontSize: "1.1rem" }}>{app.fullName}</span>
                          <span style={{ fontSize: "0.75rem", color: "#fff", background: typeInfo.color, padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: 800 }}>{typeInfo.label}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          <i className="fa-regular fa-calendar" style={{ marginRight: "0.4rem" }} />{new Date(app.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#fff", background: statusColor, padding: "0.4rem 1rem", borderRadius: "4px", textTransform: 'uppercase' }}>
                        {app.status}
                      </span>
                      <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "var(--text-muted)", fontSize: "1rem", marginLeft: "1rem" }} />
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: "2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                          {app.fullName && <div><div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.3rem" }}>AD SOYAD</div><div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.fullName}</div></div>}
                          {app.discordName && <div><div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.3rem" }}>DISCORD</div><div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.discordName}</div></div>}
                          {app.age && <div><div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.3rem" }}>YAŞ</div><div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.age}</div></div>}
                          {app.email && <div><div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.3rem" }}>E-POSTA</div><div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{app.email}</div></div>}
                          {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length < 200 && (
                            <div key={key}><div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.3rem", textTransform: "uppercase" }}>{key}</div><div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{val}</div></div>
                          ))}
                        </div>
                        {Object.entries(content).map(([key, val]) => val && typeof val === "string" && val.length >= 200 && (
                          <div key={key} style={{ marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.5rem", textTransform: "uppercase" }}>{key}</div>
                            <div style={{ background: "var(--bg-tertiary)", padding: "1.5rem", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px solid var(--border-light)" }}>{val}</div>
                          </div>
                        ))}
                        
                        {/* Actions */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "2rem", borderTop: "2px solid var(--border-light)", marginTop: "2rem" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 900 }}>DURUM GÜNCELLE:</span>
                          <select value={app.status} onChange={e => updateCivilStatus(app.id, e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "4px", background: "var(--bg-tertiary)", border: '1px solid var(--border-light)', color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", outline: "none" }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => deleteCivilApp(app.id)} style={{ marginLeft: "auto", padding: "0.6rem 1.5rem", borderRadius: "4px", background: "var(--color-danger)", border: "none", color: "#fff", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer" }}>
                            <i className="fa-solid fa-trash" style={{ marginRight: "0.5rem" }} /> BAŞVURUYU SİL
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
