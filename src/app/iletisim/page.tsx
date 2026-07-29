"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function IletisimPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: 'var(--lapd-bg)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--font-inter)' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Departman İletişimi</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            DEPARTMAN İLETİŞİMİ
          </h1>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '1.1rem', color: 'var(--lapd-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Halkla ilişkiler, acil olmayan talepler ve departman birimleri ile iletişim kurmak için aşağıdaki kanalları kullanabilirsiniz. Acil durumlarda lütfen her zaman 911'i arayın.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
          
          {/* ── LEFT: CONTACT INFO ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid var(--lapd-border)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(232, 79, 42, 0.1)', color: 'var(--lapd-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <i className="fa-solid fa-building-shield"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--lapd-blue-dark)' }}>Merkez Karargah (HQ)</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--lapd-text-muted)', marginTop: '4px' }}>Los Angeles C.P.D.</div>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--lapd-text-dark)', lineHeight: 1.6, margin: 0 }}>
                <strong>Adres:</strong> 100 W 1st St, Los Angeles, CA 90012<br />
                <strong>Ana Hat:</strong> (213) 486-1000<br />
                <strong>Medya & PR:</strong> pr@lacopd.online
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid var(--lapd-border)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(4, 22, 50, 0.1)', color: 'var(--lapd-blue-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <i className="fa-solid fa-phone-volume"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--lapd-blue-dark)' }}>Önemli Numaralar</h3>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--lapd-text-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Acil Durum:</span> <span style={{ color: 'var(--lapd-orange)', fontWeight: 800 }}>911</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Acil Olmayan İhbar:</span> <span>1-877-ASK-LAPD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>İşe Alım Hattı:</span> <span>(866) 444-1429</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: CONTACT FORM ── */}
          <div style={{ backgroundColor: 'white', padding: '3rem', border: '1px solid var(--lapd-border)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: '0 0 0.5rem' }}>Çevrimiçi İletişim Formu</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--lapd-text-muted)', marginBottom: '2rem' }}>Acil olmayan konulardaki sorularınız veya bilgi talepleriniz için lütfen aşağıdaki formu eksiksiz doldurun. Talepleriniz 48 iş saati içerisinde değerlendirilecektir.</p>
            
            {status === 'success' ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800 }}>Mesajınız İletildi</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>İletişim talebiniz departmanımıza başarıyla ulaştı. En kısa sürede tarafınıza dönüş sağlanacaktır.</p>
                <button onClick={() => setStatus('idle')} style={{ marginTop: '1.5rem', padding: '0.6rem 1.2rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Yeni Mesaj Gönder</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ad Soyad <span style={{color:'var(--lapd-orange)'}}>*</span></label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.9rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-Posta Adresi <span style={{color:'var(--lapd-orange)'}}>*</span></label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.9rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Konu <span style={{color:'var(--lapd-orange)'}}>*</span></label>
                  <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '0.9rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                    <option value="">Lütfen seçiniz</option>
                    <option value="bilgi">Genel Bilgi Talebi</option>
                    <option value="basin">Basın / Medya İletişimi</option>
                    <option value="toplum">Toplum İlişkileri Birimi (Community Relations)</option>
                    <option value="isealim">Kariyer & İşe Alım Soruları</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mesajınız <span style={{color:'var(--lapd-orange)'}}>*</span></label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '0.9rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={status === 'loading'} style={{
                    padding: '1rem 2rem', backgroundColor: 'var(--lapd-blue-dark)', color: 'white',
                    border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 800,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
                    opacity: status === 'loading' ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    {status === 'loading' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-regular fa-paper-plane"></i>}
                    {status === 'loading' ? 'GÖNDERİLİYOR...' : 'MESAJI GÖNDER'}
                  </button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
