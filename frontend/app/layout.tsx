import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaskOff Poker",
  description: "Moscow poker club management",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div style={{ position: "relative", zIndex: 1 }}>
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", maxWidth: "calc(100vw - 220px)" }}>
        {children}
      </main>
    </div>
  );
}

function Sidebar() {
  const links = [
    { href: "/",             label: "Tournaments", icon: "♠" },
    { href: "/leaderboard",  label: "Leaderboard", icon: "♦" },
    { href: "/admin",        label: "Admin",        icon: "⚙" },
  ];

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "var(--felt-edge)",
        borderRight: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 1.25rem 1.5rem" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 900,
            color: "var(--gold)",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          MASK<span style={{ color: "var(--text-primary)" }}>OFF</span>
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginTop: "0.2rem",
          }}
        >
          Poker Club · Moscow
        </div>
      </div>

      <div className="gold-divider-sm" style={{ margin: "0 1.25rem 1rem" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {links.map((link) => (
          <a key={link.href} href={link.href} className="nav-link">
            <span style={{ fontSize: "1rem", width: "1.2rem", textAlign: "center" }}>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>

      {/* Footer suits */}
      <div
        style={{
          padding: "1rem 1.25rem 0.5rem",
          display: "flex",
          justifyContent: "center",
          gap: "0.6rem",
          fontSize: "0.9rem",
          opacity: 0.3,
          color: "var(--text-primary)",
        }}
      >
        <span>♠</span>
        <span style={{ color: "#c0392b" }}>♥</span>
        <span style={{ color: "#c9a84c" }}>♦</span>
        <span>♣</span>
      </div>
    </aside>
  );
}