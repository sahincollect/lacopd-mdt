"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--lapd-bg)', color: 'var(--lapd-text-dark)', fontFamily: 'var(--font-inter)' }}>
      
      {/* ── HERO TITLE SECTION ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 1.5rem', position: 'relative' }}>
        <p style={{ fontSize: '1rem', color: 'var(--lapd-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
          Los Angeles Community Polis Departmanı Resmi Web Sitesi
        </p>
        <h1 style={{ 
          fontFamily: 'var(--font-inter)', 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          color: 'var(--lapd-blue-dark)', 
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          Korumak ve Hizmet Etmek
        </h1>

        {/* SEARCH BAR (Absolute positioned overflowing into images) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-25px', 
          left: '2rem', 
          width: '500px', 
          backgroundColor: 'white', 
          border: '1px solid var(--lapd-border)',
          display: 'flex', 
          alignItems: 'center', 
          padding: '0.8rem 1.2rem',
          zIndex: 10,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--lapd-orange)', fontSize: '1.2rem', marginRight: '10px' }}></i>
          <input 
            type="text" 
            placeholder="Ne aramıştınız?" 
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--lapd-text-dark)' }} 
          />
        </div>
      </section>

      {/* ── HERO IMAGES ── */}
      <section style={{ display: 'flex', width: '100%', height: '400px' }}>
        
        {/* Left Big Image */}
        <div style={{ flex: 2, position: 'relative' }}>
          <img src="/gallery/lapdtoren3.png" alt="LAPD Memurları" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--lapd-blue)', padding: '1rem 2rem',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Liderliğe Adanmışlık</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: 6, height: 6, backgroundColor: 'white', borderRadius: '50%' }}></div>
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
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--lapd-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
              <i className="fa-solid fa-play" style={{ color: 'white', fontSize: '1rem', marginLeft: '3px' }}></i>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', border: '1px solid var(--lapd-border)', backgroundColor: 'white' }}>
          {[
            { icon: 'fa-file-lines', label: 'Polis Raporu Oluştur', href: '/rapor-portali' },
            { icon: 'fa-car-burst', label: 'Trafik Kazası Raporu', href: '/rapor-portali' },
            { icon: 'fa-map-location-dot', label: 'Suç Haritası', href: '/' },
            { icon: 'fa-book-bookmark', label: 'Referans Kütüphanesi', href: '/hakkimizda' },
            { icon: 'fa-user-secret', label: 'Arananlar Listesi', href: '/' },
            { icon: 'fa-user-tie', label: 'Aramıza Katıl', href: '/basvurular' },
          ].map((item, idx) => (
            <Link href={item.href} key={idx} style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem 1rem', borderRight: idx !== 5 ? '1px solid var(--lapd-border)' : 'none',
              textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none', color: 'inherit'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-gray-bg)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.8rem', color: 'var(--lapd-blue-dark)', marginBottom: '1rem' }}></i>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEWSROOM ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--lapd-orange)', marginBottom: '2rem' }}>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--lapd-orange)', fontWeight: 800, fontSize: '0.85rem', borderBottom: '3px solid var(--lapd-orange)', textTransform: 'uppercase' }}>HABER ODASI</div>
          <div style={{ padding: '0.5rem 1rem', color: 'var(--lapd-text-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer' }}>ETKİNLİKLER</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Main News Card */}
          <div style={{ border: '1px solid var(--lapd-border)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                LAPD Memur Karışımlı Çatışma - Hollenbeck Bölgesi NRF012-20fp
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>23/04/2026</p>
            </div>
            <Link href="/" style={{ color: 'var(--lapd-orange)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '2rem' }}>
              <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-orange)' }}></span>
              Tüm Haberleri Görüntüle
            </Link>
          </div>

          {/* Sub News Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.3rem' }}>Banka Soygunu Şüphelisi Dedektiflerce Yakalandı NR20088ti</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)' }}>23/04/2026</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.3rem' }}>Silahlı Saldırı Şüphelisi Yakalandı NR20028lh</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)' }}>23/04/2026</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.3rem' }}>Ölümcül Silahlı Çatışma NR20085ml</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)' }}>23/04/2026</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.3rem' }}>Toplumsal İlişkiler Geliştirme Programı Başlatıldı</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)' }}>21/04/2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INFO CARDS (Join Team / Videos / Contact) ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Card 1 */}
        <div style={{ backgroundColor: '#F0F4F4', display: 'flex', flexDirection: 'column' }}>
          <img src="/gallery/statecar5.png" alt="Aramıza Katıl" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--lapd-blue-dark)' }}>Aramıza Katıl</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lapd-text-dark)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Departmanın işini yapmasına yardımcı olmanın sayısız yolu vardır. Siz de fark yaratın.
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/basvurular" style={{ color: 'var(--lapd-orange)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-orange)' }}></span>
                Fark Yaratmanın Yollarını Keşfet
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#F0F4F4', display: 'flex', flexDirection: 'column' }}>
          <img src="/gallery/8.png" alt="Olay Videoları" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--lapd-blue-dark)' }}>Kritik Olay Videoları</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--lapd-text-dark)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              LAPD memurlarının dahil olduğu kritik olayları yakalayan, kamuya açıklanmış video kayıtlarını izleyin.
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/" style={{ color: 'var(--lapd-orange)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-orange)' }}></span>
                Kritik Olay Videolarını İzle
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3 (Dark Blue) */}
        <div style={{ backgroundColor: 'var(--lapd-blue-dark)', color: 'white', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sadece Hayati Tehlike İçeren Acil Durumlar:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>9-1-1</div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acil Olmayan Polis Yanıtı:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>1-877-ASK-LAPD</div>
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-Posta Soru & Yorumlar:</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>contact.lapdonline@gmail.com</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Link href="/" style={{ color: 'var(--lapd-orange)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '15px', height: '2px', backgroundColor: 'var(--lapd-orange)' }}></span>
              Tüm İletişim Bilgilerini Görüntüle
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM HERO / STAY CONNECTED ── */}
      <section style={{ display: 'flex', width: '100%', height: '350px', position: 'relative' }}>
        <div style={{ flex: 1, backgroundImage: 'url("/gallery/saspbenz.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div style={{ flex: 1, backgroundImage: 'url("/gallery/lspd7.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        {/* Floating Box */}
        <div style={{ 
          position: 'absolute', left: '10%', bottom: '0', 
          backgroundColor: '#F0F4F4', padding: '2rem 3rem',
          transform: 'translateY(30px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1rem' }}>BİZİMLE KALIN</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a href="https://discord.com/invite/laco" target="_blank" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-discord"></i> Discord Sunucusu
            </a>
            <a href="https://www.youtube.com/@Thelapd-7" target="_blank" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-youtube"></i> YouTube Resmi
            </a>
            <a href="https://www.tiktok.com/@thelapdfivem?lang=tr-TR" target="_blank" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              <i className="fa-brands fa-tiktok"></i> TikTok Hesabı
            </a>
          </div>
        </div>
      </section>

      {/* ── BOTTOM LINKS STRIP ── */}
      <section style={{ backgroundColor: 'white', padding: '6rem 2rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>HIZLI BAĞLANTILAR</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Polis Raporu Oluştur</a>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Trafik Kazası Raporu Oluştur</a>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Suç Haritası</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'transparent' }}>_</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Referans Kütüphanesi</a>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Arananlar Listesi</a>
              <a href="#" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontSize: '0.85rem' }}>Aramıza Katıl</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>SAYFAYI ÇEVİR</h4>
            <select style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--lapd-border)', backgroundColor: 'white' }}>
              <option>Dil Seçiniz</option>
              <option>English</option>
              <option>Türkçe</option>
            </select>
          </div>
        </div>
      </section>
      
    </div>
  );
}
