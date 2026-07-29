"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function MDTDashboard() {
  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);
  const { data: officersData, mutate: mutateOfficers } = useSWR('/api/officers', fetcher);
  const { data: reportsData } = useSWR('/api/reports', fetcher);
  
  const loading = !officersData || !reportsData || !meData;
  const user = meData?.user || null;
  const officers = officersData?.officers || [];
  const reports = (reportsData?.reports || []).slice(0, 4);

  const [toggling, setToggling] = useState(false);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa önce`;
    return `${Math.floor(hrs / 24)} gün önce`;
  };

  const onDutyCount = officers.filter((o: any) => o.isOnDuty).length;

  const toggleDuty = useCallback(async () => {
    if (!user || toggling) return;
    
    const newIsOnDuty = !user.isOnDuty;
    const optimisticUser = { ...user, isOnDuty: newIsOnDuty };
    mutateMe({ user: optimisticUser }, false);
    
    if (officersData?.officers) {
      const optimisticOfficers = officersData.officers.map((o: any) => 
        o.id === user.id ? { ...o, isOnDuty: newIsOnDuty } : o
      );
      mutateOfficers({ officers: optimisticOfficers }, false);
    }

    setToggling(true);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnDuty: newIsOnDuty })
      });
      if (res.ok) {
        toast.success(newIsOnDuty ? "Devriye başlatıldı." : "Devriye sonlandırıldı.", {
          style: { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-light)" },
          id: 'duty-toast'
        });
        mutateMe();
        mutateOfficers();
      } else {
        throw new Error();
      }
    } catch {
      mutateMe({ user }, false);
      mutateOfficers(officersData, false);
      toast.error("Görev durumu güncellenemedi.");
    } finally {
      setToggling(false);
    }
  }, [user, toggling, mutateMe, mutateOfficers, officersData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem", fontFamily: "var(--font-inter)" }}>

      {/* ── HERO TITLE SECTION ── */}
      <section style={{ position: 'relative' }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
          Sisteme Hoş Geldiniz, {user?.name || 'Memur'}
        </p>
        <h1 style={{ 
          fontFamily: 'var(--font-inter)', 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          color: 'var(--lapd-blue-dark)', 
          margin: 0,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase'
        }}>
          GÜNLÜK ÖZET
        </h1>
      </section>

      {/* ── QUICKLINKS (HIZLI BAĞLANTILAR) ── */}
      <section>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          HIZLI İŞLEMLER
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid var(--lapd-border)', backgroundColor: 'var(--bg-secondary)' }}>
          
          {/* Duty Toggle as a QuickLink Box */}
          <div 
            onClick={toggleDuty}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem 1rem', borderRight: '1px solid var(--lapd-border)',
              textAlign: 'center', cursor: toggling || !user ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
              backgroundColor: user?.isOnDuty ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => { if(!toggling && user) e.currentTarget.style.backgroundColor = user?.isOnDuty ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)'; }}
            onMouseOut={e => { if(!toggling && user) e.currentTarget.style.backgroundColor = user?.isOnDuty ? 'rgba(16, 185, 129, 0.1)' : 'transparent'; }}
          >
            {user?.isOnDuty && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--color-success)' }} />
            )}
            <i className="fa-solid fa-clock" style={{ fontSize: '1.8rem', color: user?.isOnDuty ? 'var(--color-success)' : 'var(--lapd-blue-dark)', marginBottom: '1rem' }}></i>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: user?.isOnDuty ? 'var(--color-success)' : 'var(--text-primary)' }}>
              {user?.isOnDuty ? 'MESAİYİ BİTİR' : 'MESAİYE BAŞLA'}
            </span>
          </div>

          {[
            { icon: 'fa-file-signature', label: 'YENİ RAPOR', href: '/mdt/raporlar' },
            { icon: 'fa-users-viewfinder', label: 'TÜM PERSONEL', href: '/mdt/personel' },
            { icon: 'fa-fingerprint', label: 'KRİMİNAL KAYIT', href: '/mdt/kriminal' },
            { icon: 'fa-book-bookmark', label: 'YÖNETMELİKLER', href: '/mdt/yonetmelikler' },
          ].map((item, idx) => (
            <Link href={item.href} key={idx} style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem 1rem', borderRight: idx !== 3 ? '1px solid var(--lapd-border)' : 'none',
              textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none', color: 'var(--text-primary)'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.8rem', color: 'var(--lapd-blue-dark)', marginBottom: '1rem' }}></i>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MDT DASHBOARD GRID (Like Haber Odası) ── */}
      <section>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--lapd-orange)', marginBottom: '2rem' }}>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--lapd-orange)', fontWeight: 800, fontSize: '0.85rem', borderBottom: '3px solid var(--lapd-orange)', textTransform: 'uppercase' }}>
            SON AKTİVİTELER
          </div>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            SAHADAKİ BİRİMLER ({onDutyCount})
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
          
          {/* Main List: Recent Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: 0 }}>Sisteme Girilen Son Raporlar</h4>
            
            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>Yükleniyor...</div>
            ) : reports.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '2rem', border: '1px solid var(--lapd-border)', backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
                Henüz rapor girişi yapılmadı.
              </div>
            ) : (
              reports.map((rep: any) => (
                <Link key={rep.id} href="/mdt/raporlar" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ 
                    border: '1px solid var(--lapd-border)', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', 
                    transition: 'border-color 0.2s', cursor: 'pointer' 
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--lapd-orange)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--lapd-border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: 'var(--lapd-blue-dark)', color: '#fff', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 800 }}>
                        #{rep.officer?.badge || '000'} {rep.officer?.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{timeAgo(rep.createdAt)}</span>
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                      {rep.title}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rep.content}
                    </p>
                  </div>
                </Link>
              ))
            )}
            
            <Link href="/mdt/raporlar" style={{ color: 'var(--lapd-orange)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '0.5rem' }}>
              <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-orange)' }}></span>
              Tüm Rapor Arşivine Git
            </Link>
          </div>

          {/* Sub List: Active Patrols */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: 0, paddingBottom: '0.5rem' }}>Canlı Devriye Listesi</h4>
            
            <div style={{ border: '1px solid var(--lapd-border)', backgroundColor: 'var(--bg-secondary)' }}>
              {loading ? (
                <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>Yükleniyor...</div>
              ) : onDutyCount === 0 ? (
                <div style={{ padding: '2rem 1.5rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                  Sahada aktif birim yok.
                </div>
              ) : (
                officers.filter((o: any) => o.isOnDuty).slice(0, 6).map((officer: any, idx: number) => (
                  <div key={officer.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                    borderBottom: idx !== 5 ? '1px solid var(--lapd-border)' : 'none',
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{officer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{officer.badge} | {officer.rank}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/mdt/mesai" style={{ color: 'var(--lapd-blue-dark)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '1rem' }}>
              <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-blue-dark)' }}></span>
              Tüm Mesai Verilerini Gör
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
