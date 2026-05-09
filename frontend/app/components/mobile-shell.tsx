"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Games", icon: "♠" },
  { href: "/leaderboard", label: "Ranks", icon: "♦" },
  { href: "/profile", label: "Me", icon: "♣" },
  { href: "/admin", label: "Admin", icon: "⚙" },
];

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Link href="/" className="brand" aria-label="MaskOff home">
          <span className="brand-mark">♠</span>
          <span>
            <strong>MASK<span>OFF</span></strong>
            <em>Poker Club</em>
          </span>
        </Link>
        <div className="live-pill"><span /> Telegram Mini App</div>
      </header>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={active ? "bottom-nav-link active" : "bottom-nav-link"}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <section className="page-header animate-in">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action ? <div className="page-action">{action}</div> : null}
    </section>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "success" | "danger"; title: string; children: ReactNode }) {
  return (
    <div className={`notice notice-${tone}`}>
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}