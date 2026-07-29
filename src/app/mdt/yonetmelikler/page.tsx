"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Yonetmelikler() {
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const user    = meData?.user ?? null;
  const isAdmin = user?.role === "admin";

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ title: "", content: "" });
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/yonetmelikler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({ title: "", content: "" });
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--mdt-border)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--mdt-text-muted)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: "0 0 0.3rem",
            }}
          >
            L.A.C.P.D. · Resmi Belgeler
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              margin: 0,
              color: "var(--mdt-text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Departman Yönetmelikleri
          </h1>
          <p style={{ color: "var(--mdt-text-muted)", fontSize: "0.85rem", marginTop: "0.4rem", fontWeight: 400 }}>
            Los Angeles Community Police Department — Resmi kural ve prosedürler.
          </p>
        </div>

        {/* Admin only: Add button */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.7rem 1.35rem",
              borderRadius: 9,
              border: "1px solid var(--mdt-accent)",
              background: "var(--mdt-accent-alpha)",
              color: "var(--mdt-accent)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.02em",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--mdt-accent)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--mdt-accent-alpha)";
              (e.currentTarget as HTMLElement).style.color = "var(--mdt-accent)";
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: "0.8rem" }} />
            Yeni Yönetmelik Ekle
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 420,
          gap: "1.25rem",
          textAlign: "center",
          color: "var(--mdt-text-muted)",
        }}
      >
        {/* Badge icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--mdt-accent-alpha)",
            border: "1.5px solid var(--mdt-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.25rem",
          }}
        >
          <i
            className="fa-solid fa-scale-balanced"
            style={{ fontSize: "1.85rem", color: "var(--mdt-accent)", opacity: 0.6 }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--mdt-text-secondary)",
              marginBottom: "0.4rem",
            }}
          >
            Henüz yönetmelik eklenmedi
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--mdt-text-muted)", maxWidth: 320, lineHeight: 1.6 }}>
            Departman yönetmelikleri, prosedürler ve iç tüzükler burada yayınlanacaktır.
            {isAdmin && (
              <>
                {" "}Eklemek için{" "}
                <span
                  onClick={() => setShowModal(true)}
                  style={{ color: "var(--mdt-accent)", cursor: "pointer", fontWeight: 600 }}
                >
                  Yeni Yönetmelik Ekle
                </span>{" "}
                butonunu kullanın.
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Modal (admin only) ── */}
      {showModal && isAdmin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              background: "var(--mdt-card-bg)",
              border: "1px solid var(--mdt-border)",
              borderRadius: 14,
              padding: "1.75rem",
              width: "100%",
              maxWidth: 560,
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--mdt-text-primary)",
                }}
              >
                Yeni Yönetmelik
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--mdt-text-muted)",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  padding: "0.25rem",
                  borderRadius: 6,
                  transition: "color 0.12s",
                }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--mdt-text-primary)")}
                onMouseOut={e  => (e.currentTarget.style.color = "var(--mdt-text-muted)")}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--mdt-text-muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  Başlık
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Yönetmelik başlığı..."
                  style={{
                    width: "100%",
                    background: "var(--mdt-bg-main)",
                    border: "1px solid var(--mdt-border)",
                    borderRadius: 8,
                    padding: "0.65rem 0.9rem",
                    color: "var(--mdt-text-primary)",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e  => (e.target.style.borderColor = "var(--mdt-accent)")}
                  onBlur={e   => (e.target.style.borderColor = "var(--mdt-border)")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--mdt-text-muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  İçerik
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Yönetmelik içeriği..."
                  rows={8}
                  style={{
                    width: "100%",
                    background: "var(--mdt-bg-main)",
                    border: "1px solid var(--mdt-border)",
                    borderRadius: 8,
                    padding: "0.65rem 0.9rem",
                    color: "var(--mdt-text-primary)",
                    fontSize: "0.875rem",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    transition: "border-color 0.15s",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e  => (e.target.style.borderColor = "var(--mdt-accent)")}
                  onBlur={e   => (e.target.style.borderColor = "var(--mdt-border)")}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem", marginTop: "0.25rem" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: 8,
                    border: "1px solid var(--mdt-border)",
                    background: "none",
                    color: "var(--mdt-text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "var(--mdt-text-secondary)")}
                  onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--mdt-border)")}
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.content.trim()}
                  style={{
                    padding: "0.65rem 1.5rem",
                    borderRadius: 8,
                    border: "1px solid var(--mdt-accent)",
                    background: "var(--mdt-accent)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.65 : 1,
                    transition: "all 0.12s",
                  }}
                  onMouseOver={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = "var(--mdt-accent-hover)"; }}
                  onMouseOut={e  => { if (!saving) (e.currentTarget as HTMLElement).style.background = "var(--mdt-accent)"; }}
                >
                  {saving ? (
                    <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.4rem" }} />Kaydediliyor...</>
                  ) : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
