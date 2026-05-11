"use client";
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
    const ch = supabase.channel("matches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const medal = (i: number) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-1">CLASSEMENT</h1>
        <p className="text-gray-400 text-sm">Mis à jour en temps réel ⚡</p>
      </header>

      {loading && <p className="text-gray-400">Chargement...</p>}

      {!loading && rows.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">Aucun match validé pour le moment.</p>
          <a href="/add-match" className="btn-neon mt-4 inline-flex">+ Ajouter un match</a>
        </div>
      )}

      {/* === Mobile : cards === */}
      {rows.length > 0 && (
        <div className="md:hidden space-y-2">
          {rows.map((r, i) => (
            <div key={r.id} className={`card !p-3 ${i === 0 ? "border-neon/40 bg-neon/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black w-10 text-center">{medal(i)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-base truncate">{r.username}</div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2 flex-wrap">
                    <span><span className="text-neon font-bold">{r.wins}</span>V</span>
                    <span>{r.draws}N</span>
                    <span className="text-red-400">{r.losses}D</span>
                    <span className="text-gray-500">•</span>
                    <span>{r.goals_for}-{r.goals_against}</span>
                    <span className={`font-bold ${r.goal_diff > 0 ? "text-neon" : r.goal_diff < 0 ? "text-red-400" : ""}`}>
                      ({r.goal_diff > 0 ? "+" : ""}{r.goal_diff})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-neon glow-text leading-none">{r.points}</div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider">pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Desktop : table === */}
      {rows.length > 0 && (
        <div className="hidden md:block card overflow-x-auto">
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
