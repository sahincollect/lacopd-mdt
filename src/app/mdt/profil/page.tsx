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

  const handlePhotoClick = () => {
    const newUrl = window.prompt("Yeni profil fotoğrafınızın URL'sini girin (Imgur/Discord vs.):", imgUrl || "");
    if (newUrl !== null) {
      setImgUrl(newUrl);
      updateProfileImage(newUrl);
    }
  };

  const removePhoto = () => {
    if (window.confirm("Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?")) {
      setImgUrl("");
      updateProfileImage("");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem' }}></i>
        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>VERİLER YÜKLENİYOR...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--color-danger)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>KİMLİK DOĞRULAMA HATASI</h2>
        <p style={{ margin: 0 }}>Kullanıcı verisi okunamadı. Lütfen tekrar giriş yapın.</p>
      </div>
    );
  }

  const rankIndex = leaderboard.findIndex((e) => e.id === user.id);
  const userRank = rankIndex >= 0 ? rankIndex + 1 : '—';
  const reportCount = reports.filter((r) => r.officer?.badge === user.badge).length;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem", background: 'var(--bg-tertiary)', border: "1px solid var(--border-light)",
    borderRadius: '4px', color: 'var(--text-primary)', fontSize: "0.95rem", outline: "none", boxSizing: "border-box"
  };

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--lapd-blue-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            PERSONEL PROFİLİ
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Kimlik Kartı ve Sistem Konfigürasyonu
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* ================= LEFT COLUMN: ID & DUTY ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          
          {/* ID CARD */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--bg-tertiary)' }}>
              <img src="/lapd-logo.png" alt="LAC" style={{ width: '50px', height: '50px' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--lapd-blue-dark)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em' }}>L.A.C.P.D.</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800 }}>KİMLİK KARTI</div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={handlePhotoClick}
                  style={{ 
                    width: '110px', height: '110px', borderRadius: '4px',
                    backgroundColor: 'var(--bg-tertiary)', border: `1px solid var(--border-light)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    cursor: 'pointer', position: 'relative'
                  }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src="/lapd-logo.png" alt="LAC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'grayscale(100%)' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                    <i className="fa-solid fa-camera" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', backgroundColor: isOnDuty ? 'var(--color-success)' : 'var(--text-muted)', borderRadius: '50%', border: '4px solid var(--bg-secondary)' }}></div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>PERSONEL ADI</div>
                  <div style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>{user.name}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>RÜTBE</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 800 }}>{user.rank.toUpperCase()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>ROZET</div>
                    <div style={{ fontSize: '1rem', color: 'var(--lapd-blue-dark)', fontWeight: 900, fontFamily: 'monospace' }}>#{user.badge}</div>
                  </div>
                </div>
                {user.specialRoles && (
                  <div style={{ marginTop: '0.2rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--lapd-blue-dark)', fontWeight: 900, marginBottom: '0.4rem' }}>ÖZEL ROLLER</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {user.specialRoles.split(',').filter(Boolean).map((sr: string, idx: number) => (
                        <span key={idx} style={{
                          fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                          padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center'
                        }}>
                          {sr.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* ID Footer Line */}
            <div style={{ height: '4px', backgroundColor: 'var(--lapd-blue-dark)' }}></div>
          </div>

          {/* DUTY BUTTON */}
          <button
            onClick={toggleDuty}
            disabled={dutyLoading}
            style={{
              width: '100%', padding: '1.5rem', borderRadius: '8px',
              border: isOnDuty ? '2px solid var(--color-success)' : '1px solid var(--border-light)',
              backgroundColor: isOnDuty ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
              cursor: dutyLoading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', opacity: dutyLoading ? 0.7 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i className={`fa-solid ${isOnDuty ? 'fa-satellite-dish' : 'fa-power-off'}`} style={{ fontSize: '1.5rem', color: isOnDuty ? 'var(--color-success)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isOnDuty ? 'var(--color-success)' : 'var(--text-primary)' }}>
                {isOnDuty ? 'MESAİDE (AKTİF)' : 'MESAİYE BAŞLA'}
              </span>
            </div>
          </button>
        </div>

        {/* ================= RIGHT COLUMN: PANELS ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* PERFORMANCE */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fa-solid fa-chart-line"></i>
              PERFORMANS METRİKLERİ
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: 'TOPLAM SÜRE', value: formatTime(liveSeconds), icon: 'fa-clock' },
                { label: 'BİRİM SIRASI', value: `#${userRank}`, icon: 'fa-ranking-star' },
                { label: 'RAPORLAR', value: String(reportCount), icon: 'fa-file-signature' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
                  <i className={`fa-solid ${stat.icon}`} style={{ fontSize: '1.5rem', color: 'var(--lapd-blue-dark)', marginBottom: '0.5rem' }}></i>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 900 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fa-solid fa-bolt"></i> HIZLI ERİŞİM
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {[
                { href: '/raporlar-app/index.html', icon: 'fa-pen-to-square', label: 'Rapor Yaz', targetBlank: true },
                { href: '/mdt/kriminal', icon: 'fa-fingerprint', label: 'Suçlular' },
                { href: '/mdt/mesai', icon: 'fa-business-time', label: 'Mesailer' },
                { href: '/mdt/duyurular', icon: 'fa-bullhorn', label: 'Duyurular' },
              ].map((btn, i) => {
                const inner = (
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.15s', cursor: 'pointer' }}>
                    <i className={`fa-solid ${btn.icon}`} style={{ fontSize: '1.5rem', color: 'var(--lapd-blue-dark)' }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}>{btn.label}</span>
                  </div>
                );
                return btn.targetBlank ? (
                  <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
                ) : (
                  <Link key={i} href={btn.href} style={{ textDecoration: 'none' }}>{inner}</Link>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* SYSTEM STATUS */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-network-wired"></i> SİSTEM DURUMU
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>AĞ GÜVENLİĞİ</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 900, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>AKTİF & GÜVENLİ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>ERİŞİM YETKİSİ</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>{user.role === 'admin' ? 'YÖNETİCİ (ADMIN)' : 'STANDART'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>MDT VERSİYON</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace' }}>v3.1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>KAYIT TARİHİ</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* PASSWORD CONFIG */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-key"></i> GÜVENLİK ANAHTARI
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="password" placeholder="Mevcut Şifre" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="password" placeholder="Yeni Şifre" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} style={inputStyle} />
                  <input type="password" placeholder="Yeni Şifre (Tekrar)" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
                </div>
                
                {pwMessage && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem', borderRadius: '4px', backgroundColor: pwMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: pwMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {pwMessage.text}
                  </div>
                )}

                <button onClick={changePassword} disabled={pwLoading} style={{ padding: '0.85rem', backgroundColor: 'var(--lapd-blue-dark)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', marginTop: '0.5rem' }}>
                  {pwLoading ? 'İŞLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                </button>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>FOTOĞRAF KONTROLÜ</h4>
                <button onClick={removePhoto} disabled={imgLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '4px', fontWeight: 800, cursor: 'pointer' }}>
                  {imgLoading ? 'İŞLENİYOR...' : 'FOTOĞRAFI KALDIR'}
                </button>
                {imgMessage && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem', borderRadius: '4px', marginTop: '1rem', backgroundColor: imgMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: imgMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {imgMessage.text}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
