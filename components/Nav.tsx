"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const links = [
  { href: "/leaderboard", label: "Classement" },
  { href: "/add-match",   label: "+ Match" },
  { href: "/history",     label: "Historique" },
  { href: "/duels",       label: "Duels" },
  { href: "/stats",       label: "Stats" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-xl glow-text text-neon">
          <span className="text-2xl">⚽</span>
          <span>FC<span className="text-white">TRACKER</span></span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition ${
                  pathname === l.href
                    ? "text-neon bg-neon/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={signOut} className="btn-ghost !py-1.5 !px-3 text-xs">
              Déconnexion
            </button>
          ) : (
            <Link href="/login" className="btn-neon !py-1.5 !px-3 text-xs">
              Connexion
            </Link>
          )}
        </div>
      </div>

      {user && (
        <div className="md:hidden border-t border-border flex overflow-x-auto px-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 text-xs font-bold uppercase whitespace-nowrap ${
                pathname === l.href ? "text-neon" : "text-gray-400"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
