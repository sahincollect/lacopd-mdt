'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Initialize states
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
    
    // Optimistic UI Update
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
      console.error(e);
      // Revert if error
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
        setImgMessage({ type: 'success', text: urlToSave ? 'Profil fotoğrafı başarıyla güncellendi.' : 'Profil fotoğrafı kaldırıldı.' });
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 64, height: 64, border: '3px solid rgba(14, 165, 233, 0.1)', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
        <span style={{ color: '#0ea5e9', fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>Veriler Şifreleniyor...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#0ea5e9', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px #0ea5e9)' }} />
        <h2 style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em', color: '#fff' }}>KİMLİK DOĞRULAMA HATASI</h2>
        <p>Kullanıcı verisi okunamadı. Lütfen tekrar giriş yapın.</p>
      </div>
    );
  }

  const rankIndex = leaderboard.findIndex((e) => e.id === user.id);
  const userRank = rankIndex >= 0 ? rankIndex + 1 : '—';
  const reportCount = reports.filter((r) => r.officer?.badge === user.badge).length;

  const primaryColor = isOnDuty ? '#10b981' : '#0284c7';
  const neonShadow = `0 0 20px ${primaryColor}40`;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1rem' }}>
      
      {/* BACKGROUND EXPERIMENTAL GRID */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.03) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.03) 0%, transparent 40%)', pointerEvents: 'none', zIndex: -1 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 380px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* ================= LEFT COLUMN: HOLOGRAPHIC ID CARD ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'relative' }}
          >
            {/* Holographic Glowing Frame */}
            <div style={{ position: 'absolute', inset: '-2px', background: `linear-gradient(135deg, ${primaryColor}, transparent 40%, transparent 60%, ${primaryColor})`, borderRadius: '24px', zIndex: 0, filter: 'blur(8px)', opacity: 0.7, animation: 'pulse-blip 4s infinite' }}></div>
            
            {/* ID CARD MAIN BODY */}
            <div style={{ 
              position: 'relative', zIndex: 1, backgroundColor: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(20px)',
              borderRadius: '22px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden',
              boxShadow: `inset 0 0 30px ${primaryColor}10, 0 20px 40px rgba(0,0,0,0.5)`
            }}>
              
              {/* Scanning Laser Line */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`, boxShadow: `0 0 10px ${primaryColor}`, zIndex: 10, opacity: 0.6 }}
              />

              {/* ID Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <img src="/lapd-logo.jpg" alt="LAPD" style={{ width: '50px', height: '50px', borderRadius: '50%', boxShadow: '0 0 15px rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', letterSpacing: '0.1em', lineHeight: 1 }}>LAPD</div>
                  <div style={{ color: primaryColor, fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700 }}>IDENTIFICATION</div>
                </div>
              </div>

              {/* ID Content */}
              <div style={{ padding: '2rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {/* Premium Rounded Square for Photo */}
                  <div 
                    onClick={handlePhotoClick}
                    style={{ 
                    width: '110px', height: '110px', borderRadius: '18px',
                    backgroundColor: 'rgba(255,255,255,0.05)', border: `2px solid ${primaryColor}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    boxShadow: `0 0 25px ${primaryColor}20`, cursor: 'pointer', position: 'relative'
                  }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src="/lapd-logo.jpg" alt="LAPD Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'grayscale(100%)' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                      <i className="fa-solid fa-camera" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                    </div>
                  </div>
                  {/* Duty Status Blip - Moved to top right of the image frame */}
                  <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', backgroundColor: primaryColor, borderRadius: '50%', border: '4px solid #0a0f1e', boxShadow: `0 0 10px ${primaryColor}` }}></div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.15em', fontWeight: 800 }}>OPERATOR</div>
                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em', lineHeight: 1.1 }}>{user.name.toUpperCase()}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.15em', fontWeight: 800 }}>RANK</div>
                      <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>{user.rank.toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.15em', fontWeight: 800 }}>BADGE</div>
                      <div style={{ fontSize: '1.1rem', color: primaryColor, fontWeight: 800, fontFamily: 'monospace' }}>#{user.badge}</div>
                    </div>
                  </div>
                  {user.specialRoles && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <div style={{ fontSize: '0.62rem', color: '#38bdf8', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.3rem' }}>SPECIAL UNIT ROLES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.specialRoles.split(',').filter(Boolean).map((sr: string, idx: number) => (
                          <span key={idx} style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                            backgroundColor: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)',
                            padding: '2px 7px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            <i className="fa-solid fa-medal" style={{ fontSize: '0.58rem', color: '#38bdf8' }}></i> {sr.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Footer Barcode */}
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ 
                   width: '100%', height: '30px', 
                   background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.8) 2px, transparent 2px, transparent 4px, rgba(255,255,255,0.8) 4px, rgba(255,255,255,0.8) 5px, transparent 5px, transparent 8px, rgba(255,255,255,0.8) 8px, rgba(255,255,255,0.8) 12px, transparent 12px, transparent 14px)',
                   opacity: 0.3, maskImage: 'linear-gradient(to bottom, black, transparent)'
                 }}></div>
              </div>
            </div>
          </motion.div>

          {/* EXPERIMENTAL DUTY BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${primaryColor}60` }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleDuty}
            disabled={dutyLoading}
            style={{
              position: 'relative', width: '100%', padding: '1.5rem', borderRadius: '20px',
              border: `1px solid ${primaryColor}50`, overflow: 'hidden',
              backgroundColor: isOnDuty ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.1)',
              cursor: dutyLoading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              backdropFilter: 'blur(10px)', transition: 'all 0.3s', opacity: dutyLoading ? 0.7 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
              <i className={`fa-solid ${isOnDuty ? 'fa-satellite-dish' : 'fa-power-off'}`} style={{ fontSize: '1.5rem', color: primaryColor, animation: isOnDuty ? 'pulse-icon 2s infinite' : 'none' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Oswald', sans-serif", color: '#fff', letterSpacing: '0.1em' }}>
                {isOnDuty ? 'SİSTEM AKTİF - MESAİDE' : 'MESAİYE BAŞLA'}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: primaryColor, letterSpacing: '0.2em', zIndex: 1 }}>
               {isOnDuty ? 'VERİLER KAYDEDİLİYOR...' : 'SİSTEM BAĞLANTISI BEKLENİYOR'}
            </span>
          </motion.button>
        </div>

        {/* ================= RIGHT COLUMN: EXPERIMENTAL PANELS ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          {/* PERFORMANCE HUD */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ gridColumn: '1 / -1', backgroundColor: 'rgba(10, 15, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}`, borderTopLeftRadius: '24px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-chart-radar" style={{ color: primaryColor }}></i>
                PERFORMANS METRİKLERİ
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                { label: 'TOPLAM SÜRE', value: formatTime(liveSeconds), sub: 'Mesai saati' },
                { label: 'BİRİM SIRASI', value: `#${userRank}`, sub: 'Liderlik Tablosu' },
                { label: 'RAPORLAR', value: String(reportCount), sub: 'Onaylanan evrak' }
              ].map((stat, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${primaryColor}50`, paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.2rem' }}>{stat.label}</div>
                  <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, fontFamily: "'Oswald', sans-serif", lineHeight: 1, textShadow: `0 0 20px ${primaryColor}40` }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', color: primaryColor, marginTop: '0.4rem', opacity: 0.8 }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* QUICK TERMINALS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ backgroundColor: 'rgba(10, 15, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fa-solid fa-terminal" style={{ color: '#0369a1' }}></i> HIZLI ERİŞİM
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { href: '/raporlar-app/index.html', icon: 'fa-file-signature', label: 'Rapor Yaz', color: '#0284c7', targetBlank: true },
                { href: '/mdt/kriminal', icon: 'fa-fingerprint', label: 'Suçlular', color: '#0ea5e9' },
                { href: '/mdt/mesai', icon: 'fa-clock', label: 'Mesailer', color: '#10b981' },
                { href: '/mdt/duyurular', icon: 'fa-bullhorn', label: 'Duyurular', color: '#f59e0b' },
              ].map((btn, i) => (
                btn.targetBlank ? (
                  <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ scale: 1.05, backgroundColor: `${btn.color}20`, borderColor: `${btn.color}50` }} style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }}>
                      <i className={`fa-solid ${btn.icon}`} style={{ fontSize: '1.5rem', color: btn.color }} />
                      <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{btn.label}</span>
                    </motion.div>
                  </a>
                ) : (
                  <Link key={i} href={btn.href} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ scale: 1.05, backgroundColor: `${btn.color}20`, borderColor: `${btn.color}50` }} style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }}>
                      <i className={`fa-solid ${btn.icon}`} style={{ fontSize: '1.5rem', color: btn.color }} />
                      <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{btn.label}</span>
                    </motion.div>
                  </Link>
                )
              ))}
            </div>
          </motion.div>

          {/* SYSTEM STATUS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ backgroundColor: 'rgba(10, 15, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fa-solid fa-network-wired" style={{ color: '#10b981' }}></i> SİSTEM DURUMU
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.1em' }}>AĞ GÜVENLİĞİ</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '20px' }}>AKTİF & GÜVENLİ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.1em' }}>ERİŞİM YETKİSİ</span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>{user.role === 'admin' ? 'KÖK (ROOT)' : 'STANDART'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.1em' }}>MDT VERSİYON</span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, fontFamily: 'monospace' }}>v3.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.1em' }}>KAYIT TARİHİ</span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </motion.div>

          {/* CONFIGURATION (PASSWORD & IMAGE) */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ gridColumn: '1 / -1', backgroundColor: 'rgba(10, 15, 30, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ margin: '0 0 2rem 0', color: '#fff', fontSize: '1.2rem', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fa-solid fa-sliders" style={{ color: '#f43f5e' }}></i> KONFİGÜRASYON
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              {/* Şifre */}
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '1rem' }}>GÜVENLİK ANAHTARI DEĞİŞİMİ</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="password" placeholder="Mevcut Şifre" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="password" placeholder="Yeni Şifre" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                    <input type="password" placeholder="Yeni Şifre (Tekrar)" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                  </div>
                  <button onClick={changePassword} disabled={pwLoading} style={{ width: '100%', padding: '1rem', backgroundColor: '#f43f5e', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
                    {pwLoading ? 'İŞLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                  </button>
                  {pwMessage && <div style={{ fontSize: '0.8rem', color: pwMessage.type === 'success' ? '#10b981' : '#0ea5e9' }}>{pwMessage.text}</div>}
                </div>
              </div>

              {/* Fotoğraf */}
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '1rem' }}>BİYOMETRİK VERİ (FOTOĞRAF) GÜNCELLEMESİ</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                    Profil fotoğrafınızı değiştirmek için kimlik kartınızdaki fotoğrafınızın üzerine tıklayın. Mevcut fotoğrafınızı kaldırmak isterseniz aşağıdaki butonu kullanabilirsiniz.
                  </p>
                  <button onClick={removePhoto} disabled={imgLoading} style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.4)', color: '#38bdf8', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)'}>
                    {imgLoading ? 'İŞLENİYOR...' : 'FOTOĞRAFI KALDIR'}
                  </button>
                  {imgMessage && <div style={{ fontSize: '0.8rem', color: imgMessage.type === 'success' ? '#10b981' : '#0ea5e9' }}>{imgMessage.text}</div>}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
