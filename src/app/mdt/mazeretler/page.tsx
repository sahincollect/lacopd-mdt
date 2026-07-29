"use client";
import { useState, useEffect } from 'react';

const statusColor: Record<string, string> = {
  'Bekliyor': 'var(--lapd-orange)',
  'Onaylandı': 'var(--color-success)',
  'Reddedildi': 'var(--color-danger)',
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
    borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: "border-box"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.5rem', display: 'block'
  };

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
            MAZERET YÖNETİMİ
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
            İzin ve mazeret taleplerini buradan oluşturabilir ve takip edebilirsiniz.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['form', 'list'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.75rem 1.25rem', borderRadius: '4px', border: t === tab ? '1px solid var(--lapd-blue-dark)' : '1px solid var(--border-light)', cursor: 'pointer', fontWeight: 900, fontSize: '0.85rem',
              backgroundColor: tab === t ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              color: tab === t ? 'var(--lapd-blue-dark)' : 'var(--text-muted)',
              transition: 'all 0.2s', textTransform: 'uppercase'
            }}>
              {t === 'form' ? '+ Yeni Mazeret' : `📋 Talepler (${requests.length})`}
            </button>
          ))}
        </div>
      </div>

      <>
        {tab === 'form' ? (
          <div key="form">
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', textTransform: 'uppercase' }}>
                MAZERET TALEBİ OLUŞTUR
              </h2>
              
              {success && (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--color-success)', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--color-success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <i className="fa-solid fa-check-circle"></i> {success}
                </div>
              )}
              {error && (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--color-danger)', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Rozet Numarası *</label>
                    <input style={inputStyle} placeholder="Örn: 042" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>İsim Soyisim *</label>
                    <input style={inputStyle} placeholder="Tam adınız" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Başlangıç Tarihi *</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Bitiş Tarihi *</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                  </div>
                </div>

                {form.dayCount && (
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--lapd-blue-dark)', fontSize: '0.9rem', fontWeight: 800 }}>
                    <i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>
                    TOPLAM GÜN SAYISI: <strong>{form.dayCount} GÜN</strong>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Mazeret Nedeni *</label>
                  <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Mazeret nedeninizi açıklayınız..."
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={loading} style={{
                    backgroundColor: 'var(--lapd-blue-dark)', color: '#fff', padding: '0.85rem 2.5rem', borderRadius: '4px', border: 'none',
                    fontWeight: 900, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> GÖNDERİLİYOR...</> : <><i className="fa-solid fa-paper-plane"></i> MAZERET GÖNDER</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div key="list">
            {requests.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: 'var(--text-muted)' }}></i>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                  Henüz mazeret talebi bulunmuyor.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map(r => (
                  <div key={r.id}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: `1px solid var(--border-light)`, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    
                    <div style={{ width: '4px', height: '60px', borderRadius: '4px', backgroundColor: statusColor[r.status] || 'var(--text-muted)', flexShrink: 0 }}></div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem', textTransform: 'uppercase' }}>{r.fullName}</span>
                        <span style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: 'var(--lapd-blue-dark)', fontWeight: 800, border: '1px solid var(--border-light)' }}>#{r.badge}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 900, color: '#fff', backgroundColor: statusColor[r.status] || 'var(--text-muted)', padding: '0.4rem 1rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
                        <i className="fa-solid fa-calendar-range" style={{ marginRight: '0.4rem' }}></i>
                        {formatDate(r.startDate)} – {formatDate(r.endDate)}
                        <span style={{ marginLeft: '1rem', color: 'var(--lapd-blue-dark)', fontWeight: 900 }}>{r.dayCount} GÜN</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
                        {r.reason}
                      </div>
                    </div>

                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexDirection: 'column' }}>
                        {r.status === 'Bekliyor' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleStatus(r.id, 'Onaylandı')} style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--color-success)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <i className="fa-solid fa-check"></i> Onayla
                            </button>
                            <button onClick={() => handleStatus(r.id, 'Reddedildi')} style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--lapd-orange)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <i className="fa-solid fa-xmark"></i> Reddet
                            </button>
                          </div>
                        )}
                        <button onClick={() => handleDelete(r.id)} style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--color-danger)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                          <i className="fa-solid fa-trash"></i> SİL
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
