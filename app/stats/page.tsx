"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Profile = { id: string; username: string };
type Match = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
};

type Stats = {
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number;
  bestWin: { score: string; opp: string } | null;
  worstLoss: { score: string; opp: string } | null;
  currentStreak: { type: "W" | "L" | "D" | null; n: number };
  bestWinStreak: number;
  worstLossStreak: number;
  topTeam: { name: string; n: number } | null;
  rivals: { username: string; played: number; wins: number; losses: number }[];
};

export default function StatsPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pid, setPid] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profs } = await supabase.from("profiles").select("id, username").order("username");
      setProfiles((profs ?? []) as Profile[]);
      if (user) setPid(user.id);
    })();
  }, []);

  useEffect(() => {
    if (!pid) { setStats(null); return; }
    (async () => {
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .or(`player1_id.eq.${pid},player2_id.eq.${pid}`)
        .order("played_at", { ascending: false });
      const profById: Record<string, string> = Object.fromEntries(profiles.map(p => [p.id, p.username]));
      setStats(computeStats((matches ?? []) as Match[], pid, profById));
    })();
  }, [pid, profiles]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-black mb-1">STATISTIQUES</h1>
        <p className="text-gray-400">Toutes les stats par joueur</p>
      </header>

      <div className="card mb-6">
        <label className="label">Joueur</label>
        <select className="input" value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">— Choisir —</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.username}</option>)}
        </select>
      </div>

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tile label="Matchs" value={stats.played} />
            <Tile label="Victoires" value={stats.wins} accent />
            <Tile label="Nuls" value={stats.draws} />
            <Tile label="Défaites" value={stats.losses} bad />
            <Tile label="Buts marqués" value={stats.goalsFor} accent />
            <Tile label="Buts encaissés" value={stats.goalsAgainst} bad />
            <Tile label="Diff." value={stats.goalsFor - stats.goalsAgainst}
              accent={stats.goalsFor - stats.goalsAgainst > 0}
              bad={stats.goalsFor - stats.goalsAgainst < 0} />
            <Tile
              label="Série actuelle"
              value={stats.currentStreak.type
                ? `${stats.currentStreak.n}${stats.currentStreak.type}`
                : "-"}
              accent={stats.currentStreak.type === "W"}
              bad={stats.currentStreak.type === "L"}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <div className="label">🏆 Plus belle victoire</div>
              {stats.bestWin
                ? <div className="text-xl font-black text-neon">{stats.bestWin.score} <span className="text-gray-400 text-sm">vs {stats.bestWin.opp}</span></div>
                : <div className="text-gray-500">—</div>}
            </div>
            <div className="card">
              <div className="label">💀 Pire défaite</div>
              {stats.worstLoss
                ? <div className="text-xl font-black text-red-400">{stats.worstLoss.score} <span className="text-gray-400 text-sm">vs {stats.worstLoss.opp}</span></div>
                : <div className="text-gray-500">—</div>}
            </div>
            <div className="card">
              <div className="label">🔥 Meilleure série de victoires</div>
              <div className="text-2xl font-black text-neon">{stats.bestWinStreak}</div>
            </div>
            <div className="card">
              <div className="label">❄️ Pire série de défaites</div>
              <div className="text-2xl font-black text-red-400">{stats.worstLossStreak}</div>
            </div>
            <div className="card md:col-span-2">
              <div className="label">⚽ Équipe préférée</div>
              {stats.topTeam
                ? <div className="text-xl font-black">{stats.topTeam.name} <span className="text-gray-400 text-sm">({stats.topTeam.n} matchs)</span></div>
                : <div className="text-gray-500">Aucune équipe renseignée</div>}
            </div>
          </div>

          {/* Rivalités */}
          <div className="card">
            <div className="label mb-3">⚔️ Rivalités</div>
            {stats.rivals.length === 0 ? (
              <div className="text-gray-500">—</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 uppercase text-xs tracking-wider border-b border-border">
                    <th className="text-left py-2">Adversaire</th>
                    <th className="text-right py-2">Matchs</th>
                    <th className="text-right py-2">V</th>
                    <th className="text-right py-2">D</th>
                    <th className="text-right py-2">% V</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rivals
                    .sort((a, b) => b.played - a.played)
                    .map((r) => (
                      <tr key={r.username} className="border-b border-border/50">
                        <td className="py-2 font-bold">{r.username}</td>
                        <td className="py-2 text-right">{r.played}</td>
                        <td className="py-2 text-right text-neon">{r.wins}</td>
                        <td className="py-2 text-right text-red-400">{r.losses}</td>
                        <td className="py-2 text-right">
                          {r.played > 0 ? Math.round(100 * r.wins / r.played) : 0}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, accent, bad }: { label: string; value: any; accent?: boolean; bad?: boolean }) {
  return (
    <div className="card">
      <div className="text-[10px] uppercase tracking-widest text-gray-400">{label}</div>
      <div className={`text-3xl font-black mt-1 ${accent ? "text-neon glow-text" : bad ? "text-red-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function computeStats(matches: Match[], pid: string, profById: Record<string, string>): Stats {
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
  let bestWin: Stats["bestWin"] = null;
  let worstLoss: Stats["worstLoss"] = null;
  const teamCount: Record<string, number> = {};
  const rivals: Record<string, { played: number; wins: number; losses: number }> = {};

  // Matches arrivent triés DESC. On va aussi calculer les séries.
  // Construire la liste des résultats du plus ancien au plus récent.
  const oldToNew = [...matches].reverse();
  const results: ("W" | "L" | "D")[] = [];

  for (const m of oldToNew) {
    const isP1 = m.player1_id === pid;
    const myScore = isP1 ? m.player1_score : m.player2_score;
    const oppScore = isP1 ? m.player2_score : m.player1_score;
    const oppId = isP1 ? m.player2_id : m.player1_id;
    const oppName = profById[oppId] ?? "?";
    const myTeam = isP1 ? m.team1 : m.team2;

    gf += myScore; ga += oppScore;
    if (myTeam) teamCount[myTeam] = (teamCount[myTeam] ?? 0) + 1;

    rivals[oppName] ??= { played: 0, wins: 0, losses: 0 };
    rivals[oppName].played++;

    if (myScore > oppScore) {
      wins++;
      rivals[oppName].wins++;
      results.push("W");
      const diff = myScore - oppScore;
      if (!bestWin || diff > scoreDiff(bestWin.score)) {
        bestWin = { score: `${myScore}-${oppScore}`, opp: oppName };
      }
    } else if (myScore < oppScore) {
      losses++;
      rivals[oppName].losses++;
      results.push("L");
      const diff = oppScore - myScore;
      if (!worstLoss || diff > scoreDiff(worstLoss.score)) {
        worstLoss = { score: `${myScore}-${oppScore}`, opp: oppName };
      }
    } else {
      draws++;
      results.push("D");
    }
  }

  // Série actuelle (à la fin de la liste old→new)
  let cur: { type: "W" | "L" | "D" | null; n: number } = { type: null, n: 0 };
  if (results.length) {
    cur.type = results[results.length - 1];
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === cur.type) cur.n++;
      else break;
    }
  }

  // Meilleures séries
  let bestWinStreak = 0, worstLossStreak = 0, runW = 0, runL = 0;
  for (const r of results) {
    if (r === "W") { runW++; runL = 0; bestWinStreak = Math.max(bestWinStreak, runW); }
    else if (r === "L") { runL++; runW = 0; worstLossStreak = Math.max(worstLossStreak, runL); }
    else { runW = 0; runL = 0; }
  }

  let topTeam: Stats["topTeam"] = null;
  for (const [name, n] of Object.entries(teamCount)) {
    if (!topTeam || n > topTeam.n) topTeam = { name, n };
  }

  return {
    played: matches.length, wins, draws, losses,
    goalsFor: gf, goalsAgainst: ga,
    bestWin, worstLoss,
    currentStreak: cur,
    bestWinStreak, worstLossStreak,
    topTeam,
    rivals: Object.entries(rivals).map(([username, v]) => ({ username, ...v })),
  };
}

function scoreDiff(s: string): number {
  const [a, b] = s.split("-").map(Number);
  return Math.abs(a - b);
}
