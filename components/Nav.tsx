"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const loadPending = async (userId: string) => {
    const { data: pending } = await supabase
      .from("matches")
      .select("player1_id, player2_id, validated_by_p1, validated_by_p2")
      .eq("status", "pending")
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);
    const tv = (pending ?? []).filter((m: any) => {
      const isP1 = m.player1_id === userId;
      return isP1 ? !m.validated_by_p1 : !m.validated_by_p2;
    }).length;

    const { count: myRejected } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected")
      .eq("created_by", userId);

    const { data: disputed } = await supabase
      .from("matches")
      .select("player1_id, player2_id")
      .eq("status", "disputed");
    const ta = (disputed ?? []).filter((m: any) =>
      m.player1_id !== userId && m.player2_id !== userId
    ).length;

    setPendingCount(tv + (myRejected ?? 0) + ta);
  };

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadPending(data.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadPending(session.user.id);
      else setPendingCount(0);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("nav-pending")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" },
        () => loadPending(user.id))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-lg sm:text-xl glow-text text-neon">
          <span className="text-xl sm:text-2xl">⚽</span>
          <span>FC<span className="text-white">TRACKER</span></span>
        </Link>

        {/* Desktop nav links */}
        {mounted && user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition ${
                  pathname === l.href ? "text-neon bg-neon/10" : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              className={`relative px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition ${
                pathname === "/notifications" ? "text-neon bg-neon/10" : "text-gray-400 hover:text-white"
              }`}
            >
              🔔
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-accent">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Bouton compte (visible partout) */}
        <div className="flex items-center gap-2">
          {mounted && user ? (
            <button onClick={signOut} className="btn-ghost !py-1.5 !px-3 text-[10px] sm:text-xs">
              Déconnexion
            </button>
          ) : mounted ? (
            <Link href="/login" className="btn-neon !py-1.5 !px-3 text-[10px] sm:text-xs">
              Connexion
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
