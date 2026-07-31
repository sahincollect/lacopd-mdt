// src/app/mdt/personel/page.tsx
"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const DEPARTMENTS = [
  { key: "Patrol Division",   label: "Patrol Division",   icon: "fa-car-side",         color: "var(--mdt-success)" },
  { key: "Detective Bureau",  label: "Detective Bureau",  icon: "fa-magnifying-glass",  color: "var(--mdt-accent)" },
  { key: "SWAT",              label: "SWAT",              icon: "fa-crosshairs",        color: "var(--mdt-accent)" },
  { key: "Metro K-9",        label: "Metro K-9",         icon: "fa-paw",               color: "var(--mdt-warning)" },
  { key: "Dive Unit",         label: "Dive Unit",         icon: "fa-person-swimming",   color: "var(--mdt-accent)" },
  { key: "Traffic Division",  label: "Traffic Division",  icon: "fa-traffic-light",     color: "var(--mdt-success)" },
  { key: "GND",               label: "GND",               icon: "fa-skull",             color: "var(--mdt-accent)" },
  { key: "GIT",               label: "GIT",               icon: "fa-people-group",      color: "var(--mdt-accent)" },
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
    DEPARTMENTS.find(d => d.key === key) || { key, label: key, icon: "fa-users", color: 'var(--mdt-text-muted)' };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.9rem",
    background: 'var(--mdt-bg-main)', border: "1px solid var(--mdt-border)",
    borderRadius: '8px', color: 'var(--mdt-text-primary)', fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s"
  };
  
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--mdt-accent)';
    e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)';
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--mdt-border)';
    e.target.style.boxShadow = 'none';
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--mdt-text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>PERSONEL VERİLERİ YÜKLENİYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--mdt-border)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · YÖNETİM
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>ROSTER DB</span>
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: 'var(--mdt-text-primary)', lineHeight: 1.1 }}>
            Personel Veritabanı
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: "0.82rem", margin: "0.35rem 0 0 0", fontWeight: 400 }}>
            L.A.C.P.D. Ağındaki Toplam Memur: <strong style={{ color: 'var(--mdt-accent)' }}>{officers.length}</strong>
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowModal(true); setEditingOfficer(null); setFormError(""); setForm({ ...EMPTY_FORM }); }}
            style={{
              padding: "0.65rem 1.35rem", borderRadius: '8px', border: "1px solid var(--mdt-accent)",
              background: "var(--mdt-accent)", color: "#fff",
              fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
              transition: "opacity 0.15s"
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            <i className="fa-solid fa-user-plus"></i> MEMUR EKLE
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--mdt-card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--mdt-border)' }}>
        <div style={{ position: "relative", width: '100%', maxWidth: '500px' }}>
          <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--mdt-text-muted)", fontSize: "1rem" }}></i>
          <input
            type="text" placeholder="Memur adı, sicil veya rütbe ara..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "2.5rem" }}
            onFocus={handleInputFocus} onBlur={handleInputBlur}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveDeptFilter("Tümü")}
            style={{
              padding: "0.4rem 0.85rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              border: activeDeptFilter === "Tümü" ? "1px solid var(--mdt-accent)" : "1px solid var(--mdt-border)",
              background: activeDeptFilter === "Tümü" ? "var(--mdt-accent)" : "transparent",
              color: activeDeptFilter === "Tümü" ? "#fff" : "var(--mdt-text-secondary)"
            }}
          >
            TÜMÜ
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.key}
              onClick={() => setActiveDeptFilter(dept.key)}
              style={{
                padding: "0.4rem 0.85rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                border: activeDeptFilter === dept.key ? "1px solid var(--mdt-accent)" : "1px solid var(--mdt-border)",
                background: activeDeptFilter === dept.key ? "var(--mdt-accent)" : "transparent",
                color: activeDeptFilter === dept.key ? "#fff" : "var(--mdt-text-secondary)"
              }}
            >
              {dept.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── ONAY BEKLEYEN HESAP BAŞVURULARI ── */}
      {isAdmin && pendingOfficers && pendingOfficers.length > 0 && (
        <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--mdt-danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fa-solid fa-bell"></i> ONAY BEKLEYEN BAŞVURULAR ({pendingOfficers.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {pendingOfficers.map((app: any) => (
              <div key={app.id} style={{ background: 'var(--mdt-bg-main)', border: "1px solid var(--mdt-border)", borderRadius: '8px', padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: '8px', background: "rgba(239,68,68,0.12)", color: "var(--mdt-danger)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 900 }}>
                    {app.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: 'var(--mdt-text-primary)', fontWeight: 800, fontSize: "1rem" }}>{app.name}</div>
                    <div style={{ color: 'var(--mdt-text-secondary)', fontSize: "0.8rem" }}>Rozet: <strong style={{ color: "var(--mdt-accent)" }}>#{app.badge}</strong> • {app.rank}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <button onClick={() => handleApproveApplication(app.id, app.name)} style={{ flex: 1, padding: "0.65rem", borderRadius: "6px", border: "1px solid rgba(0,210,106,0.3)", background: "rgba(0,210,106,0.1)", color: "var(--mdt-success)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,210,106,0.2)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,210,106,0.1)'}>
                    <i className="fa-solid fa-check"></i> ONAYLA
                  </button>
                  <button onClick={() => handleRejectApplication(app.id, app.name)} style={{ padding: "0.65rem 1rem", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "var(--mdt-danger)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}>
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
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--mdt-card-bg)", borderRadius: "10px", border: "1px solid var(--mdt-border)" }}>
          <i className="fa-solid fa-ghost" style={{ fontSize: "2.5rem", marginBottom: "1rem", color: 'var(--mdt-text-muted)', opacity: 0.6 }}></i>
          <h2 style={{ fontWeight: 800, color: 'var(--mdt-text-secondary)', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>KAYIT BULUNAMADI</h2>
          <p style={{ color: 'var(--mdt-text-muted)', margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Aranan kriterlere uygun memur kaydı sistemde mevcut değil.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {allDepts.map(dept => {
            const meta = getDeptMeta(dept);
            const members = grouped[dept];
            const onDuty = members.filter(o => o.isOnDuty).length;

            return (
              <div key={dept} style={{ background: "var(--mdt-card-bg)", borderRadius: '10px', border: "1px solid var(--mdt-border)", overflow: "hidden" }}>
                
                {/* Dept Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--mdt-border)", background: "rgba(255,255,255,0.01)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: `color-mix(in srgb, ${meta.color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: meta.color, fontSize: '1.1rem' }}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: 'var(--mdt-text-primary)' }}>{meta.label}</h2>
                      <div style={{ fontSize: "0.75rem", color: 'var(--mdt-text-muted)', fontWeight: 600 }}>Kayıtlı Personel: {members.length}</div>
                    </div>
                  </div>
                  {onDuty > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--mdt-success)", fontWeight: 700, padding: "4px 10px", background: "rgba(0,210,106,0.1)", borderRadius: "20px", border: "1px solid rgba(0,210,106,0.2)" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--mdt-success)" }}></span>
                      {onDuty} AKTİF
                    </div>
                  )}
                </div>

                {/* Members Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", padding: "1.5rem" }}>
                  {members.map(officer => (
                    <div key={officer.id} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem", background: 'var(--mdt-bg-main)', borderRadius: '8px', border: "1px solid var(--mdt-border)", transition: "border-color 0.15s" }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'}>
                      
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: 'var(--mdt-card-bg)', border: `1px solid var(--mdt-border)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {officer.profileImage ? (
                            <img src={officer.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <i className="fa-solid fa-user" style={{ color: 'var(--mdt-text-muted)', fontSize: '1.2rem' }}></i>
                          )}
                        </div>
                        {/* Status Blip */}
                        <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: officer.isOnDuty ? "var(--mdt-success)" : "var(--mdt-text-muted)", border: "2px solid var(--mdt-bg-main)" }}></div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: 'var(--mdt-text-primary)', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {officer.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                           <span style={{ fontSize: "0.7rem", color: 'var(--mdt-accent)', fontWeight: 800, fontFamily: 'monospace' }}>#{officer.badge}</span>
                           <span style={{ fontSize: "0.7rem", color: 'var(--mdt-text-secondary)', fontWeight: 600 }}>{officer.rank || "OFFICER I"}</span>
                        </div>
                        {officer.specialRoles && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                            {officer.specialRoles.split(',').filter(Boolean).map((sr: string, sIdx: number) => (
                              <span key={sIdx} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--mdt-text-secondary)', background: 'var(--mdt-card-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--mdt-border)' }}>
                                {sr.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                          <button onClick={() => handleEdit(officer)} title="Düzenle" style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid var(--mdt-border)", background: "transparent", color: "var(--mdt-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>
                            <i className="fa-solid fa-pen" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                          <button onClick={() => handleDelete(officer.id, officer.name)} disabled={deletingId === officer.id} title="Kaldır" style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "var(--mdt-danger)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'; }}>
                            {deletingId === officer.id ? <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '0.75rem' }}></i> : <i className="fa-solid fa-trash-can" style={{ fontSize: '0.75rem' }}></i>}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: 'blur(4px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditingOfficer(null); } }}>
          <div style={{ background: "var(--mdt-card-bg)", border: `1px solid var(--mdt-border)`, borderRadius: "14px", width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: '0 24px 60px rgba(0,0,0,0.55)' }}>
            
            <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid var(--mdt-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: 'var(--mdt-text-primary)' }}>{editingOfficer ? "Memur Kaydını Düzenle" : "Yeni Personel Kaydı"}</h2>
              <button onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ background: "none", border: "none", color: 'var(--mdt-text-muted)', cursor: "pointer", fontSize: "1.2rem" }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
                {formError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: '1px solid rgba(239, 68, 68, 0.2)', color: "var(--mdt-danger)", padding: "1rem", borderRadius: '8px', fontSize: "0.85rem", fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> {formError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>ROZET NUMARASI *</label>
                    <input required value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Örn: 04-1234" style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>İSİM SOYİSİM *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Örn: John Doe" style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", justifyContent: 'space-between', alignItems: 'flex-end', fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    <span>GÜVENLİK ANAHTARI (ŞİFRE) {editingOfficer ? "" : "*"}</span>
                  </label>
                  <input required={!editingOfficer} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editingOfficer ? "Değiştirmeyecekseniz boş bırakın" : "Şifre belirleyin"} style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>RÜTBE</label>
                    <select value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur}>
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>YETKİ SEVİYESİ</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur}>
                      <option value="user">Memur (Standart)</option>
                      <option value="admin">Yönetici (Admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", color: 'var(--mdt-text-muted)', marginBottom: "0.45rem", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>BİRİM / DEPARTMAN</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={inputStyle} onFocus={handleInputFocus} onBlur={handleInputBlur}>
                    {DEPARTMENTS.map(d => <option key={d.key} value={d.label}>{d.label}</option>)}
                    <option value="High Command">High Command</option>
                  </select>
                </div>

                {isAdmin && (
                  <div style={{ borderTop: '1px solid var(--mdt-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--mdt-text-primary)", fontWeight: 800, marginBottom: "0.75rem" }}>
                      ÖZEL GÖREV ROLLERİ
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--mdt-bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mdt-border)' }}>
                      {SPECIAL_ROLES_LIST.map((sr) => {
                        const currentArray = form.specialRoles ? form.specialRoles.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const isChecked = currentArray.includes(sr);
                        return (
                          <label key={sr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--mdt-text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let next = [...currentArray];
                                if (e.target.checked) next.push(sr);
                                else next = next.filter(item => item !== sr);
                                setForm(f => ({ ...f, specialRoles: next.join(', ') }));
                              }}
                              style={{ accentColor: 'var(--mdt-accent)' }}
                            />
                            <span>{sr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: "1.25rem 1.75rem", borderTop: "1px solid var(--mdt-border)", display: "flex", gap: "0.75rem", justifyContent: "flex-end", background: 'transparent' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; }}>
                  İPTAL
                </button>
                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: '8px', border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
                  onMouseOver={e => { if(!submitting) (e.currentTarget as HTMLElement).style.opacity = '0.85'} }
                  onMouseOut={e => { if(!submitting) (e.currentTarget as HTMLElement).style.opacity = '1'} }>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-save"></i> {editingOfficer ? "GÜNCELLE" : "KAYDET"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
