import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* The heading face. Packages sharing one face are hard to tell apart. */
const display = Bricolage_Grotesque({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700"],
});

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  applicationName: "use-first-interaction",
  description:
    "A React hook that reports the first time a visitor touches the page, so analytics, chat widgets and heatmap recorders load then instead of during the first paint.",
  formatDetection: { telephone: false },
  metadataBase: new URL("https://use-first-interaction.kkweb.io"),
  title: "use-first-interaction - Load It When They Arrive",
};

export const viewport: Viewport = {
  themeColor: "#120c0e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
