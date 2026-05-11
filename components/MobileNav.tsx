"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const items = [
  { href: "/leaderboard",  label: "Classmt",   icon: "🏆" },
  { href: "/history",      label: "Histo",     icon: "📜" },
  { href: "/duels",        label: "Duels",     icon: "⚔️" },
  { href: "/stats",        label: "Stats",     icon: "📊" },
  { href: "/notifications",label: "Notifs",    icon: "🔔", showBadge: true },
];

export default function MobileNav() {
  const pathname = usePathname();
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
    const ch = supabase.channel("mobnav-pending")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" },
        () => loadPending(user.id))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (!mounted || !user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition ${
                active ? "text-neon" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{it.label}</span>
              {it.showBadge && pendingCount > 0 && (
                <span className="absolute top-1 right-1/2 translate-x-4 bg-accent text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon rounded-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
