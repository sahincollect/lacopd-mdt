"use client";

import { useState } from 'react';
import Link from 'next/link';

const searchIndex = [
  { title: 'Personel Girişi', keywords: ['giriş', 'login', 'personel', 'admin', 'panel'], path: '/login' },
  { title: 'Biz Kimiz?', keywords: ['biz kimiz', 'hakkımızda', 'about', 'LAC', 'tarihçe', 'şef', 'vizyon', 'misyon'], path: '/hakkimizda' },
  { title: 'Galeri', keywords: ['galeri', 'fotoğraflar', 'medya', 'resimler', 'operasyonlar'], path: '/galeri' },
  { title: 'Haberler', keywords: ['haberler', 'news', 'duyurular', 'son dakika', 'bülten'], path: '/haberler' },
  { title: 'Kariyer Olanakları', keywords: ['kariyer', 'iş', 'başvuru', 'olanaklar', 'maaş', 'şartlar'], path: '/kariyer' },
  { title: 'Akademi Başvurusu', keywords: ['akademi', 'başvuru', 'form', 'öğrenci', 'memur', 'polis'], path: '/basvurular/memur' },
  { title: 'Sivil Biniş (Ride-Along)', keywords: ['sivil biniş', 'ride along', 'ride-along', 'devriye', 'araç'], path: '/basvurular/ride-along' },
  { title: 'Şikayet Formu', keywords: ['şikayet', 'ihbar', 'rapor', 'suç', 'memur şikayet'], path: '/basvurular/sikayet' },
  { title: 'Arama Kurtarma', keywords: ['arama kurtarma', 'rescue', 'yardım', 'hava', 'deniz'], path: '/kariyer' }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string, path: string}[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const lowerQ = query.toLowerCase();
      const results = searchIndex.filter(item => 
        item.title.toLowerCase().includes(lowerQ) || 
        item.keywords.some(k => k.toLowerCase().includes(lowerQ))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--LAC-bg)', color: 'var(--LAC-text-dark)', fontFamily: 'var(--font-inter)' }}>
      
      {/* ── HERO TITLE SECTION ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 1.5rem', position: 'relative' }}>
        <p style={{ fontSize: '1rem', color: 'var(--LAC-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
          Los Angeles Community Polis Departmanı Resmi Web Sitesi
        </p>
        <h1 style={{ 
          fontFamily: 'var(--font-inter)', 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          color: 'var(--LAC-blue-dark)', 
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          To Protect and to Serve
        </h1>

        {/* SEARCH BAR (Dynamic Search component) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-25px', 
          left: '2rem', 
          width: '500px', 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-light)',
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 100,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1.2rem' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem', marginRight: '10px' }}></i>
            <input 
              type="text" 
              placeholder="Ne aramıştınız? (Örn: Akademi, Haberler)" 
              value={searchQuery}
              onChange={handleSearch}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--text-primary)', backgroundColor: 'transparent' }} 
            />
          </div>
          
          {searchResults.length > 0 && (
            <div style={{ 
              borderTop: '1px solid var(--border-light)',
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              {searchResults.map((res, i) => (
                <Link key={i} href={res.path} style={{
                  display: 'block',
                  padding: '0.8rem 1.2rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {res.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HERO IMAGES ── */}
      <section style={{ display: 'flex', width: '100%', height: '400px' }}>
        
        {/* Left Big Image */}
        <div style={{ flex: 2, position: 'relative' }}>
          <img src="/news/1.jpg" alt="LAC Memurları" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--LAC-blue)', padding: '1rem 2rem',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Liderliğe Adanmışlık</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: 6, height: 6, backgroundColor: 'var(--bg-secondary)', borderRadius: '50%' }}></div>
              <div style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
              <div style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
              <div style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
              <div style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Right Image (Community Lead) */}
        <Link href="/mesaj" style={{ flex: 1, position: 'relative', display: 'block', textDecoration: 'none' }}>
          <img src="/chief.png" alt="Community Lead Mesajı" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '1.5rem',
            color: 'white', display: 'flex', alignItems: 'flex-start', gap: '1rem',
            transition: 'background 0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(to top, rgba(0,0,0,1), transparent)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'}
          >
            <div style={{ backgroundColor: 'var(--LAC-orange)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', flexShrink: 0 }}>
              Mesajı Oku
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>Community Lead'den Mesaj</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>Aylık Değerlendirme</div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── QUICKLINKS ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>HIZLI BAĞLANTILAR</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', border: '1px solid var(--LAC-border)', backgroundColor: 'var(--bg-secondary)' }}>
          {[
            { icon: 'fa-users', label: 'Biz Kimiz?', href: '/hakkimizda' },
            { icon: 'fa-images', label: 'Galeri', href: '/galeri' },
            { icon: 'fa-newspaper', label: 'Haberler', href: '/haberler' },
            { icon: 'fa-user-graduate', label: 'Akademi Başvurusu', href: '/basvurular/memur' },
            { icon: 'fa-briefcase', label: 'Kariyer Olanakları', href: '/kariyer' },
            { icon: 'fa-file-signature', label: 'Şikayet Formu', href: '/basvurular/sikayet' },
          ].map((item, idx) => (
            <Link href={item.href} key={idx} style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem 1rem', borderRight: idx !== 5 ? '1px solid var(--LAC-border)' : 'none',
              textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none', color: 'var(--text-primary)'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.8rem', color: 'var(--LAC-blue-dark)', marginBottom: '1rem' }}></i>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEWSROOM ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--LAC-orange)', marginBottom: '2rem' }}>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--LAC-orange)', fontWeight: 800, fontSize: '0.85rem', borderBottom: '3px solid var(--LAC-orange)', textTransform: 'uppercase' }}>HABER ODASI</div>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--LAC-text-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer' }}>ETKİNLİKLER</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Main News Card */}
          <Link href="/haberler" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'relative', height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="/news/1.jpg" alt="Main News" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}></div>
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
                <span style={{ backgroundColor: 'var(--LAC-orange)', color: '#fff', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '4px', marginBottom: '0.5rem', display: 'inline-block' }}>GANG UNIT</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0.5rem 0' }}>
                  Los Angeles Sokaklarında Dev Çete Operasyonu
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#ccc', margin: 0 }}>August 12, 2026</p>
              </div>
            </div>
          </Link>

          {/* Sub News Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { title: 'Organize Suç Örgütlerine Büyük Darbe', date: 'August 09, 2026', img: '/news/2.jpg' },
              { title: 'Crash Night: Hafta Sonu Trafik Denetimleri', date: 'August 05, 2026', img: '/news/3.jpg' },
              { title: 'LAC Filosuna Yeni Nesil Devriye Araçları', date: 'August 01, 2026', img: '/news/4.jpg' },
              { title: 'Şafak Operasyonu: Ağır Silahlar Ele Geçirildi', date: 'July 25, 2026', img: '/news/6.jpg' }
            ].map((n, i) => (
              <Link key={i} href="/haberler" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                  <img src={n.img} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{n.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFO CARDS (Join Team / Videos / Contact) ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Card 1 */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          <img src="/news/4.jpg" alt="Aramıza Katıl" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Aramıza Katıl</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Departmanın işini yapmasına yardımcı olmanın sayısız yolu vardır. Siz de fark yaratın.
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/basvurular" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--accent-secondary)' }}></span>
                Fark Yaratmanın Yollarını Keşfet
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          <img src="/news/3.jpg" alt="Olay Videoları" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Kritik Olay Videoları</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              LAC memurlarının dahil olduğu kritik olayları yakalayan, kamuya açıklanmış video kayıtlarını izleyin.
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--accent-secondary)' }}></span>
                Kritik Olay Videolarını İzle
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3 (Dark Blue) */}
        <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sadece Hayati Tehlike İçeren Acil Durumlar:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>9-1-1</div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acil Olmayan Polis Yanıtı:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>1-877-ASK-LAC</div>
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-Posta Soru & Yorumlar:</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>contact.LAConline@gmail.com</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Link href="/" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--accent-secondary)' }}></span>
              Tüm İletişim Bilgilerini Görüntüle
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM HERO / STAY CONNECTED ── */}
      <section style={{ display: 'flex', width: '100%', height: '350px', position: 'relative' }}>
        <div style={{ flex: 1, backgroundImage: 'url("/news/5.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div style={{ flex: 1, backgroundImage: 'url("/news/6.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        {/* Floating Box */}
        <div style={{ 
          position: 'absolute', left: '10%', bottom: '0', 
          backgroundColor: 'var(--bg-secondary)', padding: '2rem 3rem',
          border: '1px solid var(--border-light)',
          transform: 'translateY(30px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-primary)' }}>BİZİMLE KALIN</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a href="https://discord.com/invite/laco" target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-discord"></i> Discord Sunucusu
            </a>
            <a href="https://www.youtube.com/@TheLAC-7" target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-youtube"></i> YouTube Resmi
            </a>
            <a href="https://www.tiktok.com/@theLACfivem?lang=tr-TR" target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-tiktok"></i> TikTok Hesabı
            </a>
          </div>
        </div>
      </section>

      {/* ── BOTTOM LINKS STRIP ── */}
      <section style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-light)', padding: '4rem 2rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>PORTAL HİZMETLERİ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link href="/mdt/basvuru" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Birim Başvuruları</Link>
              <Link href="/mdt/kriminal" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Kriminal Kayıt Sistemi</Link>
              <Link href="/mdt/duyurular" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Departman Duyuruları</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>KURUMSAL BAĞLANTILAR</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link href="/hakkimizda" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Hakkımızda</Link>
              <Link href="/kariyer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Kariyer ve Akademi</Link>
              <Link href="/iletisim" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>İletişim ve Destek</Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
