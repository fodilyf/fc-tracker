import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";

// Force toutes les pages en rendu dynamique (pas de prerender statique)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "FC Tracker — Score Hub",
  description: "Track your FIFA / FC matches with friends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">{children}</main>
      </body>
    </html>
  );
}
