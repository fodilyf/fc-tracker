"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Match = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
  notes: string | null;
  created_by: string | null;
  p1: { username: string } | null;
  p2: { username: string } | null;
};

export default function History() {
  const supabase = createClient();
  const [me, setMe] = useState<any>(null);
  const [items, setItems] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user);
    const { data } = await supabase
      .from("matches")
      .select(`
        id, player1_id, player2_id, player1_score, player2_score,
        team1, team2, played_at, notes, created_by,
        p1:profiles!matches_player1_id_fkey(username),
        p2:profiles!matches_player2_id_fkey(username)
      `)
      .order("played_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("matches-hist")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce match ?")) return;
    await supabase.from("matches").delete().eq("id", id);
    load();
  };

  const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black mb-1">HISTORIQUE</h1>
          <p className="text-gray-400">Les 100 derniers matchs</p>
        </div>
        <a href="/add-match" className="btn-neon">+ Match</a>
      </header>

      {loading && <p className="text-gray-400">Chargement...</p>}

      <div className="space-y-3">
        {items.map((m) => {
          const win1 = m.player1_score > m.player2_score;
          const win2 = m.player2_score > m.player1_score;
          return (
            <div key={m.id} className="card flex items-center gap-4">
              <div className="text-xs text-gray-500 w-24 hidden md:block">{fmt(m.played_at)}</div>

              <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className={`text-right ${win1 ? "text-neon" : "text-gray-300"}`}>
                  <div className="font-bold">{m.p1?.username ?? "?"}</div>
                  {m.team1 && <div className="text-xs text-gray-500">{m.team1}</div>}
                </div>

                <div className="flex items-center gap-3 text-3xl font-black">
                  <span className={win1 ? "text-neon glow-text" : ""}>{m.player1_score}</span>
                  <span className="text-gray-600">—</span>
                  <span className={win2 ? "text-neon glow-text" : ""}>{m.player2_score}</span>
                </div>

                <div className={`text-left ${win2 ? "text-neon" : "text-gray-300"}`}>
                  <div className="font-bold">{m.p2?.username ?? "?"}</div>
                  {m.team2 && <div className="text-xs text-gray-500">{m.team2}</div>}
                </div>
              </div>

              {me && m.created_by === me.id && (
                <button
                  onClick={() => remove(m.id)}
                  className="text-red-400 hover:text-red-300 text-xs uppercase font-bold"
                  title="Supprimer"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">Pas encore de matchs.</p>
        </div>
      )}
    </div>
  );
}
