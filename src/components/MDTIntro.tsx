"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MDTIntroProps {
  user: { name: string; badge: string; rank: string } | null;
  onComplete: () => void;
}

export default function MDTIntro({ user, onComplete }: MDTIntroProps) {
  const [phase, setPhase] = useState<"boot" | "badge" | "name" | "rank" | "flash" | "done">("boot");
  const [displayedText, setDisplayedText] = useState("");
  const [showSkip, setShowSkip] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
    return t;
  };

  useEffect(() => {
    const currentTimeouts = timeouts.current;
    setShowSkip(false);
    schedule(() => setShowSkip(true), 800);

    // Phase sequence
    schedule(() => setPhase("badge"), 600);
    schedule(() => setPhase("name"), 1400);

    // Typewriter for name
    if (user?.name) {
      const name = user.name;
      let i = 0;
      schedule(() => {
        const interval = setInterval(() => {
          i++;
          setDisplayedText(name.slice(0, i));
          if (i >= name.length) clearInterval(interval);
        }, 55);
      }, 1600);
    }

    schedule(() => setPhase("rank"), 2600);
    schedule(() => setPhase("flash"), 3800);
    schedule(() => {
      setPhase("done");
      onComplete();
    }, 4400);

    return () => {
      currentTimeouts.forEach(clearTimeout);
    };
  }, [user, onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        animate={phase === "flash" ? { opacity: [1, 0.05, 1, 0] } : { opacity: 1 }}
        transition={phase === "flash" ? { duration: 0.6, times: [0, 0.2, 0.5, 1] } : {}}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <style>{`
          @keyframes scan-line {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes grid-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes corner-draw {
            from { stroke-dashoffset: 120; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes glitch-x {
            0%, 100% { clip-path: none; transform: translate(0); }
            20% { clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); transform: translate(-4px, 0); }
            40% { clip-path: polygon(0 55%, 100% 55%, 100% 70%, 0 70%); transform: translate(4px, 0); }
            60% { clip-path: none; transform: translate(0); }
          }
        `}</style>

        {/* Subtle grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "grid-fade-in 1s ease forwards",
          pointerEvents: "none"
        }} />

        {/* Scanning line */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)",
          animation: "scan-line 3s linear infinite",
          pointerEvents: "none"
        }} />

        {/* Corner decorations */}
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", top: "2rem", left: "2rem", opacity: 0.3 }}>
          <polyline points="0,40 0,0 40,0" fill="none" stroke="#3B82F6" strokeWidth="1.5"
            strokeDasharray="120" style={{ animation: "corner-draw 0.8s ease 0.3s forwards", strokeDashoffset: 120 }} />
        </svg>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", top: "2rem", right: "2rem", transform: "scaleX(-1)", opacity: 0.3 }}>
          <polyline points="0,40 0,0 40,0" fill="none" stroke="#3B82F6" strokeWidth="1.5"
            strokeDasharray="120" style={{ animation: "corner-draw 0.8s ease 0.3s forwards", strokeDashoffset: 120 }} />
        </svg>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", bottom: "2rem", left: "2rem", transform: "scaleY(-1)", opacity: 0.3 }}>
          <polyline points="0,40 0,0 40,0" fill="none" stroke="#3B82F6" strokeWidth="1.5"
            strokeDasharray="120" style={{ animation: "corner-draw 0.8s ease 0.5s forwards", strokeDashoffset: 120 }} />
        </svg>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", bottom: "2rem", right: "2rem", transform: "scale(-1,-1)", opacity: 0.3 }}>
          <polyline points="0,40 0,0 40,0" fill="none" stroke="#3B82F6" strokeWidth="1.5"
            strokeDasharray="120" style={{ animation: "corner-draw 0.8s ease 0.5s forwards", strokeDashoffset: 120 }} />
        </svg>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", textAlign: "center" }}>

          {/* LAPD Logo / System Boot */}
          <AnimatePresence>
            {(phase === "boot" || phase === "badge" || phase === "name" || phase === "rank" || phase === "flash") && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
              >
                {/* Hex Badge */}
                <div style={{ position: "relative", width: "80px", height: "80px" }}>
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <polygon
                      points="40,2 74,21 74,59 40,78 6,59 6,21"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <polygon
                      points="40,10 68,26 68,58 40,72 12,56 12,24"
                      fill="rgba(59,130,246,0.06)"
                      stroke="#3B82F6"
                      strokeWidth="0.5"
                      opacity="0.4"
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#3B82F6", fontSize: "1.6rem"
                  }}>
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  {/* Glow */}
                  <div style={{
                    position: "absolute", inset: "-10px",
                    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                    pointerEvents: "none"
                  }} />
                </div>

                <div style={{ fontSize: "0.65rem", color: "rgba(59,130,246,0.5)", letterSpacing: "0.35em", fontFamily: "monospace", textTransform: "uppercase" }}>
                  LAPD — MOBILE DISPATCH TERMINAL
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge Number */}
          <AnimatePresence>
            {(phase === "badge" || phase === "name" || phase === "rank" || phase === "flash") && (
              <motion.div
                key="badge"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: "0.72rem", color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.25em", fontFamily: "monospace",
                  textTransform: "uppercase", marginBottom: "0.25rem"
                }}
              >
                ROZET #{user?.badge || "———"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HOŞ GELDİNİZ label */}
          <AnimatePresence>
            {(phase === "name" || phase === "rank" || phase === "flash") && (
              <motion.div
                key="welcome-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.3em",
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: "uppercase",
                  marginBottom: "0.1rem"
                }}
              >
                HOŞ GELDİNİZ
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Name — typewriter */}
          <AnimatePresence>
            {(phase === "name" || phase === "rank" || phase === "flash") && (
              <motion.h1
                key="name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: "0.06em",
                  background: "linear-gradient(135deg, #fff 30%, #93c5fd 70%, #c4b5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                  minHeight: "1.1em",
                  animation: phase === "name" ? "glitch-x 0.6s ease 0.2s 1" : "none"
                }}
              >
                {displayedText}
                {/* blinking cursor */}
                {displayedText.length < (user?.name?.length || 0) && (
                  <span style={{ borderRight: "3px solid #60a5fa", marginLeft: "2px", animation: "status-blink 0.7s infinite", WebkitTextFillColor: "#60a5fa" }}>
                    &nbsp;
                  </span>
                )}
              </motion.h1>
            )}
          </AnimatePresence>

          {/* Rank */}
          <AnimatePresence>
            {(phase === "rank" || phase === "flash") && (
              <motion.div
                key="rank"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
              >
                <div style={{ flex: 1, height: "1px", width: "60px", background: "linear-gradient(to right, transparent, rgba(59,130,246,0.4))" }} />
                <span style={{
                  fontSize: "0.78rem",
                  color: "#3B82F6",
                  letterSpacing: "0.2em",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  {user?.rank || "MEMUR"} — LOS ANGELES P.D.
                </span>
                <div style={{ flex: 1, height: "1px", width: "60px", background: "linear-gradient(to left, transparent, rgba(59,130,246,0.4))" }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <AnimatePresence>
            {(phase === "rank" || phase === "flash") && (
              <motion.div
                key="loadbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{ marginTop: "2.5rem", width: "280px" }}
              >
                <div style={{
                  height: "2px", backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: "2px", overflow: "hidden"
                }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "linear" }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                      borderRadius: "2px",
                      boxShadow: "0 0 8px rgba(59,130,246,0.6)"
                    }}
                  />
                </div>
                <div style={{ marginTop: "0.6rem", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", fontFamily: "monospace", textAlign: "center" }}>
                  SİSTEM YETKİLENDİRMESİ TAMAMLANDI
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip button */}
        <AnimatePresence>
          {showSkip && phase !== "flash" && (
            <motion.button
              key="skip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { timeouts.current.forEach(clearTimeout); setPhase("done"); onComplete(); }}
              style={{
                position: "absolute",
                bottom: "2.5rem", right: "2.5rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
                padding: "0.4rem 1rem",
                borderRadius: "6px",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "monospace",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              GEÇ →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
