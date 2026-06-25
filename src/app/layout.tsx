import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME_FULL } from "@/components/brand";
import { Providers } from "@/components/providers";
import { AmbientBackground } from "@/components/ambient/ambient-background";

// Design system type (Fullhouse neon reskin): confident grotesk display, clean
// sans UI, mono for figures.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Canonical site URL — used to resolve the share image to an absolute URL.
// Set NEXT_PUBLIC_SITE_URL on the host once the real domain is live; falls back
// to the current Railway deployment so share cards work today.
// Resolved defensively: an empty, protocol-less, or malformed value must NEVER
// throw here, because this runs at module load and would crash every page.
function resolveSiteUrl(): string {
  const fallback = "https://web-production-c5fb7.up.railway.app";
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}
const SITE_URL = resolveSiteUrl();

const TITLE = `${APP_NAME_FULL} — Private real-money poker on Solana`;
const SHARE_DESC =
  "Private real-money poker on Solana — transparent hands, instant crypto settlement. Real money. Real nerve. After dark.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${APP_NAME_FULL}`,
  },
  description: SHARE_DESC,
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/fullhouse-chip.svg", type: "image/svg+xml" }],
    shortcut: "/fullhouse-chip.svg",
    apple: "/fullhouse-chip.svg",
  },
  // Open Graph (Facebook, Discord, iMessage, etc.). The share image comes from
  // src/app/opengraph-image.tsx, which Next injects automatically.
  openGraph: {
    type: "website",
    siteName: APP_NAME_FULL,
    title: TITLE,
    description: SHARE_DESC,
    url: "/",
  },
  // Twitter/X card — `summary_large_image` uses the same generated share image.
  twitter: {
    card: "summary_large_image",
    site: "@_FullHousePoker",
    creator: "@_FullHousePoker",
    title: TITLE,
    description: SHARE_DESC,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">
        <AmbientBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
