"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Row = {
  id: string; username: string;
  played: number; wins: number; draws: number; losses: number;
  goals_for: number; goals_against: number; goal_diff: number;
  points: number; win_rate: number;
};

export default function Leaderboard() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("v_leaderboard")
      .select("*")
      .order("points", { ascending: false })
      .order("goal_diff", { ascending: false });
    if (!error && data) setRows(data as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Realtime: re-fetch on any match insert/update/delete
    const ch = supabase.channel("matches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const medal = (i: number) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-black mb-1">CLASSEMENT</h1>
        <p className="text-gray-400">Mis à jour en temps réel ⚡</p>
      </header>

      {loading && <p className="text-gray-400">Chargement...</p>}

      {!loading && rows.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">Aucun match enregistré.</p>
          <a href="/add-match" className="btn-neon mt-4">Ajouter le premier match</a>
        </div>
      )}

      {rows.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 uppercase text-xs tracking-wider border-b border-border">
                <th className="text-left py-3 pr-2">#</th>
                <th className="text-left py-3 pr-2">Joueur</th>
                <th className="text-right py-3 px-2">J</th>
                <th className="text-right py-3 px-2">V</th>
                <th className="text-right py-3 px-2">N</th>
                <th className="text-right py-3 px-2">D</th>
                <th className="text-right py-3 px-2">BP</th>
                <th className="text-right py-3 px-2">BC</th>
                <th className="text-right py-3 px-2">+/-</th>
                <th className="text-right py-3 px-2">%V</th>
                <th className="text-right py-3 pl-2 text-neon">PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={`border-b border-border/50 ${i === 0 ? "bg-neon/5" : ""}`}>
                  <td className="py-3 pr-2 font-bold">{medal(i)}</td>
                  <td className="py-3 pr-2 font-bold">{r.username}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{r.played}</td>
                  <td className="py-3 px-2 text-right text-neon font-bold">{r.wins}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{r.draws}</td>
                  <td className="py-3 px-2 text-right text-red-400">{r.losses}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{r.goals_for}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{r.goals_against}</td>
                  <td className={`py-3 px-2 text-right font-bold ${r.goal_diff > 0 ? "text-neon" : r.goal_diff < 0 ? "text-red-400" : "text-gray-300"}`}>
                    {r.goal_diff > 0 ? "+" : ""}{r.goal_diff}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-300">{r.win_rate}%</td>
                  <td className="py-3 pl-2 text-right text-neon font-black text-base">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
