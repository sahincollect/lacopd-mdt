import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import SpotlightCursor from "../components/SpotlightCursor";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "../components/ThemeProvider";
import ImageRightClickPreventer from "../components/ImageRightClickPreventer";

export const metadata: Metadata = {
  title: "LAC Portal - Los Angeles Community",
  description: "Los Angeles Community Memur Paneli ve Veritabanı Sistemi",
  icons: {
    icon: [{ url: "/logom.png", type: "image/png" }],
    apple: "/logom.png",
    shortcut: "/logom.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      style={
        {
          "--font-inter": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          "--font-oswald": "'Oswald', -apple-system, sans-serif",
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap"
        />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh", margin: 0 }}>
        <MotionConfig reducedMotion="never">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <SpotlightCursor />
            <ImageRightClickPreventer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                },
                success: {
                  iconTheme: { primary: "var(--color-success)", secondary: "var(--bg-secondary)" },
                },
                error: {
                  iconTheme: { primary: "var(--color-danger)", secondary: "var(--bg-secondary)" },
                },
              }}
            />
            <Navigation />
            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
            <Footer />
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
