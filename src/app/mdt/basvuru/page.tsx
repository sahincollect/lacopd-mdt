"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const divisions = [
  { id: "detective", category: "Dedektif Bürosu", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "var(--mdt-accent)", desc: "Cinayet ve organize suçlar soruşturma birimi." },
  { id: "gnd", category: "Dedektif Bürosu", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "var(--mdt-accent)", desc: "Sokak çeteleri, uyuşturucu ve silah ticaretiyle mücadele." },
  { id: "git", category: "Gang Impact Teams", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "var(--mdt-accent)", desc: "Sokak çetelerine karşı aktif taktiksel müdahale, önleme ve saha operasyonları birimi." },
  { id: "k9", category: "Metropolitan Division", name: "K-9 Unit", icon: "fa-paw", color: "var(--mdt-orange)", desc: "Özel eğitimli devriye köpekleri ile arama, takip ve yakalama." },
  { id: "dive", category: "Metropolitan Division", name: "Dive Unit", icon: "fa-water", color: "var(--mdt-accent)", desc: "Sualtı delil arama, kurtarma ve kıyı devriyesi görevleri." },
  { id: "swat", category: "Metropolitan Division", name: "SWAT Unit", icon: "fa-crosshairs", color: "var(--mdt-orange)", desc: "Yüksek riskli operasyonlar, rehine kurtarma ve terörle mücadele." },
  { id: "patrol", category: "Destek ve Devriye Birimleri", name: "Traffic Unit", icon: "fa-car", color: "var(--mdt-success)", desc: "Trafik güvenliği, kazalara müdahale. HSU, Marry gibi devriyeleri içerir." },
  { id: "air", category: "Destek ve Devriye Birimleri", name: "Air Unit", icon: "fa-helicopter", color: "var(--mdt-accent)", desc: "Göklerdeki gözümüz. Havadan devriye, aydınlatma ve takip." },
];

