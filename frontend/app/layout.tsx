import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { MobileShell } from "@/app/components/mobile-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaskOff Poker",
  description: "Mobile Telegram Mini App for MaskOff Poker tournaments",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a1f12",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}