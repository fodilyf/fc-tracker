"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function FabAddMatch() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // On cache le FAB sur la page d'ajout elle-même
  if (!mounted || !user || pathname === "/add-match" || pathname === "/login") return null;

  return (
    <Link
      href="/add-match"
      aria-label="Ajouter un match"
      className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
      style={{
        background: "linear-gradient(135deg, #00ff87 0%, #00cc6a 100%)",
        color: "#0a0e1a",
        boxShadow: "0 0 30px rgba(0, 255, 135, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      +
    </Link>
  );
}
