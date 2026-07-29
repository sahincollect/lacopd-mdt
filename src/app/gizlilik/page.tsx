export default function GizlilikPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '80vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--bg-secondary)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--accent-primary)', fontFamily: "'Oswald', sans-serif" }}>
          GİZLİLİK POLİTİKASI
        </h1>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Los Angeles Community (LAC) olarak gizliliğinize büyük önem veriyoruz. Bu gizlilik politikası, LAC portalını kullanırken topladığımız bilgileri, bu bilgileri nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Toplanan Bilgiler
        </h2>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Kayıt olduğunuzda veya portal hizmetlerini kullandığınızda IP adresiniz, Discord ID'niz ve sisteme girdiğiniz temel kişisel/rol (in-game) bilgileriniz kaydedilebilir. Bu bilgiler tamamen FiveM Roleplay ortamının gereklilikleri doğrultusunda toplanmaktadır.
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Bilgilerin Kullanımı
        </h2>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Toplanan bilgiler yalnızca departman içi iletişim, rütbe atamaları, ceza/rapor sistemleri ve genel sunucu içi (in-character) işleyişin devamlılığı için kullanılmaktadır. Hiçbir bilgi üçüncü şahıslarla reklam veya ticari amaçlarla paylaşılmaz.
        </p>
        <p style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Son Güncelleme: {new Date().getFullYear()} - Bu web sitesi tamamen kurgusaldır ve gerçek Los Angeles Police Department (LAPD) ile bir ilgisi yoktur.
        </p>
      </div>
    </div>
  );
}
