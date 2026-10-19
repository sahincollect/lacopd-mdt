"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const AUTOG_REPLIES = [
  "İmza talebin sıraya alındı ufaklık! Komuta ekibimiz senin bu çaresiz denemene gülmeyi bitirdiğinde belki bir gün yanıt verir.",
  "Bakıyoruz da çok ısrarcısın! Tamam söz, bir sonraki devriyede ekip otosunun camından sana el sallayacağız.",
  "3. kez bastın... Bize olan bu platonik hayranlığın artık gözlerimizi yaşartıyor. Duvarına LAPD posteri de astın mı?",
  "Hâlă buradasın! Merak etme, IP adresini 'Ayın En Sadık Takipçisi' panomuza altın harflerle astık bile.",
  "Yeterince imza dilendin şampiyon. Şimdi sütünü içip yatma vakti, yarın okulun/işin vardır."
];

export default function AdminFanClubTrapPage() {
  const [visitorInfo, setVisitorInfo] = useState<{
    ip: string;
    userAgent: string;
    fanNumber: number;
    screen: string;
    time: string;
    attemptedPath: string;
  }>({
    ip: "Tespit ediliyor...",
    userAgent: "Analiz ediliyor...",
    fanNumber: 1,
    screen: "Bilinmiyor",
    time: new Date().toLocaleString("tr-TR"),
    attemptedPath: "/admin",
  });

  const [begCount, setBegCount] = useState(0);
  const [promised, setPromised] = useState(false);
  const [fakeInput, setFakeInput] = useState("");
  const [fakeTryMsg, setFakeTryMsg] = useState("");

  useEffect(() => {
    const screenStr = `${window.screen.width}x${window.screen.height}`;
    const params = new URLSearchParams(window.location.search);
    const fromPath = params.get("from") || window.location.pathname;

    fetch("/api/honeypot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: fromPath,
        screen: screenStr,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setVisitorInfo({
          ip: data.ip || "Kaydedildi",
          userAgent: data.userAgent || navigator.userAgent,
          fanNumber: data.fanNumber || 1,
          screen: screenStr,
          time: new Date().toLocaleString("tr-TR"),
          attemptedPath: fromPath,
        });
      })
      .catch(() => {
        setVisitorInfo((prev) => ({
          ...prev,
          ip: "Loglandı",
          userAgent: navigator.userAgent,
          screen: screenStr,
        }));
      });
  }, []);

  const handleFakePasswordTry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeInput.trim()) return;
    setFakeTryMsg(
      `"${fakeInput}" mi? 😂 Harika deneme Sherlock! Bu yazdığın kelimeyi de IP kaydının yanına ekledik ki yönetim ekibimiz çay içerken ekstra eğlensin.`
    );
    setFakeInput("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.16) 0%, rgba(15, 23, 42, 0.98) 55%, #050811 100%)",
        color: "#F8FAFC",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "3rem 1.5rem 5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Floating Badges */}
      <div
        style={{
          maxWidth: "880px",
          width: "100%",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
        }}
      >
        {/* Top Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "0.9rem 1.4rem",
            borderRadius: "14px",
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid rgba(236, 72, 153, 0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.3rem" }}>💖</span>
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  color: "#F472B6",
                  textTransform: "uppercase",
                }}
              >
                LAPD PUBLIC RELATIONS • VIP FAN CLUB LOUNGE
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FCE7F3" }}>
                Gizli Hayran & Özentilik Karşılama Noktası ({visitorInfo.attemptedPath})
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(244, 114, 182, 0.2)",
              border: "1px solid rgba(244, 114, 182, 0.45)",
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#FBCFE8",
            }}
          >
            👑 #{visitorInfo.fanNumber}. Sazan Hayranımızsın
          </div>
        </motion.div>

        {/* Main Mocking Hero Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "2.5rem",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <img
              src="/logom.png"
              alt="LACPD"
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                border: "2px solid #F472B6",
                objectFit: "cover",
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                }}
              >
                Hoş Geldin Küçük Hayranımız! 🥺
              </h1>
              <p style={{ margin: "0.25rem 0 0", color: "#F472B6", fontWeight: 700, fontSize: "0.92rem" }}>
                Bize bu kadar özenmen ve yerimizde olmak istemen inanın gözlerimizi yaşarttı.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              color: "#CBD5E1",
              fontSize: "0.96rem",
              lineHeight: 1.7,
              background: "rgba(0, 0, 0, 0.28)",
              padding: "1.5rem",
              borderRadius: "16px",
              borderLeft: "4px solid #F472B6",
            }}
          >
            <p style={{ margin: 0 }}>
              Tarayıcı çubuğuna titreyen ellerinle{" "}
              <code
                style={{
                  background: "rgba(244, 114, 182, 0.15)",
                  color: "#F472B6",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "6px",
                  fontWeight: 800,
                }}
              >
                {visitorInfo.attemptedPath}
              </code>{" "}
              yazarken kalbinin nasıl küt küt attığını, <em>&quot;Acaba açık bulabilir miyim? Acaba ben de onlar gibi havalı olabilir miyim?&quot;</em> diye kurduğun hayalleri buradan görebiliyoruz. Çok tatlısın, gerçekten.
            </p>
            <p style={{ margin: 0 }}>
              Yıl olmuş 2026, hâlâ URL&apos;nin sonuna <strong>/admin</strong> yazarak bir yere sızabileceğini sanacak kadar masum olman içimizi ısıttı. Seni eli boş göndermek istemedik; bize duyduğun bu derin hayranlığın ve özentiliğin hatırına adına özel bir <strong>Resmi Hayran Kulübü Kartı</strong> bastık!
            </p>
          </div>

          {/* Official Fanboy Certificate Card */}
          <div
            style={{
              marginTop: "1.75rem",
              background:
                "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
              border: "1px dashed rgba(244, 114, 182, 0.5)",
              borderRadius: "18px",
              padding: "1.6rem",
              position: "relative",
            }}
          >
            {promised && (
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "18px",
                  border: "2px solid #34D399",
                  color: "#34D399",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "8px",
                  fontWeight: 900,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  transform: "rotate(6deg)",
                  background: "rgba(16, 185, 129, 0.12)",
                }}
              >
                ✓ USLU HAYRAN SÖZÜ ALINDI
              </div>
            )}

            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#F472B6",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              📜 LAPD RESMİ HAYRAN &amp; ÖZENTİLİK SERTİFİKASI (OTOMATİK KAYIT)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 800 }}>HAYRAN IP ADRESİ</div>
                <div style={{ fontSize: "0.95rem", color: "#38BDF8", fontWeight: 800, marginTop: "0.2rem", fontFamily: "monospace" }}>
                  {visitorInfo.ip}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 800 }}>HAYRANLIK SEVİYESİ</div>
                <div style={{ fontSize: "0.88rem", color: "#F472B6", fontWeight: 800, marginTop: "0.2rem" }}>
                  Gizli Stalker / Aşırı Özenen
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 800 }}>EKRAN &amp; ZAMAN</div>
                <div style={{ fontSize: "0.85rem", color: "#E2E8F0", fontWeight: 700, marginTop: "0.2rem" }}>
                  {visitorInfo.screen} • {visitorInfo.time}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 800 }}>HOBİSİ</div>
                <div style={{ fontSize: "0.85rem", color: "#FBBF24", fontWeight: 700, marginTop: "0.2rem" }}>
                  URL&apos;ye /admin yazıp umutlanmak
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "0.85rem",
                background: "rgba(0,0,0,0.3)",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.75rem",
                color: "#94A3B8",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <strong style={{ color: "#CBD5E1" }}>Cihaz Parmak İzi:</strong> {visitorInfo.userAgent}
            </div>

            <div
              style={{
                marginTop: "0.85rem",
                fontSize: "0.75rem",
                color: "#94A3B8",
                fontStyle: "italic",
              }}
            >
              * Bu karttaki IP adresin ve cihaz bilgilerin, Yüksek Komuta ekibimizin kahve molasında gülmesi için &quot;Günün Hayranları&quot; veritabanına kaydedilmiştir.
            </div>
          </div>

          {/* Interactive Toy Console for the "Attacker" */}
          <div
            style={{
              marginTop: "1.5rem",
              background: "rgba(0, 0, 0, 0.25)",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#E2E8F0", marginBottom: "0.6rem" }}>
              🎮 Hevesin Kursakta Kalmasın: Oyuncak Şifre Deneme Kutusu
            </div>
            <p style={{ margin: "0 0 0.85rem", fontSize: "0.8rem", color: "#94A3B8" }}>
              O kadar gelmişsin, içinde kalmasın. Aşağıya <code>admin123</code> veya <code>123456</code> falan yazıp dene, kendini hacker gibi hisset:
            </p>
            <form onSubmit={handleFakePasswordTry} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={fakeInput}
                onChange={(e) => setFakeInput(e.target.value)}
                placeholder="Örn: admin / 123456 / root..."
                style={{
                  flex: "1 1 220px",
                  padding: "0.65rem 1rem",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#FFF",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.65rem 1.25rem",
                  borderRadius: "10px",
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  color: "#38BDF8",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Şansımı Dene 🤡
              </button>
            </form>
            {fakeTryMsg && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  color: "#FDE68A",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {fakeTryMsg}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.85rem",
              marginTop: "1.75rem",
            }}
          >
            <button
              onClick={() => setBegCount((c) => c + 1)}
              style={{
                flex: "1 1 220px",
                padding: "0.9rem 1.25rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
                border: "none",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(236, 72, 153, 0.3)",
              }}
            >
              ✍️ Üst Komutadan Islak İmza İste {begCount > 0 ? `(${begCount})` : ""}
            </button>

            <button
              onClick={() => setPromised(true)}
              style={{
                flex: "1 1 220px",
                padding: "0.9rem 1.25rem",
                borderRadius: "12px",
                background: promised ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${promised ? "rgba(16, 185, 129, 0.45)" : "rgba(255, 255, 255, 0.12)"}`,
                color: promised ? "#34D399" : "#E2E8F0",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {promised
                ? "🍼 Söz Verildi: Büyüyünce Sizin Gibi Olacağım"
                : "🍼 Büyüyünce Ben De Sizin Gibi Olacağım (Söz Ver)"}
            </button>

            <Link
              href="/basvurular/memur"
              style={{
                flex: "1 1 220px",
                padding: "0.9rem 1.25rem",
                borderRadius: "12px",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38BDF8",
                fontWeight: 800,
                fontSize: "0.85rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              📋 Çok Özeniyorsan Ön Kapıdan Başvur
            </Link>
          </div>

          <AnimatePresence>
            {begCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: "1rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  background: "rgba(236, 72, 153, 0.12)",
                  border: "1px solid rgba(236, 72, 153, 0.35)",
                  color: "#FBCFE8",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                }}
              >
                💬 <strong>Halkla İlişkiler Yanıtı:</strong>{" "}
                {AUTOG_REPLIES[Math.min(begCount - 1, AUTOG_REPLIES.length - 1)]}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "#64748B",
              fontSize: "0.82rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Ana Sayfaya Dön (Uslu Bir Ziyaretçi Olarak)
          </Link>
        </div>
      </div>
    </div>
  );
}
