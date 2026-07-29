"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const DEPARTMENTS = [
  { key: "Patrol Division",   label: "Patrol Division",   icon: "fa-car-side",         color: "#0284c7" },
  { key: "Detective Bureau",  label: "Detective Bureau",  icon: "fa-magnifying-glass",  color: "#0369a1" },
  { key: "SWAT",              label: "SWAT",              icon: "fa-crosshairs",        color: "#0ea5e9" },
  { key: "Metro K-9",        label: "Metro K-9",         icon: "fa-paw",               color: "#F59E0B" },
  { key: "Dive Unit",         label: "Dive Unit",         icon: "fa-person-swimming",   color: "#0ea5e9" },
  { key: "Traffic Division",  label: "Traffic Division",  icon: "fa-traffic-light",     color: "#10B981" },
  { key: "GND",               label: "GND (Gangs & Narcotics Division)", icon: "fa-skull", color: "#8B5CF6" },
  { key: "GIT",               label: "GIT (Gang Impact Teams)", icon: "fa-people-group", color: "#8b5cf6" },
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
      toast.success(editingOfficer ? "Memur bilgileri başarıyla güncellendi." : "Yeni memur başarıyla eklendi.");
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
    if (!confirm(`"${name}" adlı memuru sistemden kaldırmak istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/officers/${id}`, { method: "DELETE" });
      if (res.ok) mutateOfficers();
      else toast.error("Silme işlemi başarısız.");
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
        toast.success(`${name} başarıyla onaylandı ve sisteme kabul edildi!`);
        mutateOfficers();
      } else {
        toast.error("Onaylama başarısız oldu.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    }
  };

  const handleRejectApplication = async (id: number, name: string) => {
    if (!confirm(`"${name}" adlı personelin hesap başvurusunu reddetmek/silmek istediğinize emin misiniz?`)) return;
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
    DEPARTMENTS.find(d => d.key === key) || { key, label: key, icon: "fa-users", color: "#64748b" };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "1rem",
    backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px", color: "#fff", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box", transition: "all 0.3s"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1rem', minHeight: '80vh' }}>
      
      {/* BACKGROUND EXPERIMENTAL GRID */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.05) 0%, transparent 50%)', pointerEvents: 'none', zIndex: -1 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 70%)' }}></div>
      </div>

      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', backgroundColor: 'rgba(10, 15, 30, 0.6)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em", color: "#fff", textShadow: "0 0 20px rgba(14, 165, 233, 0.5)", display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <i className="fa-solid fa-users-viewfinder" style={{ color: '#0284c7' }}></i> PERSONEL VERİ TABANI
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", letterSpacing: "0.1em", margin: "0.5rem 0 0 0", textTransform: 'uppercase' }}>
              Ağdaki Toplam Memur: <span style={{ color: '#fff', fontWeight: 700 }}>{officers.length}</span>
            </p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(14, 165, 233, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowModal(true); setEditingOfficer(null); setFormError(""); setForm({ ...EMPTY_FORM }); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.8rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(14, 165, 233, 0.5)",
                backgroundColor: "rgba(14, 165, 233, 0.1)", color: "#10b981",
                fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", backdropFilter: 'blur(10px)', letterSpacing: '0.05em'
              }}
            >
              <i className="fa-solid fa-user-plus"></i> MEMUR EKLE
            </motion.button>
          )}
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Neon Search Bar */}
          <div style={{ position: "relative", width: '100%' }}>
            <i className="fa-solid fa-radar" style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "#0284c7", fontSize: "1rem", animation: 'pulse-icon 2s infinite' }}></i>
            <input
              type="text" placeholder="Memur adı, sicil veya rütbe taraması (Örn: John, 104, Sergeant)..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "3rem", borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.5)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', fontSize: '1rem' }}
              onFocus={e => { e.currentTarget.style.borderColor = "#0284c7"; e.currentTarget.style.boxShadow = "0 0 15px rgba(14, 165, 233, 0.3), inset 0 0 10px rgba(0,0,0,0.5)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.5)"; }}
            />
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveDeptFilter("Tümü")}
              style={{
                padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: '0.05em',
                cursor: "pointer", transition: "all 0.2s",
                border: activeDeptFilter === "Tümü" ? "1px solid rgba(255,255,255,0.8)" : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: activeDeptFilter === "Tümü" ? "rgba(255,255,255,0.1)" : "transparent",
                color: activeDeptFilter === "Tümü" ? "#fff" : "#94a3b8"
              }}
            >
              TÜMÜ
            </button>
            {DEPARTMENTS.map(dept => (
              <button
                key={dept.key}
                onClick={() => setActiveDeptFilter(dept.key)}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: '0.05em',
                  cursor: "pointer", transition: "all 0.2s",
                  border: activeDeptFilter === dept.key ? `1px solid ${dept.color}` : "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: activeDeptFilter === dept.key ? `${dept.color}20` : "transparent",
                  color: activeDeptFilter === dept.key ? dept.color : "#94a3b8"
                }}
              >
                {dept.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

      </motion.div>

      {/* ── ONAY BEKLEYEN HESAP BAŞVURULARI (YALNIZCA ADMİNLER İÇİN) ── */}
      {isAdmin && pendingOfficers && pendingOfficers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "3rem",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "20px",
            padding: "1.75rem",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 30px rgba(239, 68, 68, 0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em", color: "#f87171", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <i className="fa-solid fa-bell" style={{ animation: "pulse 1.5s infinite" }}></i> ONAY BEKLEYEN HESAP BAŞVURULARI ({pendingOfficers.length})
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#fca5a5", backgroundColor: "rgba(239, 68, 68, 0.2)", padding: "0.35rem 0.85rem", borderRadius: "20px", fontWeight: 700 }}>
              Yarı-Otonom Doğrulama Bekliyor
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            {pendingOfficers.map((app: any) => (
              <div
                key={app.id}
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "all 0.3s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {app.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>{app.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Rozet: <strong style={{ color: "#38bdf8" }}>#{app.badge}</strong> • {app.rank}</div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Departman: {app.department}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", marginTop: "auto" }}>
                  <button
                    onClick={() => handleApproveApplication(app.id, app.name)}
                    style={{
                      flex: 1, padding: "0.65rem", borderRadius: "10px", border: "1px solid #10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: 800, fontSize: "0.85rem",
                      cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                    }}
                  >
                    <i className="fa-solid fa-check"></i> ONAYLA (GİRİŞ İZNİ VER)
                  </button>
                  <button
                    onClick={() => handleRejectApplication(app.id, app.name)}
                    style={{
                      padding: "0.65rem 1rem", borderRadius: "10px", border: "1px solid rgba(239, 68, 68, 0.4)",
                      backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171", fontWeight: 700, fontSize: "0.85rem",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i> REDDET
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DEPARTMENT CARDS */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center", height: "40vh", gap: "1.5rem" }}>
          <div style={{ width: 64, height: 64, border: '3px solid rgba(14, 165, 233, 0.1)', borderTop: '3px solid #0284c7', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
          <span style={{ color: '#0284c7', fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>Veri Tabanı Sorgulanıyor...</span>
        </div>
      ) : allDepts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "5rem", backgroundColor: "rgba(10, 15, 30, 0.6)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: 'blur(16px)' }}>
          <i className="fa-solid fa-ghost" style={{ fontSize: "4rem", marginBottom: "1.5rem", color: 'rgba(255,255,255,0.1)' }}></i>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em', color: '#fff', margin: '0 0 0.5rem 0' }}>KAYIT BULUNAMADI</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Aranan kriterlere uygun memur kaydı sistemde mevcut değil.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {allDepts.map(dept => {
            const meta = getDeptMeta(dept);
            const members = grouped[dept];
            const onDuty = members.filter(o => o.isOnDuty).length;

            return (
              <motion.div variants={itemVariants} key={dept} style={{ backgroundColor: "rgba(10, 15, 30, 0.6)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", backdropFilter: 'blur(16px)', position: 'relative' }}>
                {/* Glowing Corner Edge */}
                <div style={{ 
                  position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
                  padding: '1px', 
                  background: `linear-gradient(135deg, ${meta.color} 0%, transparent 40%)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}></div>

                {/* Dept Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: `linear-gradient(90deg, ${meta.color}15 0%, transparent 40%)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}50`, display: "flex", alignItems: "center", justifyContent: "center", color: meta.color, fontSize: '1rem', boxShadow: `0 0 15px ${meta.color}20` }}>
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color: "#fff" }}>{meta.label.toUpperCase()}</h2>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: '0.1em' }}>KAYITLI OPERATÖR: {members.length}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {onDuty > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#10b981", fontWeight: 700, letterSpacing: '0.1em' }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981", animation: 'pulse-blip 2s infinite' }}></span>
                        {onDuty} AKTİF
                      </div>
                    )}
                  </div>
                </div>

                {/* Members Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", padding: "1.5rem" }}>
                  {members.map(officer => (
                    <motion.div whileHover={{ y: -2, boxShadow: `0 8px 20px ${meta.color}15`, borderColor: `${meta.color}50` }} key={officer.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.75rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s", position: "relative", overflow: 'hidden' }}>
                      
                      {/* Avatar (Rounded Square + LAC Logo Fallback) */}
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${meta.color}40`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: `0 0 10px ${meta.color}10` }}>
                          {officer.profileImage ? (
                            <img src={officer.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src="/lapd-logo.jpg" alt="LAC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'grayscale(100%)' }} />
                          )}
                        </div>
                        {/* Status Blip */}
                        <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: officer.isOnDuty ? "#10b981" : "#475569", border: "2px solid rgba(10,15,30,0.9)", boxShadow: officer.isOnDuty ? "0 0 6px #10b981" : "none" }}></div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: '#fff' }}>
                          {officer.name.toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ fontSize: "0.7rem", color: meta.color, fontWeight: 700, fontFamily: 'monospace', backgroundColor: `${meta.color}15`, padding: '0.1rem 0.3rem', borderRadius: '4px' }}>#{officer.badge}</span>
                           <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{officer.rank || "OFFICER I"}</span>
                        </div>
                        {officer.specialRoles && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                            {officer.specialRoles.split(',').filter(Boolean).map((sr: string, sIdx: number) => (
                              <span key={sIdx} style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                color: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.35)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <i className="fa-solid fa-medal" style={{ fontSize: '0.55rem' }}></i> {sr.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                          <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(14, 165, 233, 0.2)' }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(officer)} title="Düzenle" style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(14, 165, 233,0.3)", backgroundColor: "rgba(14, 165, 233,0.1)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>
                            <i className="fa-solid fa-pen"></i>
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(14, 165, 233, 0.2)' }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(officer.id, officer.name)} disabled={deletingId === officer.id} title="Kaldır" style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(14, 165, 233,0.3)", backgroundColor: "rgba(14, 165, 233,0.1)", color: "#38bdf8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>
                            {deletingId === officer.id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-trash-can"></i>}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* EXPERIMENTAL MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, backdropFilter: "blur(10px)", padding: "1.25rem", overflowY: "auto" }} onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditingOfficer(null); } }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ backgroundColor: "rgba(10, 15, 30, 0.96)", border: `1px solid ${editingOfficer ? '#0369a1' : '#0284c7'}50`, borderRadius: "24px", width: "100%", maxWidth: "620px", maxHeight: "calc(100vh - 2.5rem)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 40px ${editingOfficer ? '#0369a1' : '#0284c7'}20`, position: 'relative' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, transparent, ${editingOfficer ? '#0369a1' : '#0284c7'}, transparent)`, zIndex: 10 }}></div>

              <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, backgroundColor: "rgba(10, 15, 30, 0.98)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: editingOfficer ? "rgba(139,92,246,0.15)" : "rgba(14, 165, 233,0.15)", border: `1px solid ${editingOfficer ? "rgba(139,92,246,0.4)" : "rgba(14, 165, 233,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: editingOfficer ? "#a78bfa" : "#60a5fa", fontSize: '1.2rem' }}>
                    <i className={editingOfficer ? "fa-solid fa-user-pen" : "fa-solid fa-user-plus"}></i>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontSize: "1.3rem", letterSpacing: "0.05em", color: "#fff" }}>{editingOfficer ? "SİCİL GÜNCELLEME" : "YENİ KAYIT OLUŞTUR"}</h2>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", letterSpacing: '0.08em' }}>{editingOfficer ? `Kayıtlı Operatör: ${editingOfficer.name}` : "Merkezi Veri Tabanı Kaydı"}</div>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.4rem", transition: 'color 0.2s', padding: '0.3rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.1rem", overflowY: "auto", flex: 1 }}>
                  {formError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: "rgba(14, 165, 233,0.1)", border: "1px solid rgba(14, 165, 233,0.3)", color: "#7dd3fc", padding: "0.85rem", borderRadius: "12px", fontSize: "0.82rem", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-triangle-exclamation"></i> {formError}
                    </motion.div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>ROZET NUMARASI *</label>
                      <input required value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Örn: 04-1234" style={{ ...inputStyle, padding: "0.75rem 1rem" }} onFocus={e => e.currentTarget.style.borderColor = editingOfficer ? "#0369a1" : "#0284c7"} onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>İSİM SOYİSİM *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Örn: John Doe" style={{ ...inputStyle, padding: "0.75rem 1rem" }} onFocus={e => e.currentTarget.style.borderColor = editingOfficer ? "#0369a1" : "#0284c7"} onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "flex", justifyContent: 'space-between', alignItems: 'flex-end', fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                      <span>GÜVENLİK ANAHTARI (ŞİFRE) {editingOfficer ? "" : "*"}</span>
                      {editingOfficer && <span style={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 400 }}>(Değiştirmeyecekseniz boş bırakın)</span>}
                    </label>
                    <input required={!editingOfficer} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editingOfficer ? "********" : "Sisteme giriş şifresi belirleyin"} style={{ ...inputStyle, padding: "0.75rem 1rem" }} onFocus={e => e.currentTarget.style.borderColor = editingOfficer ? "#0369a1" : "#0284c7"} onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>RÜTBE</label>
                      <select value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} style={{ ...inputStyle, padding: "0.75rem 1rem", cursor: "pointer", appearance: 'none' }}>
                        {RANKS.map(r => <option key={r} value={r} style={{ background: '#0a0f1e' }}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>YETKİ SEVİYESİ</label>
                      <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, padding: "0.75rem 1rem", cursor: "pointer", appearance: 'none' }}>
                        <option value="user" style={{ background: '#0a0f1e' }}>Memur (Standart)</option>
                        <option value="admin" style={{ background: '#0a0f1e' }}>Yönetici (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700, letterSpacing: "0.08em" }}>BİRİM / DEPARTMAN</label>
                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ ...inputStyle, padding: "0.75rem 1rem", cursor: "pointer", appearance: 'none' }}>
                      {DEPARTMENTS.map(d => <option key={d.key} value={d.key} style={{ background: '#0a0f1e' }}>{d.label}</option>)}
                      <option value="High Command" style={{ background: '#0a0f1e' }}>High Command</option>
                    </select>
                  </div>

                  {/* ÖZEL ROLLER / BİRİM SORUMLULUKLARI (SADECE ADMİNLER YÖNETEBİLİR) */}
                  {isAdmin && (
                    <div style={{ marginTop: '0.2rem', borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: '0.8rem' }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#38bdf8", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                        <i className="fa-solid fa-user-shield"></i> ÖZEL GÖREV & BİRİM ROLLERİ ATAMA (Sadece Admin Yetkisi)
                      </label>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem',
                        backgroundColor: 'rgba(5, 12, 28, 0.8)', padding: '0.85rem', borderRadius: '12px',
                        border: '1px solid rgba(56, 189, 248, 0.3)', maxHeight: '150px', overflowY: 'auto'
                      }}>
                        {SPECIAL_ROLES_LIST.map((sr) => {
                          const currentArray = form.specialRoles ? form.specialRoles.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const isChecked = currentArray.includes(sr);
                          return (
                            <label key={sr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: isChecked ? '#38bdf8' : '#cbd5e1', cursor: 'pointer', fontWeight: isChecked ? 700 : 500 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let next = [...currentArray];
                                  if (e.target.checked) next.push(sr);
                                  else next = next.filter(item => item !== sr);
                                  setForm(f => ({ ...f, specialRoles: next.join(', ') }));
                                }}
                                style={{ accentColor: '#0ea5e9', width: '15px', height: '15px', cursor: 'pointer' }}
                              />
                              <span>{sr}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: "1.1rem 1.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "0.85rem", justifyContent: "flex-end", flexShrink: 0, backgroundColor: 'rgba(5, 10, 22, 0.98)' }}>
                  <button type="button" onClick={() => { setShowModal(false); setEditingOfficer(null); }} style={{ padding: "0.75rem 1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.03)", color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}>
                    İPTAL
                  </button>
                  <button type="submit" disabled={submitting} style={{ padding: "0.75rem 1.75rem", borderRadius: "10px", border: "none", backgroundColor: editingOfficer ? "#0369a1" : "#0284c7", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: `0 4px 15px ${editingOfficer ? "rgba(139,92,246,0.35)" : "rgba(14, 165, 233,0.35)"}`, transition: 'all 0.2s' }}>
                    {submitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> İŞLENİYOR...</> : editingOfficer ? <><i className="fa-solid fa-floppy-disk"></i> KAYDI GÜNCELLE</> : <><i className="fa-solid fa-plus"></i> MEMUR EKLE</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
