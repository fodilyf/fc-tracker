"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { getDisplayAvatar } from "@/lib/avatar";
import { type Title } from "@/lib/titles";

type Row = {
  id: string; username: string;
  played: number; wins: number; draws: number; losses: number;
  goals_for: number; goals_against: number; goal_diff: number;
  points: number; win_rate: number;
};

type Extra = { emoji: string | null; favorite_color: string | null; worst_title: Title };

export default function Leaderboard() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [extras, setExtras] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: lb } = await supabase
      .from("v_leaderboard").select("*")
      .order("points", { ascending: false })
      .order("goal_diff", { ascending: false });
    setRows((lb ?? []) as Row[]);

    // Récup emoji + couleur + worst_title pour chaque joueur
    const { data: profs } = await supabase
      .from("profiles").select("id, emoji, favorite_color");
    const { data: titles } = await supabase
      .from("v_player_worst_title").select("player_id, worst_title");
    const ex: Record<string, Extra> = {};
    (profs ?? []).forEach((p: any) => {
      ex[p.id] = { emoji: p.emoji, favorite_color: p.favorite_color, worst_title: null };
    });
    (titles ?? []).forEach((t: any) => {
      if (ex[t.player_id]) ex[t.player_id].worst_title = t.worst_title;
    });
    setExtras(ex);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("matches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
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
          {rows.map((r, i) => {
            const e = extras[r.id];
            const avatar = getDisplayAvatar(e?.emoji, e?.worst_title ?? null);
            const color = e?.favorite_color || "#00ff87";
            return (
              <Link key={r.id} href={`/player/${encodeURIComponent(r.username)}`}
                className={`card !p-3 flex items-center gap-3 transition active:scale-[0.98] ${i === 0 ? "border-neon/40 bg-neon/5" : ""}`}>
                <div className="text-base font-black w-6 text-center text-gray-400">{medal(i)}</div>
                <div className="text-3xl w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: color, boxShadow: `0 0 12px ${color}30` }}>
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-base truncate">{r.username}</div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2 flex-wrap">
                    <span><span className="text-neon font-bold">{r.wins}</span>V</span>
                    <span>{r.draws}N</span>
                    <span className="text-red-400">{r.losses}D</span>
                    <span className="text-gray-500">•</span>
                    <span className={`font-bold ${r.goal_diff > 0 ? "text-neon" : r.goal_diff < 0 ? "text-red-400" : ""}`}>
                      {r.goal_diff > 0 ? "+" : ""}{r.goal_diff}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-neon glow-text leading-none">{r.points}</div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider">pts</div>
                </div>
              </Link>
            );
          })}
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
              {rows.map((r, i) => {
                const e = extras[r.id];
                const avatar = getDisplayAvatar(e?.emoji, e?.worst_title ?? null);
                return (
                  <tr key={r.id} className={`border-b border-border/50 hover:bg-bg/40 ${i === 0 ? "bg-neon/5" : ""}`}>
                    <td className="py-3 pr-2 font-bold">{medal(i)}</td>
                    <td className="py-3 pr-2 font-bold">
                      <Link href={`/player/${encodeURIComponent(r.username)}`} className="hover:text-neon flex items-center gap-2">
                        <span className="text-xl">{avatar}</span>
                        <span>{r.username}</span>
                      </Link>
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
