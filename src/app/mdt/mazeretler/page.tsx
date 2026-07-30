// src/app/mdt/mazeretler/page.tsx
"use client";
import { useState, useEffect } from 'react';

const statusColor: Record<string, string> = {
  'Bekliyor': 'var(--mdt-warning)',
  'Onaylandı': 'var(--mdt-success)',
  'Reddedildi': 'var(--mdt-danger)',
};

const statusBadgeStyles: Record<string, any> = {
  'Bekliyor': { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  'Onaylandı': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.22)' },
  'Reddedildi': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.22)' },
}

export default function MazeretlerPage() {
  const [form, setForm] = useState({ badge: '', fullName: '', reason: '', startDate: '', endDate: '', dayCount: '' });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'form' | 'list'>('form');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch('/api/mazeretler');
    if (res.ok) setRequests(await res.json());
  };

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) setForm(f => ({ ...f, dayCount: diff.toString() }));
    }
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const res = await fetch('/api/mazeretler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess('Mazeret talebiniz başarıyla oluşturuldu!');
      setForm({ badge: '', fullName: '', reason: '', startDate: '', endDate: '', dayCount: '' });
      fetchRequests();
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(data.message || 'Bir hata oluştu.');
    }
  };

  const handleStatus = async (id: number, status: string) => {
    await fetch(`/api/mazeretler/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchRequests();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu mazeret kaydını silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/mazeretler/${id}`, { method: 'DELETE' });
    fetchRequests();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--mdt-border)', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · İNSAN KAYNAKLARI
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>HR SYS</span>
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--mdt-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Mazeret Yönetimi
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            İzin ve mazeret taleplerini buradan oluşturabilir ve takip edebilirsiniz.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--mdt-bg-main)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--mdt-border)' }}>
          {(['form', 'list'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
              backgroundColor: tab === t ? 'var(--mdt-card-bg)' : 'transparent',
              color: tab === t ? 'var(--mdt-text-primary)' : 'var(--mdt-text-muted)',
              transition: 'all 0.2s',
              boxShadow: tab === t ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
            }}>
              {t === 'form' ? 'Yeni Mazeret' : `Başvurular (${requests.length})`}
            </button>
          ))}
        </div>
      </div>

      <>
        {tab === 'form' ? (
          <div key="form" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 10, padding: '2rem', width: '100%', maxWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-file-signature" style={{ color: 'var(--mdt-accent)', fontSize: '1.2rem' }} />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--mdt-text-primary)' }}>
                  Mazeret Talebi Oluştur
                </h2>
              </div>
              
              {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#22c55e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-check-circle"></i> {success}
                </div>
              )}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Rozet Numarası *</label>
                    <input style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                      placeholder="Örn: 042" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>İsim Soyisim *</label>
                    <input style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                      placeholder="Tam adınız" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Başlangıç Tarihi *</label>
                    <input type="date" style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box', colorScheme: 'dark' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                      value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Bitiş Tarihi *</label>
                    <input type="date" style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box', colorScheme: 'dark' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                      value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                  </div>
                </div>

                {form.dayCount && (
                  <div style={{ background: 'rgba(29, 110, 247, 0.08)', border: '1px dashed var(--mdt-accent)', borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--mdt-accent)', fontSize: '0.9rem', fontWeight: 700 }}>
                    <i className="fa-solid fa-calendar-days"></i>
                    Toplam Gün Sayısı: {form.dayCount} GÜN
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Mazeret Nedeni *</label>
                  <textarea style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Mazeret nedeninizi açıklayınız..."
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: 8, border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: loading ? 0.7 : 1 }}
                    onMouseOver={e => { if(!loading) (e.currentTarget as HTMLElement).style.opacity = '0.85'} }
                    onMouseOut={e => { if(!loading) (e.currentTarget as HTMLElement).style.opacity = '1'} }>
                    {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> GÖNDERİLİYOR...</> : <><i className="fa-solid fa-paper-plane"></i> TALEBİ GÖNDER</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div key="list">
            {requests.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--mdt-text-muted)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mdt-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '1.5rem', color: 'var(--mdt-accent)', opacity: 0.6 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--mdt-text-secondary)', marginBottom: '0.3rem' }}>Talep bulunamadı</div>
                  <div style={{ fontSize: '0.82rem' }}>Henüz mazeret talebi bulunmuyor.</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>Personel</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>Tarih Aralığı</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>Gerekçe</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>Durum</th>
                      {user?.role === 'admin' && (
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', borderBottom: '1px solid var(--mdt-border)', background: 'var(--mdt-bg-main)' }}>İşlemler</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => {
                      const badgeSt = statusBadgeStyles[r.status] || { bg: 'rgba(255,255,255,0.1)', color: 'var(--mdt-text-secondary)', border: 'rgba(255,255,255,0.2)' };
                      return (
                        <tr key={r.id} style={{ transition: 'background 0.1s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)'}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--mdt-text-primary)' }}>{r.fullName}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--mdt-text-muted)' }}>#{r.badge}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--mdt-text-secondary)' }}>{formatDate(r.startDate)} - {formatDate(r.endDate)}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--mdt-accent)', fontWeight: 600 }}>{r.dayCount} Gün</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', maxWidth: '300px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--mdt-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {r.reason}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: badgeSt.bg, color: badgeSt.color, border: `1px solid ${badgeSt.border}` }}>
                              {r.status}
                            </span>
                          </td>
                          {user?.role === 'admin' && (
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {r.status === 'Bekliyor' && (
                                  <>
                                    <button onClick={() => handleStatus(r.id, 'Onaylandı')} title="Onayla" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <i className="fa-solid fa-check"></i>
                                    </button>
                                    <button onClick={() => handleStatus(r.id, 'Reddedildi')} title="Reddet" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <i className="fa-solid fa-xmark"></i>
                                    </button>
                                  </>
                                )}
                                <button onClick={() => handleDelete(r.id)} title="Sil" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
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
        )}
      </>
    </div>
  );
}
