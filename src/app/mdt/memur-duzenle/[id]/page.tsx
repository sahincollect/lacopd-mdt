"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditOfficer() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    badge: "",
    name: "",
    rank: "",
    department: "",
    role: "user"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/officers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.officer) {
          setFormData({
            badge: data.officer.badge,
            name: data.officer.name,
            rank: data.officer.rank,
            department: data.officer.department,
            role: data.officer.role
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Memur bilgileri alınamadı.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/officers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/mdt");
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Güncelleme işlemi başarısız.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Memur Düzenle</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>#{formData.badge} sicil numaralı memurun bilgilerini güncelleyin.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}
          
          {success && (
            <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-blue)', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
              <i className="fa-solid fa-check-circle"></i> Memur başarıyla güncellendi! Panoya yönlendiriliyorsunuz...
            </div>
          )}

          <div className="grid-2">
            <div>
              <label className="form-label">ROZET NUMARASI</label>
              <input name="badge" type="text" className="form-input" value={formData.badge} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">İSİM SOYİSİM</label>
              <input name="name" type="text" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="form-label">RÜTBE</label>
            <input name="rank" type="text" className="form-input" value={formData.rank} onChange={handleChange} required />
          </div>

          <div className="grid-2">
            <div>
              <label className="form-label">ATANACAK BİRİM</label>
              <select name="department" className="form-input" value={formData.department} onChange={handleChange}>
                <option value="Birim Seçilmedi (Atanmadı)">Birim Seçilmedi (Atanmadı)</option>
                <option value="Patrol">Patrol</option>
                <option value="Detective Bureau">Detective Bureau</option>
                <option value="Metro K-9">Metro K-9</option>
                <option value="SWAT">SWAT</option>
                <option value="GND">GND</option>
                <option value="GIT">GIT (Gang Impact Teams)</option>
              </select>
            </div>
            <div>
              <label className="form-label">PANEL YETKİSİ</label>
              <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
                <option value="user">User (Standart Memur)</option>
                <option value="admin">Admin (Yönetici)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={success}>
            <i className="fa-solid fa-floppy-disk"></i> DEĞİŞİKLİKLERİ KAYDET
          </button>
        </form>
      </div>
    </div>
  );
}
