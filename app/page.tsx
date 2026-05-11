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
    <div className="text-center py-10 sm:py-16">
      <div className="inline-block mb-4 px-3 py-1 rounded-full border border-neon/30 bg-neon/5 text-neon text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        ⚽ Score Hub
      </div>

      <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4">
        FC<span className="text-neon glow-text">TRACKER</span>
      </h1>

      <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
        {mounted && user
          ? `Salut, prêt à enregistrer un nouveau match ? 🔥`
          : "Le tableau de bord ultime pour suivre vos matchs FC entre potes. Classement, historique, stats par duo, et le système de titres légendaire."}
      </p>

      {/* CTA — change selon l'état de connexion */}
      <div className="flex flex-wrap gap-3 justify-center px-4">
        {!mounted ? null : user ? (
          <>
            <Link href="/add-match" className="btn-neon !text-base !px-6 !py-3">⚽ + Match</Link>
            <Link href="/leaderboard" className="btn-ghost !text-base !px-6 !py-3">🏆 Classement</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-neon !text-base !px-6 !py-3">Commencer</Link>
            <Link href="/leaderboard" className="btn-ghost !text-base !px-6 !py-3">Voir le classement</Link>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20 text-left px-2">
        <div className="card">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-neon font-black uppercase tracking-wider text-sm sm:text-base">Classement live</h3>
          <p className="text-gray-400 text-sm mt-2">
            Points, ratio de victoires, différence de buts. Mis à jour en temps réel.
          </p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">⚔️</div>
          <h3 className="text-neon font-black uppercase tracking-wider text-sm sm:text-base">Duels (head-to-head)</h3>
          <p className="text-gray-400 text-sm mt-2">
            Compare-toi à n'importe lequel de tes potes : qui domine vraiment ?
          </p>
        </div>
        <div className="card sm:col-span-2 md:col-span-1">
          <div className="text-3xl mb-2">🥩</div>
          <h3 className="text-neon font-black uppercase tracking-wider text-sm sm:text-base">Système de titres</h3>
          <p className="text-gray-400 text-sm mt-2">
            3 défaites de suite ? Tu deviens le <span className="text-yellow-400">lkebda</span>. 5 ? <span className="text-pink-400">zawja</span>. 10 ? <span className="text-red-500">l9a7ba</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
