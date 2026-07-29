"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const divisions = [
  { id: "detective", category: "Dedektif Bürosu", name: "Dedektif Bürosu (RHD)", icon: "fa-user-secret", color: "#0284c7", glow: "0 0 20px rgba(14, 165, 233,0.5)", desc: "Cinayet ve organize suçlar soruşturma birimi." },
  { id: "gnd", category: "Dedektif Bürosu", name: "Gangs & Narcotics (GND)", icon: "fa-skull-crossbones", color: "#EC4899", glow: "0 0 20px rgba(236,72,153,0.5)", desc: "Sokak çeteleri, uyuşturucu ve silah ticaretiyle mücadele." },
  { id: "git", category: "Gang Impact Teams", name: "Gang Impact Teams (GIT)", icon: "fa-people-group", color: "#8b5cf6", glow: "0 0 20px rgba(139,92,246,0.5)", desc: "Sokak çetelerine karşı aktif taktiksel müdahale, önleme ve saha operasyonları birimi." },
  { id: "k9", category: "Metropolitan Division", name: "K-9 Unit", icon: "fa-paw", color: "#F59E0B", glow: "0 0 20px rgba(245,158,11,0.5)", desc: "Özel eğitimli devriye köpekleri ile arama, takip ve yakalama." },
  { id: "dive", category: "Metropolitan Division", name: "Dive Unit", icon: "fa-water", color: "#0ea5e9", glow: "0 0 20px rgba(6,182,212,0.5)", desc: "Sualtı delil arama, kurtarma ve kıyı devriyesi görevleri." },
  { id: "swat", category: "Metropolitan Division", name: "SWAT Unit", icon: "fa-crosshairs", color: "#0ea5e9", glow: "0 0 20px rgba(14, 165, 233,0.5)", desc: "Yüksek riskli operasyonlar, rehine kurtarma ve terörle mücadele." },
  { id: "patrol", category: "Destek ve Devriye Birimleri", name: "Traffic Unit", icon: "fa-car", color: "#10B981", glow: "0 0 20px rgba(14, 165, 233,0.5)", desc: "Trafik güvenliği, kazalara müdahale. HSU, Marry gibi devriyeleri içerir." },
  { id: "air", category: "Destek ve Devriye Birimleri", name: "Air Unit", icon: "fa-helicopter", color: "#0369a1", glow: "0 0 20px rgba(139,92,246,0.5)", desc: "Göklerdeki gözümüz. Havadan devriye, aydınlatma ve takip." },
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
      if (res.ok) mutateApps();
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/basvuru/${id}`, { method: "DELETE" });
      if (res.ok) mutateApps();
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
        toast.success("Başvurunuz başarıyla oluşturuldu ve incelenmek üzere iletildi.");
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-secondary)", flexDirection: "column", gap: "1.5rem" }}>
      <i className="fa-solid fa-circle-notch" style={{ fontSize: "2.5rem", color: "var(--accent-primary)" }} />
      <span style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}>Veriler Yükleniyor...</span>
    </div>
  );

  return (
    <div style={{ paddingBottom: '4rem', maxWidth: "1600px", width: "100%", padding: "0 1rem", margin: "0 auto", color: 'var(--text-primary)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Departman İçi <span style={{ color: "var(--accent-primary)", textShadow: "0 0 20px rgba(14, 165, 233,0.4)" }}>Birim Başvurusu</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kariyerinizi bir sonraki seviyeye taşıyın.
          </p>
        </div>
      </div>

      <>
        {success ? (
          <div 
            key="success"
           
            style={{ 
              padding: '4rem 2rem', border: '1px solid rgba(14, 165, 233, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '20px',
              textAlign: 'center', boxShadow: '0 0 40px rgba(14, 165, 233, 0.1)'
            }}
          >
            <div 
             
              style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', border: '2px solid rgba(14, 165, 233, 0.4)', boxShadow: '0 0 20px rgba(14, 165, 233,0.3)' }}
            >
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginBottom: '1rem', textTransform: 'uppercase' }}>Başvurunuz Alındı</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Birim başvurunuz komuta kademesine başarıyla iletildi. Değerlendirme süreci tamamlandığında sistem üzerinden bilgilendirileceksiniz.
            </p>
          </div>
        ) : (
          <div key="form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
            
            {/* Left Side - Division Selection */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '0.5rem' }}>Hedef Birim Seçimi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Array.from(new Set(divisions.map(d => d.category))).map(category => (
                  <div key={category}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>{category}</h4>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {divisions.filter(d => d.category === category).map((div) => {
                        const isSelected = selectedDivision === div.id;
                        return (
                          <div 
                            key={div.id} onClick={() => setSelectedDivision(div.id)}
                            whileHover={{ scale: isSelected ? 1.02 : 1.01 }} whileTap={{ scale: 0.98 }}
                            style={{ 
                              padding: '1.25rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                              backgroundColor: isSelected ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.4)',
                              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                              border: isSelected ? `1px solid ${div.color}` : '1px solid rgba(255,255,255,0.05)',
                              boxShadow: isSelected ? `0 10px 30px rgba(0,0,0,0.3), inset 0 0 20px ${div.color}15, ${div.glow}` : '0 4px 15px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{ 
                              width: '48px', height: '48px', borderRadius: '6px', flexShrink: 0,
                              backgroundColor: isSelected ? `${div.color}15` : 'rgba(255,255,255,0.03)',
                              border: isSelected ? `1px solid ${div.color}40` : '1px solid rgba(255,255,255,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                              color: isSelected ? div.color : 'rgba(255,255,255,0.4)',
                              boxShadow: isSelected ? div.glow : 'none'
                            }}>
                              <i className={`fa-solid ${div.icon}`}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>{div.name}</h4>
                              <p style={{ fontSize: '0.85rem', color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', lineHeight: '1.5', margin: 0 }}>{div.desc}</p>
                            </div>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? `2px solid ${div.color}` : '2px solid rgba(255,255,255,0.1)', backgroundColor: isSelected ? div.color : 'transparent', color: '#000', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSelected ? div.glow : 'none' }}>
                              {isSelected && <i className="fa-solid fa-check"></i>}
                            </div>
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
                backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: activeDivision ? `1px solid ${activeDivision.color}40` : '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '20px', padding: '2.5rem',
                boxShadow: activeDivision ? `0 20px 50px rgba(0,0,0,0.3), inset 0 0 20px ${activeDivision.color}10` : '0 20px 40px rgba(0,0,0,0.2)',
                transition: 'all 0.4s ease'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  {activeDivision ? (
                    <><i className={`fa-solid ${activeDivision.icon}`} style={{ color: activeDivision.color, textShadow: activeDivision.glow }}></i> <span style={{ color: activeDivision.color }}>{activeDivision.name}</span> FORMU</>
                  ) : 'FORM DETAYLARI'}
                </h3>
                
                {!activeDivision ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '300px' }}>
                    <div>
                      <i className="fa-solid fa-hand-pointer" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
                    </div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Birim Seçilmedi</h4>
                    <p style={{ maxWidth: '250px', margin: '0 auto', lineHeight: '1.6', fontSize: '0.9rem' }}>Sol taraftaki listeden başvurmak istediğiniz departman birimini seçerek detaylara ulaşabilirsiniz.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: activeDivision.color, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Neden Bu Birime Katılmak İstiyorsunuz?
                      </label>
                      <textarea 
                        name="reason" required value={formData.reason} onChange={handleChange}
                        style={{ 
                          width: '100%', minHeight: '120px', resize: 'vertical', backgroundColor: 'var(--bg-secondary)', 
                          border: `1px solid ${formData.reason ? activeDivision.color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '6px', padding: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
                          boxShadow: formData.reason ? `0 0 15px ${activeDivision.color}20` : 'none',
                          outline: 'none', transition: 'all 0.3s ease'
                        }}
                        placeholder="İlginizi, yeteneklerinizi ve sizi neden seçmemiz gerektiğini açıklayın..."
                        onFocus={(e) => { e.currentTarget.style.borderColor = activeDivision.color; e.currentTarget.style.boxShadow = `0 0 20px ${activeDivision.color}40`; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
                        onBlur={(e) => { if(!formData.reason) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; } }}
                      ></textarea>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: activeDivision.color, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Departman İçi Tecrübeleriniz
                      </label>
                      <textarea 
                        name="experience" required value={formData.experience} onChange={handleChange}
                        style={{ 
                          width: '100%', minHeight: '120px', resize: 'vertical', backgroundColor: 'var(--bg-secondary)', 
                          border: `1px solid ${formData.experience ? activeDivision.color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '6px', padding: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
                          boxShadow: formData.experience ? `0 0 15px ${activeDivision.color}20` : 'none',
                          outline: 'none', transition: 'all 0.3s ease'
                        }}
                        placeholder="Rütbeniz, aldığınız eğitimler ve katıldığınız operasyonlar..."
                        onFocus={(e) => { e.currentTarget.style.borderColor = activeDivision.color; e.currentTarget.style.boxShadow = `0 0 20px ${activeDivision.color}40`; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
                        onBlur={(e) => { if(!formData.experience) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; } }}
                      ></textarea>
                    </div>

                    <div 
                     
                      style={{ backgroundColor: `${activeDivision.color}15`, border: `1px solid ${activeDivision.color}30`, padding: '1.25rem', borderRadius: '6px', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: `inset 0 0 10px ${activeDivision.color}10` }}
                    >
                      <i className="fa-solid fa-shield-halved" style={{ color: activeDivision.color, marginTop: '0.2rem', fontSize: '1.2rem', textShadow: activeDivision.glow }}></i>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                        Başvurunuz komuta kademesi tarafından detaylı olarak incelenecektir. Sabıka kaydınız ve mesai saatleriniz değerlendirmede önemli bir rol oynar.
                      </p>
                    </div>

                    <button 
                      type="submit" disabled={submitting}
                      whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.98 } : {}}
                      style={{ 
                        backgroundColor: activeDivision.color, color: '#000', fontWeight: 800, letterSpacing: '0.1em',
                        padding: '1.2rem', borderRadius: '6px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
                        boxShadow: `0 8px 25px ${activeDivision.color}50`, transition: 'all 0.2s', fontSize: '1rem'
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
      </>

      {/* BAŞVURULAR LİSTESİ */}
      {user && (
        <div style={{ marginTop: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user.role === 'admin' ? (
                <><i className="fa-solid fa-user-shield" style={{ color: "var(--accent-primary)" }}></i> GELEN BİRİM BAŞVURULARI (YÖNETİCİ ONAY PANELİ)</>
              ) : (
                <><i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--accent-primary)" }}></i> GEÇMİŞ BAŞVURULARIM</>
              )}
            </h2>
            {user.role === 'admin' && (
              <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.4)', fontWeight: 700 }}>
                <i className="fa-solid fa-check-double" style={{ marginRight: '0.4rem' }}></i> Toplam {applications.length} Başvuru Listeleniyor
              </span>
            )}
          </div>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {applications.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Sistemde henüz bir başvuru bulunmuyor.</p>
              </div>
            ) : (
              applications.map((app: any, idx: number) => {
                const divisionInfo = divisions.find(d => d.id === app.division) || divisions[0];
                const isAdminView = user.role === 'admin';
                return (
                  <div 
                   
                    key={app.id} 
                    style={{ 
                      backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '8px', border: isAdminView && app.status === 'Bekliyor' ? `1px solid rgba(245, 158, 11, 0.4)` : `1px solid rgba(255,255,255,0.05)`, padding: '1.5rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: divisionInfo.color, boxShadow: divisionInfo.glow }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isAdminView ? '1.25rem' : '1.5rem', paddingLeft: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '6px', backgroundColor: `${divisionInfo.color}15`, color: divisionInfo.color, border: `1px solid ${divisionInfo.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: divisionInfo.glow, flexShrink: 0 }}>
                          <i className={`fa-solid ${divisionInfo.icon}`}></i>
                        </div>
                        <div>
                          {isAdminView && app.officer && (
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.2rem', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em' }}>
                              #{app.officer.badge || '0000'} — {app.officer.name || 'Bilinmiyor'} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: '0.4rem' }}>({app.officer.rank || 'Memur'})</span>
                            </div>
                          )}
                          <div style={{ fontSize: isAdminView ? '0.9rem' : '1.2rem', color: divisionInfo.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {divisionInfo.name}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          padding: '0.45rem 1.1rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                          backgroundColor: app.status === 'Onaylandı' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'Reddedildi' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245,158,11,0.15)',
                          color: app.status === 'Onaylandı' ? '#10b981' : app.status === 'Reddedildi' ? '#f87171' : '#f59e0b',
                          border: `1px solid ${app.status === 'Onaylandı' ? 'rgba(16, 185, 129, 0.3)' : app.status === 'Reddedildi' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245,158,11,0.3)'}`,
                          boxShadow: `0 0 15px ${app.status === 'Onaylandı' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'Reddedildi' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245,158,11,0.2)'}`
                        }}>
                          {app.status === 'Onaylandı' && <i className="fa-solid fa-check" style={{ marginRight: '0.4rem' }}></i>}
                          {app.status === 'Reddedildi' && <i className="fa-solid fa-xmark" style={{ marginRight: '0.4rem' }}></i>}
                          {app.status === 'Bekliyor' && <i className="fa-solid fa-hourglass-half" style={{ marginRight: '0.4rem' }}></i>}
                          {app.status}
                        </span>

                        {isAdminView && (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(app.id, 'Onaylandı')}
                              title="Başvuruyu Onayla"
                              style={{ 
                                padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)',
                                backgroundColor: app.status === 'Onaylandı' ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
                                color: app.status === 'Onaylandı' ? '#000' : '#10b981', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.35rem'
                              }}
                            >
                              <i className="fa-solid fa-check"></i> ONAYLA
                            </button>
                            <button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(app.id, 'Reddedildi')}
                              title="Başvuruyu Reddet"
                              style={{ 
                                padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)',
                                backgroundColor: app.status === 'Reddedildi' ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                                color: app.status === 'Reddedildi' ? '#fff' : '#f87171', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.35rem'
                              }}
                            >
                              <i className="fa-solid fa-xmark"></i> REDDET
                            </button>
                            {app.status !== 'Bekliyor' && (
                              <button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdateStatus(app.id, 'Bekliyor')}
                                title="Beklemeye Al (Sıfırla)"
                                style={{ 
                                  padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.4)',
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                                }}
                              >
                                <i className="fa-solid fa-rotate-left"></i>
                              </button>
                            )}
                            <button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(app.id)}
                              title="Başvuruyu Kalıcı Olarak Sil"
                              style={{ 
                                padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)',
                                backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isAdminView && (app.reason || app.experience) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.35)', padding: '1.25rem', borderRadius: '6px', borderLeft: `2px solid ${divisionInfo.color}60`, marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {app.reason && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: divisionInfo.color, fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              <i className="fa-solid fa-circle-question" style={{ marginRight: '0.4rem' }}></i> Katılım Gerekçesi (Neden Katılmak İstiyor?)
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {app.reason}
                            </p>
                          </div>
                        )}
                        {app.experience && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: divisionInfo.color, fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              <i className="fa-solid fa-briefcase" style={{ marginRight: '0.4rem' }}></i> Özgeçmiş & Saha Tecrübesi
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {app.experience}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right', fontWeight: 600, letterSpacing: '0.05em' }}>
                      <i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i> {new Date(app.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
