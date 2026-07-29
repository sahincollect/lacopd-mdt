"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const DEPARTMENTS = [
  { key: "Patrol Division",   label: "Patrol Division",   icon: "fa-car-side",         color: "var(--color-success)" },
  { key: "Detective Bureau",  label: "Detective Bureau",  icon: "fa-magnifying-glass",  color: "var(--lapd-blue-dark)" },
  { key: "SWAT",              label: "SWAT",              icon: "fa-crosshairs",        color: "var(--lapd-blue-dark)" },
  { key: "Metro K-9",        label: "Metro K-9",         icon: "fa-paw",               color: "var(--lapd-orange)" },
  { key: "Dive Unit",         label: "Dive Unit",         icon: "fa-person-swimming",   color: "var(--lapd-blue-dark)" },
  { key: "Traffic Division",  label: "Traffic Division",  icon: "fa-traffic-light",     color: "var(--color-success)" },
  { key: "GND",               label: "GND",               icon: "fa-skull",             color: "var(--lapd-blue-dark)" },
  { key: "GIT",               label: "GIT",               icon: "fa-people-group",      color: "var(--lapd-blue-dark)" },
];

const RANKS = [
  "Captain",
  "Lieutenant II",
  "Lieutenant I",
  "Sergeant II",
  "Sergeant I",
  "Detective III",
  "Detective II",
  "Detective I",
  "Officer III",
  "Officer II",
  "Officer I",
  "Cadet",
];

const SPECIAL_ROLES_LIST = [
  "Internal Affairs",
  "Field Training Officer (FTO)",
  "SWAT Operator",
  "Air Support Pilot (ASU)",
  "Gangs & Narcotics (GND)",
  "Gang Impact Teams (GIT)",
  "Metro K-9 Handler",
  "Dive & Marine Unit",
  "High Speed Unit (HSU)",
  "High Command Liaison"
];

const EMPTY_FORM = { badge: "", name: "", password: "", rank: "Officer I", department: "Patrol Division", role: "user", specialRoles: "" };

