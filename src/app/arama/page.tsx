export default function AramaPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q || "";

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '80vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--bg-secondary)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--accent-primary)', fontFamily: "'Oswald', sans-serif" }}>
          ARAMA SONUÇLARI
        </h1>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          "{query}" için arama sonuçları listeleniyor...
        </p>
        
        {query ? (
          <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-strong)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Mevcut sistemde aradığınız kritere uygun bir sonuç bulunamadı.</p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Lütfen bir arama terimi giriniz.</p>
        )}
      </div>
    </div>
  );
}
