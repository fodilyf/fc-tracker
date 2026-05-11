"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { titleEmoji, titleColor, titleLabel, type Title } from "@/lib/titles";

type Profile = { id: string; username: string };

type DuoStats = {
  total_matches: number;
  a_wins: number; b_wins: number; draws: number;
  a_goals: number; b_goals: number;
  a_current_loss_streak: number;
  b_current_loss_streak: number;
  a_title: Title; b_title: Title;
  last_played: string | null;
};

type TitleRow = {
  loser_id: string; loser_username: string;
  winner_id: string; winner_username: string;
  loss_streak: number; title: Title;
};

export default function Duels() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const [stats, setStats] = useState<DuoStats | null>(null);
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    const { data: profs } = await supabase.from("profiles").select("id, username").order("username");
    setProfiles((profs ?? []) as Profile[]);
    const { data: t } = await supabase.rpc("all_titles");
    setTitles((t ?? []) as TitleRow[]);
  };

  useEffect(() => { loadAll(); }, []);

  const loadDuo = async () => {
    if (!a || !b || a === b) { setStats(null); return; }
    setLoading(true);
    const { data, error } = await supabase.rpc("duo_stats", { p_a: a, p_b: b });
    setLoading(false);
    if (!error && data && data.length > 0) setStats(data[0] as DuoStats);
    else setStats(null);
  };

  useEffect(() => { loadDuo(); }, [a, b]);

  const aName = profiles.find(p => p.id === a)?.username ?? "Joueur A";
  const bName = profiles.find(p => p.id === b)?.username ?? "Joueur B";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black mb-1">DUELS</h1>
        <p className="text-gray-400">Confrontations directes (head-to-head)</p>
      </header>

      {/* Sélection du duo */}
      <section className="card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Joueur A</label>
            <select className="input" value={a} onChange={(e) => setA(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.username}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Joueur B</label>
            <select className="input" value={b} onChange={(e) => setB(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {profiles.map((p) => <option key={p.id} value={p.id} disabled={p.id === a}>{p.username}</option>)}
            </select>
          </div>
        </div>

        {loading && <p className="text-gray-400 mt-6">Calcul...</p>}

        {stats && stats.total_matches > 0 && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 items-center text-center gap-4">
              <div>
                <div className="text-xs uppercase text-gray-400">{aName}</div>
                <div className="text-5xl font-black text-neon glow-text">{stats.a_wins}</div>
                <div className="text-xs text-gray-500">victoires</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400">Nuls</div>
                <div className="text-3xl font-black text-gray-300">{stats.draws}</div>
                <div className="text-xs text-gray-500">{stats.total_matches} matchs</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400">{bName}</div>
                <div className="text-5xl font-black text-neon glow-text">{stats.b_wins}</div>
                <div className="text-xs text-gray-500">victoires</div>
              </div>
            </div>

            <div className="text-center text-gray-400">
              Buts : <span className="text-white font-bold">{stats.a_goals}</span> — <span className="text-white font-bold">{stats.b_goals}</span>
            </div>

            {/* Titres actuels */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <TitleCard
                player={aName} opponent={bName}
                streak={stats.a_current_loss_streak} title={stats.a_title}
              />
              <TitleCard
                player={bName} opponent={aName}
                streak={stats.b_current_loss_streak} title={stats.b_title}
              />
            </div>
          </div>
        )}

        {stats && stats.total_matches === 0 && a && b && (
          <p className="text-gray-400 mt-6">Aucun match entre ces deux joueurs.</p>
        )}
      </section>

      {/* Hall of shame */}
      <section>
        <h2 className="text-2xl font-black mb-4">🏴 HALL OF SHAME</h2>
        <p className="text-sm text-gray-400 mb-4">Tous les titres actuellement en vigueur</p>

        {titles.length === 0 ? (
          <div className="card text-gray-400">Personne n'a encore mérité de titre. Pour l'instant.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {titles
              .sort((x, y) => y.loss_streak - x.loss_streak)
              .map((t, i) => (
              <div key={i} className="card flex items-center gap-3">
                <div className="text-3xl">{titleEmoji(t.title)}</div>
                <div className="flex-1">
                  <div className="font-bold">
                    <span className="text-white">{t.loser_username}</span>
                    <span className="text-gray-500"> est </span>
                    <span className={`${titleColor(t.title)} font-black uppercase`}>{titleLabel(t.title)}</span>
                    <span className="text-gray-500"> de </span>
                    <span className="text-white">{t.winner_username}</span>
                  </div>
                  <div className="text-xs text-gray-500">{t.loss_streak} défaites consécutives</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-6 text-sm text-gray-400">
          <p className="text-white font-bold mb-2">⚖️ Règles des titres</p>
          <p>🥩 <span className="text-yellow-400 font-bold">LKEBDA</span> — 3 défaites consécutives</p>
          <p>💍 <span className="text-pink-400 font-bold">ZAWJA</span> — 5 défaites consécutives</p>
          <p>👠 <span className="text-red-500 font-bold">L9A7BA</span> — 10 défaites consécutives</p>
          <p className="mt-2 text-xs">Une seule victoire (ou un nul) suffit à briser la série.</p>
        </div>
      </section>
    </div>
  );
}

function TitleCard({ player, opponent, streak, title }:
  { player: string; opponent: string; streak: number; title: Title }) {
  if (!title) {
    return (
      <div className="p-4 rounded-lg border border-border bg-bg/40">
        <div className="text-xs uppercase text-gray-500 mb-1">{player} vs {opponent}</div>
        <div className="text-sm text-gray-400">
          Série en cours : <span className="text-white font-bold">{streak} défaites</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`p-4 rounded-lg border-2 ${
      title === "l9a7ba" ? "border-red-500/50 bg-red-500/10" :
      title === "zawja"  ? "border-pink-500/50 bg-pink-500/10" :
                           "border-yellow-500/50 bg-yellow-500/10"
    }`}>
      <div className="text-xs uppercase text-gray-400 mb-1">{player} vs {opponent}</div>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{titleEmoji(title)}</span>
        <div>
          <div className={`font-black uppercase text-xl ${titleColor(title)}`}>{titleLabel(title)}</div>
          <div className="text-xs text-gray-300">{streak} défaites de suite</div>
        </div>
      </div>
    </div>
  );
}
