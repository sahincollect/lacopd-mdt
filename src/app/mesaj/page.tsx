"use client";

import Link from 'next/link';

export default function MessagePage() {
  return (
    <div style={{ backgroundColor: 'var(--LAC-bg)', color: 'var(--LAC-text-dark)', fontFamily: 'var(--font-inter)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 2rem', borderBottom: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--LAC-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--LAC-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--LAC-orange)' }}>Community Lead'den Mesaj</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
        
        {/* Left Side: Photo & Info */}
        <div style={{ flex: '0 0 350px' }}>
          <img src="/chief.png" alt="Community Lead" style={{ width: '100%', border: '1px solid var(--LAC-border)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
          <div style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '1.5rem', marginTop: '-5px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Ador Vance</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--bg-primary)', opacity: 0.7 }}>Community Lead, Los Angeles Community</p>
          </div>
          
          <div style={{ border: '1px solid var(--LAC-border)', padding: '1.5rem', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '2px solid var(--LAC-orange)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>İLETİŞİM</h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--LAC-text-muted)' }}>
              <p style={{ marginBottom: '0.5rem' }}><i className="fa-solid fa-envelope" style={{ marginRight: '10px', color: 'var(--LAC-orange)' }}></i> lead@LAC.com</p>
              <p><i className="fa-brands fa-discord" style={{ marginRight: '10px', color: 'var(--LAC-orange)' }}></i> <a href="https://discord.com/invite/laco" style={{ color: 'var(--LAC-text-muted)', textDecoration: 'none' }}>Sunucumuz</a></p>
            </div>
          </div>
        </div>

        {/* Right Side: Message Content */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--LAC-blue-dark)', marginBottom: '1rem', lineHeight: 1.1 }}>Community Lead'den Mesaj</h1>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--LAC-orange)', marginBottom: '2rem' }}></div>
          
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--LAC-text-dark)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p>
              <strong>Değerli Los Angeles Sakinleri ve Topluluk Üyeleri,</strong>
            </p>
            <p>
              Los Angeles Community Police Department olarak en büyük önceliğimiz, bu şehrin her bir sokağında adaleti, güveni ve şeffaflığı tesis etmektir. Görevimiz yalnızca suçla mücadele etmek değil, aynı zamanda halkımızla el ele vererek daha güvenli bir gelecek inşa etmektir.
            </p>
            <p>
              Günümüzde polislik, sadece yasaları uygulamaktan ibaret değildir; empati kurmayı, toplumu dinlemeyi ve çözüm odaklı yaklaşmayı gerektirir. Bizler, üniformamızı giydiğimiz her gün bu sorumluluğun bilinciyle hareket ediyoruz. Hatalarımızdan ders çıkarıyor, başarılarımızla gurur duyuyor ve her zaman daha iyisini hedefliyoruz.
            </p>
            <p>
              Topluluğumuzun gücü, çeşitliliğinden ve dayanışmasından gelir. Sizlerin desteği olmadan, bizim çabalarımız eksik kalır. Bu yüzden, kapılarımız sizlere her zaman açıktır. Endişelerinizi, önerilerinizi ve şikayetlerinizi dinlemek bizim görevimizdir. Birlikte, Los Angeles'ı yaşamaktan gurur duyduğumuz, güvenli ve huzurlu bir yer yapabiliriz.
            </p>
            <p>
              Departmanımızın her bir üyesinin, görevlerini büyük bir onur ve fedakarlıkla yerine getirdiğini bilmenizi isterim. Korumak ve hizmet etmek için buradayız, ve her zaman sizin yanınızdayız.
            </p>
            <p style={{ marginTop: '1rem', fontStyle: 'italic', fontWeight: 600 }}>
              Saygılarımla,<br/><br/>
              <span style={{ color: 'var(--LAC-blue-dark)', fontStyle: 'normal', fontSize: '1.2rem' }}>Ador Vance<br/><span style={{ fontSize: '0.9rem', color: 'var(--LAC-text-muted)' }}>Community Lead</span></span>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