export default function BirimBasvuruPage() {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState({ reason: "", experience: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: meData } = useSWR('/api/auth/me', fetcher);
  const { data: appData, mutate: mutateApps } = useSWR('/api/basvuru', fetcher);

  const loading = !meData || !appData;
  const user = meData?.user || null;
  const applications = appData?.applications || [];

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/basvuru/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        mutateApps();
        toast.success(`Başvuru ${status} olarak güncellendi.`);
      }
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/basvuru/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateApps();
        toast.success("Başvuru silindi.");
      }
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDivision) {
      toast.error("Lütfen başvurmak istediğiniz birimi seçin.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/basvuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          division: selectedDivision, 
          reason: formData.reason, 
          experience: formData.experience 
        })
      });

      if (res.ok) {
        setSuccess(true);
        mutateApps();
        toast.success("Başvurunuz başarıyla oluşturuldu.");
        setTimeout(() => {
          setSuccess(false);
          setSelectedDivision(null);
          setFormData({ reason: "", experience: "" });
        }, 5000);
      } else {
        toast.error("İşlem başarısız oldu. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      toast.error("Sunucuya bağlanılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeDivision = divisions.find(d => d.id === selectedDivision);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 52, borderRadius: 8, background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', opacity: 0.5 }} />
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--mdt-border)', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem' }}>
            L.A.C.P.D. · İNSAN KAYNAKLARI
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--mdt-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Birim Başvuruları
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Kariyerinizi L.A.C.P.D. çatısı altında bir sonraki seviyeye taşıyın.
          </p>
        </div>
      </div>

      {success ? (
        <div style={{ 
          background: 'var(--mdt-card-bg)',
          border: '1px solid var(--mdt-success)',
          borderRadius: 10,
          padding: '4rem 2rem',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(0,210,106,0.1)'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,210,106,0.15)', color: 'var(--mdt-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', border: '1px solid rgba(0,210,106,0.3)' }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--mdt-text-primary)', marginBottom: '1rem' }}>BAŞVURUNUZ ALINDI</h2>
          <p style={{ color: "var(--mdt-text-secondary)", fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Birim başvurunuz komuta kademesine başarıyla iletildi. Değerlendirme süreci tamamlandığında sistem üzerinden bilgilendirileceksiniz.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1rem' }}>
            <i className="fa-solid fa-crosshairs" style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem', opacity: 0.8 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>Hedef Birim Seçimi</span>
            <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {divisions.map((div) => {
              const isSelected = selectedDivision === div.id;
              return (
                <div 
                  key={div.id} 
                  onClick={() => setSelectedDivision(div.id)}
                  style={{ 
                    background: isSelected ? 'var(--mdt-hover)' : 'var(--mdt-card-bg)',
                    border: isSelected ? '1px solid var(--mdt-accent)' : '1px solid var(--mdt-border)',
                    borderRadius: 10,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 0 1px var(--mdt-accent)' : 'none'
                  }}
                  onMouseOver={e => !isSelected && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)')}
                  onMouseOut={e => !isSelected && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)')}
                >
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: `color-mix(in srgb, ${div.color} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                    color: div.color
                  }}>
                    <i className={`fa-solid ${div.icon}`}></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mdt-text-primary)', margin: '0 0 0.3rem 0' }}>{div.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--mdt-text-secondary)', lineHeight: '1.4', margin: 0 }}>{div.desc}</p>
                  </div>
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--mdt-accent)' }}>
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '2.5rem 0 1rem' }}>
            <i className="fa-solid fa-file-pen" style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem', opacity: 0.8 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>Başvuru Formu</span>
            <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 10, padding: '1.5rem' }}>
            {!activeDivision ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--mdt-text-muted)' }}>
                <i className="fa-solid fa-hand-pointer" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--mdt-text-secondary)' }}>Birim Seçilmedi</h4>
                <p style={{ maxWidth: '300px', margin: '0 auto', fontSize: '0.85rem' }}>Yukarıdaki listeden başvurmak istediğiniz departman birimini seçerek başvuru formuna ulaşabilirsiniz.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <i className={`fa-solid ${activeDivision.icon}`} style={{ color: activeDivision.color, fontSize: '1.1rem' }}></i>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mdt-text-primary)', margin: 0 }}>
                    {activeDivision.name} Başvurusu
                  </h3>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>
                    Neden Bu Birime Katılmak İstiyorsunuz?
                  </label>
                  <textarea 
                    name="reason" required value={formData.reason} onChange={handleChange}
                    style={{
                      width: '100%',
                      background: 'var(--mdt-bg-main)',
                      border: '1px solid var(--mdt-border)',
                      borderRadius: 8,
                      padding: '0.85rem',
                      color: 'var(--mdt-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                    placeholder="İlginizi, yeteneklerinizi ve sizi neden seçmemiz gerektiğini açıklayın..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>
                    Departman İçi Tecrübeleriniz
                  </label>
                  <textarea 
                    name="experience" required value={formData.experience} onChange={handleChange}
                    style={{
                      width: '100%',
                      background: 'var(--mdt-bg-main)',
                      border: '1px solid var(--mdt-border)',
                      borderRadius: 8,
                      padding: '0.85rem',
                      color: 'var(--mdt-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Rütbeniz, aldığınız eğitimler ve katıldığınız operasyonlar..."
                  />
                </div>

                <div style={{ background: 'rgba(232, 79, 42, 0.08)', border: '1px solid rgba(232, 79, 42, 0.2)', padding: '0.85rem', borderRadius: 8, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--mdt-orange)', marginTop: '0.1rem', fontSize: '1rem' }}></i>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mdt-text-secondary)', lineHeight: '1.5' }}>
                    Başvurunuz komuta kademesi tarafından detaylı olarak incelenecektir. Sabıka kaydınız ve mesai saatleriniz değerlendirmede önemli bir rol oynar.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button 
                    type="submit" disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: 8, border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
                    onMouseOver={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                    onMouseOut={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '1')}
                  >
                    {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İşleniyor</> : <><i className="fa-solid fa-paper-plane"></i> Başvuruyu Gönder</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      {/* BAŞVURULAR LİSTESİ */}
      {user && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '3rem 0 1rem' }}>
            <i className={user.role === 'admin' ? "fa-solid fa-user-shield" : "fa-solid fa-clock-rotate-left"} style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem', opacity: 0.8 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>
              {user.role === 'admin' ? "Gelen Başvurular" : "Geçmiş Başvurularım"}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
          </div>

          <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 10, overflow: 'hidden' }}>
            {applications.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--mdt-text-muted)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mdt-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '1.5rem', color: 'var(--mdt-accent)', opacity: 0.6 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--mdt-text-secondary)', marginBottom: '0.3rem' }}>Kayıt bulunamadı</div>
                  <div style={{ fontSize: '0.82rem' }}>Sistemde henüz bir başvuru bulunmuyor.</div>
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)' }}>
                        TARİH
                      </th>
                      {user.role === 'admin' && (
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)' }}>
                          PERSONEL
                        </th>
                      )}
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)' }}>
                        BİRİM
                      </th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)' }}>
                        DURUM
                      </th>
                      {user.role === 'admin' && (
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)' }}>
                          İŞLEMLER
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app: any) => {
                      const divisionInfo = divisions.find(d => d.id === app.division) || divisions[0];
                      const isAdminView = user.role === 'admin';
                      
                      return (
                        <tr key={app.id} style={{ transition: 'background 0.1s' }}
                            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)'}
                            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--mdt-text-secondary)', borderBottom: '1px solid var(--mdt-border)' }}>
                            {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          
                          {isAdminView && (
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--mdt-border)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--mdt-text-primary)', fontSize: '0.85rem' }}>{app.officer?.name || 'Bilinmiyor'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--mdt-text-muted)' }}>#{app.officer?.badge || '0000'} • {app.officer?.rank || 'Memur'}</div>
                            </td>
                          )}
                          
                          <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--mdt-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mdt-text-primary)' }}>
                              <i className={`fa-solid ${divisionInfo.icon}`} style={{ color: divisionInfo.color }}></i>
                              {divisionInfo.name}
                            </div>
                          </td>
                          
                          <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--mdt-border)' }}>
                            <span style={{ 
                              padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                              background: app.status === 'Onaylandı' ? 'rgba(0,210,106,0.12)' : app.status === 'Reddedildi' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.14)',
                              color: app.status === 'Onaylandı' ? 'var(--mdt-success)' : app.status === 'Reddedildi' ? 'var(--mdt-danger)' : 'var(--mdt-warning)',
                              border: `1px solid ${app.status === 'Onaylandı' ? 'rgba(0,210,106,0.22)' : app.status === 'Reddedildi' ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.25)'}`
                            }}>
                              {app.status}
                            </span>
                          </td>
                          
                          {isAdminView && (
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--mdt-border)', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button onClick={() => handleUpdateStatus(app.id, 'Onaylandı')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid rgba(0,210,106,0.3)', background: 'rgba(0,210,106,0.1)', color: 'var(--mdt-success)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}>ONAYLA</button>
                                <button onClick={() => handleUpdateStatus(app.id, 'Reddedildi')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: 'var(--mdt-danger)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}>REDDET</button>
                                <button onClick={() => handleDelete(app.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}>SİL</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
