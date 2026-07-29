export default function VerilerimPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '80vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--bg-secondary)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--accent-primary)', fontFamily: "'Oswald', sans-serif" }}>
          KİŞİSEL VERİLERİM
        </h1>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Kişisel verileriniz, hesabınızın güvenliği ve oyun içi karakterinizin (IC) verilerinin düzgün tutulması amacıyla saklanmaktadır. Veri koruma kuralları çerçevesinde verileriniz şifreli sunucularda barındırılmaktadır.
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Veri Silme ve Taşıma Talebi
        </h2>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Rol yapma sunucumuzdaki hesabınızı tamamen silmek istemeniz durumunda, Discord sunucumuz üzerinden destek talebi (Ticket) açarak tüm kalıcı kayıtlarınızın (raporlar hariç) silinmesini talep edebilirsiniz. MDT kayıtlarındaki polis raporları, sunucu kuralları gereği oyun içi belge sayıldığı için tamamen silinemeyebilir (Arşivlenir).
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          İletişim
        </h2>
        <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Kişisel verilerinize ilişkin her türlü sorunuz için Discord üzerinden sunucu yönetimi (Management/High Command) ile doğrudan iletişime geçebilirsiniz.
        </p>
        <p style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Uyarı: Bu web sitesi tamamen kurgusaldır (FiveM Roleplay) ve gerçek kurumlarla hiçbir bağı bulunmamaktadır.
        </p>
      </div>
    </div>
  );
}
