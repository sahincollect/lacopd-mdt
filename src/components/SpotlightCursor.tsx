"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SpotlightCursor() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const pathname = usePathname();

  // MDT sayfalarında ışığı devre dışı bırak
  const isMdt = pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali');

  useEffect(() => {
    if (isMdt) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMdt]);

  if (isMdt) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9998,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.07), transparent 40%)`,
        }}
      />
    </>
  );
}
