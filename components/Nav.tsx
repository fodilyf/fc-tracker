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
    // 1) Matchs PENDING où je suis joueur ET pas encore validé
    const { data: pending } = await supabase
      .from("matches")
      .select("player1_id, player2_id, validated_by_p1, validated_by_p2")
      .eq("status", "pending")
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);
    const toValidate = (pending ?? []).filter((m: any) => {
      const isP1 = m.player1_id === userId;
      return isP1 ? !m.validated_by_p1 : !m.validated_by_p2;
    }).length;

    // 2) Mes matchs REJECTED (créés par moi)
    const { count: myRejected } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected")
      .eq("created_by", userId);

    // 3) Litiges DISPUTED où je ne suis NI player1 NI player2
    const { data: disputed } = await supabase
      .from("matches")
      .select("player1_id, player2_id")
      .eq("status", "disputed");
    const toArbitrate = (disputed ?? []).filter((m: any) =>
      m.player1_id !== userId && m.player2_id !== userId
    ).length;

    setPendingCount(toValidate + (myRejected ?? 0) + toArbitrate);
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

  // Realtime : recompter quand des matchs changent
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
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-xl glow-text text-neon">
          <span className="text-2xl">⚽</span>
          <span>FC<span className="text-white">TRACKER</span></span>
        </Link>

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
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-accent animate-pulse-neon">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          {mounted && user ? (
            <button onClick={signOut} className="btn-ghost !py-1.5 !px-3 text-xs">
              Déconnexion
            </button>
          ) : mounted ? (
            <Link href="/login" className="btn-neon !py-1.5 !px-3 text-xs">
              Connexion
            </Link>
          ) : null}
        </div>
      </div>

      {mounted && user && (
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
          <Link
            href="/notifications"
            className={`relative px-3 py-2 text-xs font-bold uppercase whitespace-nowrap ${
              pathname === "/notifications" ? "text-neon" : "text-gray-400"
            }`}
          >
            🔔
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 bg-accent text-white text-[9px] font-black rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
}
