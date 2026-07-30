"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface User {
  id: string;
  name: string;
  badge: string;
  department: string;
  rank: string;
  role: string;
  specialRoles?: string;
  isOnDuty: boolean;
  profileImage?: string;
  createdAt: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  badge: string;
  totalSeconds: number;
  rank?: number;
}

interface Report {
  id: string;
  officer?: {
    badge: string;
  };
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ProfilPage() {
  const [dutyLoading, setDutyLoading] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);

  // Şifre değiştirme state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profil Fotoğrafı state
  const [imgUrl, setImgUrl] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgMessage, setImgMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Canlı Mesai Süresi
  const [liveSeconds, setLiveSeconds] = useState(0);

  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);
  const { data: shiftsData, mutate: mutateShifts } = useSWR('/api/shifts', fetcher);
  const { data: reportsData } = useSWR('/api/reports', fetcher);

  const loading = !meData || !shiftsData || !reportsData;
  const user: User | null = meData?.user || null;
  const leaderboard: LeaderboardEntry[] = useMemo(() => shiftsData?.leaderboard || [], [shiftsData]);
  const reports: Report[] = reportsData?.reports || [];

  useEffect(() => {
    if (user) {
      setIsOnDuty(user.isOnDuty);
      if (user.profileImage) setImgUrl(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    if (user && leaderboard.length > 0) {
      const myEntry = leaderboard.find(e => e.id === user.id);
      setLiveSeconds(myEntry?.totalSeconds ?? 0);
    }
  }, [user, leaderboard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnDuty) {
      interval = setInterval(() => {
        setLiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnDuty]);

  const toggleDuty = async () => {
    if (!user) return;
    
    const newIsOnDuty = !isOnDuty;
    setIsOnDuty(newIsOnDuty);
    setDutyLoading(true);

    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnDuty: newIsOnDuty }),
      });
      if (!res.ok) throw new Error();
      mutateMe();
      mutateShifts();
    } catch (e) {
      setIsOnDuty(!newIsOnDuty);
    } finally {
      setDutyLoading(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Tüm alanları doldurun.' });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }
    setPwLoading(true);
    setPwMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
        setPwForm({ current: '', newPw: '', confirm: '' });
      } else {
        setPwMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setPwLoading(false);
    }
  };

  const updateProfileImage = async (urlToSave: string) => {
    if (!user) return;
    setImgLoading(true);
    setImgMessage(null);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: urlToSave }),
      });
      const data = await res.json();
      if (res.ok) {
        setImgMessage({ type: 'success', text: urlToSave ? 'Profil fotoğrafı güncellendi.' : 'Profil fotoğrafı kaldırıldı.' });
        mutateMe();
      } else {
        setImgMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
      }
    } catch {
      setImgMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setImgLoading(false);
    }
  };

  const handleUpdateUrl = () => {
    updateProfileImage(imgUrl);
  };

  const removePhoto = () => {
    if (window.confirm("Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?")) {
      setImgUrl("");
      updateProfileImage("");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
        <div style={{ height: 150, borderRadius: 12, background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', opacity: 0.5 }} className="pulse-anim" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ height: 300, borderRadius: 12, background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', opacity: 0.5 }} className="pulse-anim" />
          <div style={{ height: 300, borderRadius: 12, background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', opacity: 0.5 }} className="pulse-anim" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '1.5rem', color: 'var(--mdt-text-muted)', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', color: 'var(--mdt-danger)' }} />
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--mdt-text-primary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>KİMLİK DOĞRULAMA HATASI</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--mdt-text-secondary)' }}>Kullanıcı verisi okunamadı. Lütfen tekrar giriş yapın.</div>
        </div>
      </div>
    );
  }

  const rankIndex = leaderboard.findIndex((e) => e.id === user.id);
  const userRank = rankIndex >= 0 ? rankIndex + 1 : '—';
  const reportCount = reports.filter((r) => r.officer?.badge === user.badge).length;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem 1rem", background: 'var(--mdt-bg-main)', border: "1px solid var(--mdt-border)",
    borderRadius: '6px', color: 'var(--mdt-text-primary)', fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s"
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--mdt-border)", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · YÖNETİM
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>AUTHORIZED ONLY</span>
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--mdt-text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Personel Profili
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Kimlik Kartı ve Sistem Konfigürasyonu
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(300px, 350px)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* ================= LEFT COLUMN: HERO & STATS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* HERO CARD */}
          <div style={{ 
            background: 'var(--mdt-card-bg)',
            border: '1px solid var(--mdt-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, var(--mdt-accent-alpha), transparent)', opacity: 0.2 }} />
            
            <div style={{ padding: '2.5rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              
              <div style={{ 
                width: 100, height: 100, borderRadius: '50%', background: 'var(--mdt-bg-main)', border: '2px solid var(--mdt-accent)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1.25rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fa-solid fa-user-tie" style={{ fontSize: '3rem', color: 'var(--mdt-text-muted)' }}></i>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: isOnDuty ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isOnDuty ? 'var(--mdt-success)' : 'var(--mdt-danger)',
                  border: `1px solid ${isOnDuty ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                }}>
                  {isOnDuty ? 'MESAİDE' : 'MESAİ DIŞI'}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(29,110,247,0.1)', color: 'var(--mdt-accent)', border: '1px solid rgba(29,110,247,0.3)' }}>
                  #{user.badge}
                </span>
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--mdt-text-primary)', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>{user.name}</h2>
              <div style={{ fontSize: '0.95rem', color: 'var(--mdt-text-secondary)', fontWeight: 600 }}>{user.rank} • {user.department || 'L.A.C.P.D.'}</div>

              {user.specialRoles && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                  {user.specialRoles.split(',').filter(Boolean).map((sr: string, idx: number) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem', fontWeight: 700, color: 'var(--mdt-text-primary)',
                      backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)',
                      padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.05em'
                    }}>
                      {sr.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', borderTop: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>
              <div style={{ flex: 1, padding: '1.25rem', textAlign: 'center', borderRight: '1px solid var(--mdt-border)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.35rem' }}>TOPLAM MESAİ</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--mdt-text-primary)', fontFamily: 'monospace' }}>{formatTime(liveSeconds)}</div>
              </div>
              <div style={{ flex: 1, padding: '1.25rem', textAlign: 'center', borderRight: '1px solid var(--mdt-border)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.35rem' }}>RAPOR SAYISI</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--mdt-text-primary)' }}>{reportCount}</div>
              </div>
              <div style={{ flex: 1, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.35rem' }}>LİDERBOARD</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--mdt-accent)' }}>#{userRank}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <i className="fa-solid fa-power-off" style={{ color: 'var(--mdt-accent)', fontSize: '0.8rem', opacity: 0.8 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>MESAİ KONTROLÜ</span>
            <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
          </div>

          <button
            onClick={toggleDuty}
            disabled={dutyLoading}
            style={{
              width: '100%', padding: '1.25rem', borderRadius: '10px',
              border: isOnDuty ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)',
              backgroundColor: isOnDuty ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              cursor: dutyLoading ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
              transition: 'all 0.15s', opacity: dutyLoading ? 0.7 : 1,
              boxShadow: isOnDuty ? '0 0 20px rgba(34,197,94,0.1)' : 'none'
            }}
            onMouseOver={e => !dutyLoading && ((e.currentTarget as HTMLElement).style.background = isOnDuty ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)')}
            onMouseOut={e => !dutyLoading && ((e.currentTarget as HTMLElement).style.background = isOnDuty ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)')}
          >
            <i className={`fa-solid ${isOnDuty ? 'fa-satellite-dish' : 'fa-power-off'}`} style={{ fontSize: '1.35rem', color: isOnDuty ? 'var(--mdt-success)' : 'var(--mdt-danger)' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.05em', color: isOnDuty ? 'var(--mdt-success)' : 'var(--mdt-danger)' }}>
              {isOnDuty ? 'MESAİDEN ÇIK' : 'MESAİYE BAŞLA'}
            </span>
          </button>
        </div>

        {/* ================= RIGHT COLUMN: FORMS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ 
            background: 'var(--mdt-card-bg)',
            border: '1px solid var(--mdt-border)',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--mdt-text-primary)', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-image" style={{ color: 'var(--mdt-accent)', fontSize: '0.9rem' }}></i>
              </div>
              Profil Fotoğrafı
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem' }}>
                  FOTOĞRAF URL (IMGUR/DİSCORD VB.)
                </label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={imgUrl} 
                  onChange={e => setImgUrl(e.target.value)} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleUpdateUrl} 
                  disabled={imgLoading} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: '6px', border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: imgLoading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: imgLoading ? 0.7 : 1 }}
                  onMouseOver={e => !imgLoading && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                  onMouseOut={e => !imgLoading && ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  {imgLoading ? 'KAYDEDİLİYOR...' : 'GÜNCELLE'}
                </button>
                <button 
                  onClick={removePhoto} 
                  disabled={imgLoading || !user.profileImage} 
                  style={{ padding: '0.7rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: 'var(--mdt-danger)', fontSize: '0.8rem', fontWeight: 800, cursor: (imgLoading || !user.profileImage) ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: (!user.profileImage) ? 0.5 : 1 }}
                  onMouseOver={e => { if (!imgLoading && user.profileImage) { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; } }}
                  onMouseOut={e => { if (!imgLoading && user.profileImage) { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; } }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              {imgMessage && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.6rem 0.85rem', borderRadius: '6px', backgroundColor: imgMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239, 68, 68, 0.1)', color: imgMessage.type === 'success' ? 'var(--mdt-success)' : 'var(--mdt-danger)', border: `1px solid ${imgMessage.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`fa-solid ${imgMessage.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
                  {imgMessage.text}
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            background: 'var(--mdt-card-bg)',
            border: '1px solid var(--mdt-border)',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--mdt-text-primary)', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-lock" style={{ color: 'var(--mdt-warning)', fontSize: '0.9rem' }}></i>
              </div>
              Güvenlik Anahtarı
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem' }}>
                  MEVCUT ŞİFRE
                </label>
                <input 
                  type="password" 
                  value={pwForm.current} 
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-warning)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem' }}>
                  YENİ ŞİFRE
                </label>
                <input 
                  type="password" 
                  value={pwForm.newPw} 
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-warning)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem' }}>
                  YENİ ŞİFRE (TEKRAR)
                </label>
                <input 
                  type="password" 
                  value={pwForm.confirm} 
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-warning)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              
              {pwMessage && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.6rem 0.85rem', borderRadius: '6px', backgroundColor: pwMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239, 68, 68, 0.1)', color: pwMessage.type === 'success' ? 'var(--mdt-success)' : 'var(--mdt-danger)', border: `1px solid ${pwMessage.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`fa-solid ${pwMessage.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
                  {pwMessage.text}
                </div>
              )}

              <div style={{ marginTop: '0.25rem' }}>
                <button 
                  onClick={changePassword} 
                  disabled={pwLoading} 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.35rem', borderRadius: '6px', border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: pwLoading ? 'not-allowed' : 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseOver={e => !pwLoading && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-warning)', (e.currentTarget as HTMLElement).style.color = 'var(--mdt-warning)')}
                  onMouseOut={e => !pwLoading && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)', (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)')}
                >
                  {pwLoading ? 'İŞLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
