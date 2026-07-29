"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--text-muted)' }}></i>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
        borderRadius: '8px',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
      title={isDark ? "Aydınlık Temaya Geç" : "Karanlık Temaya Geç"}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover-subtle)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
      }}
    >
      {isDark ? (
        <i className="fa-solid fa-sun" style={{ fontSize: '1rem', color: '#F59E0B' }} />
      ) : (
        <i className="fa-solid fa-moon" style={{ fontSize: '1rem', color: '#6366F1' }} />
      )}
    </button>
  );
}
