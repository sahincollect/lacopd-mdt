"use client";

import { useEffect } from "react";

export default function AdminGifPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromPath = params.get("from") || window.location.pathname;
    fetch("/api/honeypot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: fromPath,
        screen: `${window.screen.width}x${window.screen.height}`,
      }),
    }).catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://media.giphy.com/media/VkpfO6W4D7yB7vSjXy/giphy.gif"
        alt="No"
        style={{
          maxWidth: "100%",
          maxHeight: "85vh",
          borderRadius: "8px",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
