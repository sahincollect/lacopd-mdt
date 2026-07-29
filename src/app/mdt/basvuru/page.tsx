"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const divisions = [
  { id: "detective", category: "Dedektif Bürosu", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "var(--lapd-blue-dark)", desc: "Cinayet ve organize suçlar soruşturma birimi." },
  { id: "gnd", category: "Dedektif Bürosu", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "var(--lapd-blue-dark)", desc: "Sokak çeteleri, uyuşturucu ve silah ticaretiyle mücadele." },
  { id: "git", category: "Gang Impact Teams", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "var(--lapd-blue-dark)", desc: "Sokak çetelerine karşı aktif taktiksel müdahale, önleme ve saha operasyonları birimi." },
  { id: "k9", category: "Metropolitan Division", name: "K-9 Unit", icon: "fa-paw", color: "var(--lapd-orange)", desc: "Özel eğitimli devriye köpekleri ile arama, takip ve yakalama." },
  { id: "dive", category: "Metropolitan Division", name: "Dive Unit", icon: "fa-water", color: "var(--lapd-blue-dark)", desc: "Sualtı delil arama, kurtarma ve kıyı devriyesi görevleri." },
  { id: "swat", category: "Metropolitan Division", name: "SWAT Unit", icon: "fa-crosshairs", color: "var(--lapd-orange)", desc: "Yüksek riskli operasyonlar, rehine kurtarma ve terörle mücadele." },
  { id: "patrol", category: "Destek ve Devriye Birimleri", name: "Traffic Unit", icon: "fa-car", color: "var(--color-success)", desc: "Trafik güvenliği, kazalara müdahale. HSU, Marry gibi devriyeleri içerir." },
  { id: "air", category: "Destek ve Devriye Birimleri", name: "Air Unit", icon: "fa-helicopter", color: "var(--lapd-blue-dark)", desc: "Göklerdeki gözümüz. Havadan devriye, aydınlatma ve takip." },
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>YÜKLENİYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Header */}
      <div style={{ borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--lapd-blue-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
          DEPARTMAN BİRİM BAŞVURUSU
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
          Kariyerinizi L.A.C.P.D. çatısı altında bir sonraki seviyeye taşıyın.
        </p>
      </div>

      {success ? (
        <div style={{ 
            padding: '4rem 2rem', background: 'var(--bg-secondary)', border: '2px solid var(--color-success)', 
            borderRadius: '8px', textAlign: 'center'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)', marginBottom: '1rem' }}>BAŞVURUNUZ ALINDI</h2>
          <p style={{ color: "var(--text-muted)", fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontWeight: 600 }}>
            Birim başvurunuz komuta kademesine başarıyla iletildi. Değerlendirme süreci tamamlandığında sistem üzerinden bilgilendirileceksiniz.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Left Side - Division Selection */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              HEDEF BİRİM SEÇİMİ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Array.from(new Set(divisions.map(d => d.category))).map(category => (
                <div key={category}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--lapd-orange)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    {category}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {divisions.filter(d => d.category === category).map((div) => {
                      const isSelected = selectedDivision === div.id;
                      return (
                        <div 
                          key={div.id} 
                          onClick={() => setSelectedDivision(div.id)}
                          style={{ 
                            padding: '1.25rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                            background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                            border: isSelected ? `2px solid var(--lapd-blue-dark)` : '1px solid var(--border-light)',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          <div style={{ 
                            width: '45px', height: '45px', borderRadius: '4px', flexShrink: 0,
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                            color: div.color
                          }}>
                            <i className={`fa-solid ${div.icon}`}></i>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{div.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>{div.desc}</p>
                          </div>
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--lapd-blue-dark)' }}>
                              <i className="fa-solid fa-circle-check"></i>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div style={{ 
              position: 'sticky', top: '2rem',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', 
              borderRadius: '8px', padding: '2rem'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeDivision ? (
                  <><i className={`fa-solid ${activeDivision.icon}`} style={{ color: activeDivision.color }}></i> {activeDivision.name} FORMU</>
                ) : 'FORM DETAYLARI'}
              </h3>
              
              {!activeDivision ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-hand-pointer" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>BİRİM SEÇİLMEDİ</h4>
                  <p style={{ maxWidth: '300px', margin: '0 auto', fontSize: '0.9rem', fontWeight: 600 }}>Sol taraftaki listeden başvurmak istediğiniz departman birimini seçerek başvuru formuna ulaşabilirsiniz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Neden Bu Birime Katılmak İstiyorsunuz?
                    </label>
                    <textarea 
                      name="reason" required value={formData.reason} onChange={handleChange}
                      style={{ 
                        width: '100%', minHeight: '120px', resize: 'vertical', background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-light)', borderRadius: '4px', padding: '1rem', 
                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit'
                      }}
                      placeholder="İlginizi, yeteneklerinizi ve sizi neden seçmemiz gerektiğini açıklayın..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Departman İçi Tecrübeleriniz
                    </label>
                    <textarea 
                      name="experience" required value={formData.experience} onChange={handleChange}
                      style={{ 
                        width: '100%', minHeight: '120px', resize: 'vertical', background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-light)', borderRadius: '4px', padding: '1rem', 
                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit'
                      }}
                      placeholder="Rütbeniz, aldığınız eğitimler ve katıldığınız operasyonlar..."
                    />
                  </div>

                  <div style={{ background: 'rgba(232, 79, 42, 0.1)', border: '1px solid rgba(232, 79, 42, 0.3)', padding: '1rem', borderRadius: '4px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: 'var(--lapd-orange)', marginTop: '0.2rem', fontSize: '1.2rem' }}></i>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: 600 }}>
                      Başvurunuz komuta kademesi tarafından detaylı olarak incelenecektir. Sabıka kaydınız ve mesai saatleriniz değerlendirmede önemli bir rol oynar.
                    </p>
                  </div>

                  <button 
                    type="submit" disabled={submitting}
                    style={{ 
                      background: 'var(--lapd-blue-dark)', color: '#fff', fontWeight: 900,
                      padding: '1rem', borderRadius: '4px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                      fontSize: '1rem', textTransform: 'uppercase'
                    }}
                  >
                    {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-paper-plane"></i> BAŞVURUYU GÖNDER</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BAŞVURULAR LİSTESİ */}
      {user && (
        <div style={{ marginTop: '2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user.role === 'admin' ? (
                <><i className="fa-solid fa-user-shield"></i> GELEN BİRİM BAŞVURULARI</>
              ) : (
                <><i className="fa-solid fa-clock-rotate-left"></i> GEÇMİŞ BAŞVURULARIM</>
              )}
            </h2>
            {user.role === 'admin' && (
              <span style={{ fontSize: '0.85rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid var(--border-light)', fontWeight: 800 }}>
                Toplam {applications.length} Başvuru
              </span>
            )}
          </div>
          
          <div>
            {applications.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Sistemde henüz bir başvuru bulunmuyor.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--lapd-blue-dark)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)' }}>TARİH</th>
                    {user.role === 'admin' && <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)' }}>PERSONEL</th>}
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)' }}>BİRİM</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)' }}>DURUM</th>
                    {user.role === 'admin' && <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', textAlign: 'right' }}>İŞLEMLER</th>}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app: any) => {
                    const divisionInfo = divisions.find(d => d.id === app.division) || divisions[0];
                    const isAdminView = user.role === 'admin';
                    
                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        
                        {isAdminView && (
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{app.officer?.name || 'Bilinmiyor'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{app.officer?.badge || '0000'} • {app.officer?.rank || 'Memur'}</div>
                          </td>
                        )}
                        
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            <i className={`fa-solid ${divisionInfo.icon}`} style={{ color: divisionInfo.color }}></i>
                            {divisionInfo.name}
                          </div>
                        </td>
                        
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase',
                            background: app.status === 'Onaylandı' ? 'var(--color-success)' : app.status === 'Reddedildi' ? 'var(--color-danger)' : 'var(--lapd-orange)',
                            color: '#fff'
                          }}>
                            {app.status}
                          </span>
                        </td>
                        
                        {isAdminView && (
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button onClick={() => handleUpdateStatus(app.id, 'Onaylandı')} style={{ background: 'var(--color-success)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>ONAYLA</button>
                              <button onClick={() => handleUpdateStatus(app.id, 'Reddedildi')} style={{ background: 'var(--color-danger)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>REDDET</button>
                              <button onClick={() => handleDelete(app.id)} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>SİL</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
