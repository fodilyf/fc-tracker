"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  return (
    <div className="text-center pt-6 sm:pt-12 pb-10">
      {/* Badge SCORE HUB */}
      <div className="inline-block mb-5 px-3 py-1 rounded-full border border-neon/30 bg-neon/5 text-neon text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
        ⚽ Score Hub
      </div>

      {/* Hero title */}
      <h1 className="font-display text-[64px] sm:text-[96px] md:text-[120px] leading-[0.85] tracking-wider mb-5">
        <span className="text-white">FC</span>
        <span className="text-neon glow-text-strong">TRACKER</span>
      </h1>

      {/* Tagline */}
      <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 px-2 leading-relaxed">
        {mounted && user
          ? "Salut champion, prêt à enregistrer un nouveau match ? 🔥"
          : "Le tableau de bord ultime pour suivre vos matchs FC entre potes. Classement, historique, stats par duo, et le système de titres légendaire."}
      </p>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 justify-center px-4 mb-16 sm:mb-24">
        {!mounted ? null : user ? (
          <>
            <Link href="/add-match" className="btn-neon !text-base !px-7 !py-3.5">⚽ + Match</Link>
            <Link href="/leaderboard" className="btn-ghost !text-base !px-7 !py-3.5">🏆 Classement</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-neon !text-base !px-7 !py-3.5">Commencer</Link>
            <Link href="/leaderboard" className="btn-ghost !text-base !px-7 !py-3.5">Voir le classement</Link>
          </>
        )}
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-left px-2">
        <div className="card card-hover stagger-item">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-display text-neon text-xl tracking-widest mb-2">Classement live</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Points, ratio de victoires, différence de buts. Mis à jour en temps réel.
          </p>
        </div>
        <div className="card card-hover stagger-item">
          <div className="text-4xl mb-3">⚔️</div>
          <h3 className="font-display text-neon text-xl tracking-widest mb-2">Duels (head-to-head)</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Compare-toi à n'importe lequel de tes potes : qui domine vraiment ?
          </p>
        </div>
        <div className="card card-hover stagger-item sm:col-span-2 md:col-span-1">
          <div className="text-4xl mb-3">🥩</div>
          <h3 className="font-display text-neon text-xl tracking-widest mb-2">Système de titres</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            3 défaites de suite ? Tu deviens le <span className="text-yellow-400 font-bold">lkebda</span>. 5 ? <span className="text-pink-400 font-bold">zawja</span>. 10 ? <span className="text-purple font-bold">l9a7ba</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
