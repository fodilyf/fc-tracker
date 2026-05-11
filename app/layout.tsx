import "./globals.css";
import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import FabAddMatch from "@/components/FabAddMatch";

// Force toutes les pages en rendu dynamique (pas de prerender statique)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "FC Tracker — Score Hub",
  description: "Track your FIFA / FC matches with friends",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FC Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Nav />
        <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-28 md:pb-20">
          {children}
        </main>
        <MobileNav />
        <FabAddMatch />
      </body>
    </html>
  );
}