export default function PersonelListesi() {
  const [search, setSearch]         = useState("");
  const [activeDeptFilter, setActiveDeptFilter] = useState("Tümü");
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);

  const { data: officersData, mutate: mutateOfficers } = useSWR('/api/officers', fetcher);
  const { data: meData } = useSWR('/api/auth/me', fetcher);

  const loading = !officersData || !meData;
  const officers = useMemo(() => officersData?.officers || [], [officersData]);
  const currentUser = meData?.user || null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editingOfficer) {
        const payload: any = {
          badge: form.badge,
          name: form.name,
          rank: form.rank,
          department: form.department,
          role: form.role,
          specialRoles: form.specialRoles || "",
        };
        if (form.password) payload.password = form.password;
        const res = await fetch(`/api/officers/${editingOfficer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error || "Güncelleme başarısız."); return; }
      } else {
        const res = await fetch("/api/officers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error || "Bir hata oluştu."); return; }
      }
      setShowModal(false);
      setEditingOfficer(null);
      setForm({ ...EMPTY_FORM });
      mutateOfficers();
      toast.success(editingOfficer ? "Memur bilgileri güncellendi." : "Yeni memur eklendi.");
    } catch {
      setFormError("Sunucu hatası.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (officer: any) => {
    setEditingOfficer(officer);
    setForm({
      badge: officer.badge,
      name: officer.name,
      password: "",
      rank: officer.rank || "Officer I",
      department: officer.department || "Patrol Division",
      role: officer.role || "user",
      specialRoles: officer.specialRoles || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" adlı memuru silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/officers/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateOfficers();
        toast.success("Silme işlemi başarılı.");
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch {
      toast.error("Hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApproveApplication = async (id: number, name: string) => {
    try {
      const res = await fetch(`/api/officers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      if (res.ok) {
        toast.success(`${name} başarıyla onaylandı!`);
        mutateOfficers();
      } else {
        toast.error("Onaylama başarısız oldu.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    }
  };

  const handleRejectApplication = async (id: number, name: string) => {
    if (!confirm(`"${name}" adlı personelin başvurusunu reddetmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/officers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${name} başvurusu reddedildi.`);
        mutateOfficers();
      } else {
        toast.error("İşlem başarısız.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const { filtered, allDepts, grouped, pendingOfficers } = useMemo(() => {
    const active = officers.filter((o: any) => o.status !== "PENDING" && o.status !== "REJECTED");
    const pending = officers.filter((o: any) => o.status === "PENDING");

    let filt = active.filter((o: any) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.badge.toLowerCase().includes(search.toLowerCase()) ||
      o.rank?.toLowerCase().includes(search.toLowerCase())
    );

    if (activeDeptFilter !== "Tümü") {
      filt = filt.filter((o: any) => o.department === activeDeptFilter);
    }

    const grp: Record<string, any[]> = {};
    filt.forEach((o: any) => {
      const dept = o.department || "High Command";
      if (!grp[dept]) grp[dept] = [];
      grp[dept].push(o);
    });
    return { filtered: filt, allDepts: Object.keys(grp).sort(), grouped: grp, pendingOfficers: pending };
  }, [officers, search, activeDeptFilter]);

  const getDeptMeta = (key: string) =>
    DEPARTMENTS.find(d => d.key === key) || { key, label: key, icon: "fa-users", color: 'var(--text-muted)' };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem",
    background: 'var(--bg-tertiary)', border: "1px solid var(--border-light)",
    borderRadius: '4px', color: 'var(--text-primary)', fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box", transition: "all 0.2s"
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>YÜKLENİYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", color: 'var(--lapd-blue-dark)', textTransform: 'uppercase' }}>
            PERSONEL VERİ TABANI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: "1rem", margin: "0.2rem 0 0 0", fontWeight: 600 }}>
            L.A.C.P.D. Ağındaki Toplam Memur: <span style={{ color: 'var(--lapd-orange)', fontWeight: 800 }}>{officers.length}</span>
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowModal(true); setEditingOfficer(null); setFormError(""); setForm({ ...EMPTY_FORM }); }}
            style={{
              padding: "0.75rem 1.5rem", borderRadius: '4px', border: "none",
              background: "var(--lapd-blue-dark)", color: "#fff",
              fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <i className="fa-solid fa-user-plus"></i> MEMUR EKLE
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
        <div style={{ position: "relative", width: '100%', maxWidth: '500px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1rem" }}></i>
          <input
            type="text" placeholder="Memur adı, sicil veya rütbe ara..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "2.5rem" }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveDeptFilter("Tümü")}
            style={{
              padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
              border: "1px solid var(--border-light)",
              background: activeDeptFilter === "Tümü" ? "var(--lapd-blue-dark)" : "var(--bg-tertiary)",
              color: activeDeptFilter === "Tümü" ? "#fff" : "var(--text-primary)"
            }}
          >
            TÜMÜ
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.key}
              onClick={() => setActiveDeptFilter(dept.key)}
              style={{
                padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                border: "1px solid var(--border-light)",
                background: activeDeptFilter === dept.key ? "var(--lapd-blue-dark)" : "var(--bg-tertiary)",
                color: activeDeptFilter === dept.key ? "#fff" : "var(--text-primary)"
              }}
            >
              {dept.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── ONAY BEKLEYEN HESAP BAŞVURULARI ── */}
      {isAdmin && pendingOfficers && pendingOfficers.length > 0 && (
        <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "2px solid var(--color-danger)", borderRadius: "8px", padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0, color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fa-solid fa-bell"></i> ONAY BEKLEYEN BAŞVURULAR ({pendingOfficers.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {pendingOfficers.map((app: any) => (
              <div key={app.id} style={{ background: 'var(--bg-secondary)', border: "1px solid var(--border-light)", borderRadius: '8px', padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: '4px', background: "var(--color-danger)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 900 }}>
                    {app.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: "1.1rem" }}>{app.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: "0.85rem" }}>Rozet: <strong style={{ color: "var(--lapd-orange)" }}>#{app.badge}</strong> • {app.rank}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <button onClick={() => handleApproveApplication(app.id, app.name)} style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "none", background: "var(--color-success)", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-check"></i> ONAYLA
                  </button>
                  <button onClick={() => handleRejectApplication(app.id, app.name)} style={{ padding: "0.75rem 1rem", borderRadius: "4px", border: "none", background: "var(--color-danger)", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                    <i className="fa-solid fa-xmark"></i> REDDET
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT CARDS */}
      {allDepts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
          <i className="fa-solid fa-ghost" style={{ fontSize: "3rem", marginBottom: "1rem", color: 'var(--text-muted)' }}></i>
          <h2 style={{ fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>KAYIT BULUNAMADI</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Aranan kriterlere uygun memur kaydı sistemde mevcut değil.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {allDepts.map(dept => {
            const meta = getDeptMeta(dept);
            const members = grouped[dept];
            const onDuty = members.filter(o => o.isOnDuty).length;

            return (
              <div key={dept} style={{ background: "var(--bg-secondary)", borderRadius: '8px', border: "1px solid var(--border-light)", overflow: "hidden" }}>
                
                {/* Dept Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem", borderBottom: "2px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "45px", height: "45px", borderRadius: "4px", background: "var(--bg-tertiary)", border: `1px solid var(--border-light)`, display: "flex", alignItems: "center", justifyContent: "center", color: meta.color, fontSize: '1.2rem' }}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.25rem", color: 'var(--lapd-blue-dark)', textTransform: 'uppercase' }}>{meta.label}</h2>
                      <div style={{ fontSize: "0.8rem", color: 'var(--text-muted)', fontWeight: 700 }}>KAYITLI OPERATÖR: {members.length}</div>
                    </div>
                  </div>
                  {onDuty > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-success)", fontWeight: 800 }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-success)" }}></span>
                      {onDuty} AKTİF
                    </div>
                  )}
                </div>

                {/* Members Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", padding: "1.5rem" }}>
                  {members.map(officer => (
                    <div key={officer.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: 'var(--bg-primary)', borderRadius: '4px', border: "1px solid var(--border-light)" }}>
                      
                      {/* Avatar */}
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "4px", background: 'var(--bg-tertiary)', border: `1px solid var(--border-light)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {officer.profileImage ? (
                            <img src={officer.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <i className="fa-solid fa-user" style={{ color: 'var(--text-muted)' }}></i>
                          )}
                        </div>
                        {/* Status Blip */}
                        <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "14px", height: "14px", borderRadius: "50%", background: officer.isOnDuty ? "var(--color-success)" : "var(--text-muted)", border: "2px solid var(--bg-primary)" }}></div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: 800, fontSize: "1rem", color: 'var(--text-primary)', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {officer.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ fontSize: "0.75rem", color: 'var(--lapd-orange)', fontWeight: 900, fontFamily: 'monospace' }}>#{officer.badge}</span>
                           <span style={{ fontSize: "0.75rem", color: 'var(--text-secondary)', fontWeight: 700 }}>{officer.rank || "OFFICER I"}</span>
                        </div>
                        {officer.specialRoles && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.3rem' }}>
                            {officer.specialRoles.split(',').filter(Boolean).map((sr: string, sIdx: number) => (
                              <span key={sIdx} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                                {sr.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => handleEdit(officer)} title="Düzenle" style={{ width: "30px", height: "30px", borderRadius: "4px", border: "none", background: "var(--lapd-blue-dark)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button onClick={() => handleDelete(officer.id, officer.name)} disabled={deletingId === officer.id} title="Kaldır" style={{ width: "30px", height: "30px", borderRadius: "4px", border: "none", background: "var(--color-danger)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {deletingId === officer.id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-trash-can"></i>}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditingOfficer(null); } }}>
          <div style={{ background: "var(--bg-primary)", border: `1px solid var(--border-light)`, borderRadius: "8px", width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            <div style={{ padding: "1.5rem", borderBottom: "2px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)" }}>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.25rem", color: 'var(--lapd-blue-dark)' }}>{editingOfficer ? "SİCİL GÜNCELLEME" : "YENİ KAYIT OLUŞTUR"}</h2>
              <button onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ background: "none", border: "none", color: 'var(--text-muted)', cursor: "pointer", fontSize: "1.5rem" }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
                {formError && (
                  <div style={{ background: "var(--color-danger)", color: "#fff", padding: "1rem", borderRadius: '4px', fontSize: "0.85rem", fontWeight: 700 }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> {formError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>ROZET NUMARASI *</label>
                    <input required value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Örn: 04-1234" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>İSİM SOYİSİM *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Örn: John Doe" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", justifyContent: 'space-between', alignItems: 'flex-end', fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>
                    <span>GÜVENLİK ANAHTARI (ŞİFRE) {editingOfficer ? "" : "*"}</span>
                  </label>
                  <input required={!editingOfficer} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editingOfficer ? "Değiştirmeyecekseniz boş bırakın" : "Şifre belirleyin"} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>RÜTBE</label>
                    <select value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} style={inputStyle}>
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>YETKİ SEVİYESİ</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                      <option value="user">Memur (Standart)</option>
                      <option value="admin">Yönetici (Admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: 'var(--text-primary)', marginBottom: "0.5rem", fontWeight: 800 }}>BİRİM / DEPARTMAN</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={inputStyle}>
                    {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    <option value="High Command">High Command</option>
                  </select>
                </div>

                {isAdmin && (
                  <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 900, marginBottom: "0.5rem" }}>
                      ÖZEL GÖREV ROLLERİ
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                      {SPECIAL_ROLES_LIST.map((sr) => {
                        const currentArray = form.specialRoles ? form.specialRoles.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const isChecked = currentArray.includes(sr);
                        return (
                          <label key={sr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let next = [...currentArray];
                                if (e.target.checked) next.push(sr);
                                else next = next.filter(item => item !== sr);
                                setForm(f => ({ ...f, specialRoles: next.join(', ') }));
                              }}
                            />
                            <span>{sr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: "1.5rem", borderTop: "2px solid var(--border-light)", display: "flex", gap: "1rem", justifyContent: "flex-end", background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ padding: "0.75rem 1.5rem", borderRadius: "4px", border: "1px solid var(--border-light)", background: "var(--bg-tertiary)", color: 'var(--text-primary)', cursor: "pointer", fontWeight: 800 }}>
                  İPTAL
                </button>
                <button type="submit" disabled={submitting} style={{ padding: "0.75rem 1.5rem", borderRadius: "4px", border: "none", background: "var(--lapd-blue-dark)", color: '#fff', fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "İŞLENİYOR..." : (editingOfficer ? "KAYDİ GÜNCELLE" : "MEMUR EKLE")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
