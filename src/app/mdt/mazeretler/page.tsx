"use client";
import { useState, useEffect } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 600,
  marginBottom: '0.4rem',
  display: 'block'
};

const statusColor: Record<string, string> = {
  'Bekliyor': '#F59E0B',
  'Onaylandı': '#10B981',
  'Reddedildi': '#0ea5e9',
};

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

  // Auto-calculate day count when dates change
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
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Başlık */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            <i className="fa-solid fa-calendar-xmark" style={{ color: '#F59E0B', marginRight: '0.75rem' }}></i>
            Mazeret Yönetimi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            İzin ve mazeret taleplerini buradan oluşturabilir ve takip edebilirsiniz.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['form', 'list'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              backgroundColor: tab === t ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
              color: tab === t ? '#000' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s'
            }}>
              {t === 'form' ? '+ Yeni Mazeret' : `📋 Talepler (${requests.length})`}
            </button>
          ))}
        </div>
      </div>

      <>
        {tab === 'form' ? (
          <div key="form">
            <div style={{ backgroundColor: 'rgba(17, 28, 50, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Mazeret Talebi Oluştur
              </h2>
              
              {success && (
                <div style={{ backgroundColor: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#10B981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-check-circle"></i> {success}
                </div>
              )}
              {error && (
                <div style={{ backgroundColor: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#0ea5e9', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Rozet Numarası *</label>
                    <input style={inputStyle} placeholder="Örn: 042" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} required
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>İsim Soyisim *</label>
                    <input style={inputStyle} placeholder="Tam adınız" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Başlangıç Tarihi *</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Bitiş Tarihi *</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                </div>

                {form.dayCount && (
                  <div style={{ backgroundColor: 'rgba(14, 165, 233,0.08)', border: '1px solid rgba(14, 165, 233,0.2)', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>
                    Toplam Gün Sayısı: <strong>{form.dayCount} gün</strong>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Mazeret Nedeni *</label>
                  <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Mazeret nedeninizi açıklayınız..."
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  backgroundColor: loading ? 'rgba(14, 165, 233,0.4)' : 'var(--accent-primary)',
                  color: '#000', padding: '0.85rem 2rem', borderRadius: '10px', border: 'none',
                  fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane"></i> Mazeret Gönder</>}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div key="list">
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}></i>
                Henüz mazeret talebi bulunmuyor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {requests.map(r => (
                  <div key={r.id}
                    style={{ backgroundColor: 'rgba(17, 28, 50, 0.6)', borderRadius: '8px', border: `1px solid ${statusColor[r.status]}22`, backdropFilter: 'blur(10px)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    
                    {/* Sol: Durum çizgisi */}
                    <div style={{ width: '4px', height: '60px', borderRadius: '4px', backgroundColor: statusColor[r.status], flexShrink: 0 }}></div>

                    {/* Bilgiler */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{r.fullName}</span>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>#{r.badge}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: statusColor[r.status], backgroundColor: `${statusColor[r.status]}18`, padding: '0.2rem 0.75rem', borderRadius: '20px', border: `1px solid ${statusColor[r.status]}40` }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>
                        <i className="fa-solid fa-calendar-range" style={{ marginRight: '0.4rem' }}></i>
                        {formatDate(r.startDate)} – {formatDate(r.endDate)}
                        <span style={{ marginLeft: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{r.dayCount} gün</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>&ldquo;{r.reason}&rdquo;</div>
                    </div>

                    {/* Admin işlemler */}
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        {r.status === 'Bekliyor' && (
                          <>
                            <button onClick={() => handleStatus(r.id, 'Onaylandı')} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(14, 165, 233,0.3)', backgroundColor: 'rgba(14, 165, 233,0.1)', color: '#10B981', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                              <i className="fa-solid fa-check"></i> Onayla
                            </button>
                            <button onClick={() => handleStatus(r.id, 'Reddedildi')} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(14, 165, 233,0.3)', backgroundColor: 'rgba(14, 165, 233,0.1)', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                              <i className="fa-solid fa-xmark"></i> Reddet
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(r.id)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    </div>
  );
}
