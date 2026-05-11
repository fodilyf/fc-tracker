"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { getDisplayAvatar } from "@/lib/avatar";
import { titleEmoji, titleColor, titleLabel, type Title } from "@/lib/titles";

type Profile = {
  id: string; username: string;
  emoji: string | null; bio: string | null;
  favorite_team: string | null; favorite_color: string | null;
};

type LbRow = {
  id: string;
  played: number; wins: number; draws: number; losses: number;
  goals_for: number; goals_against: number; goal_diff: number;
  points: number; win_rate: number;
};

type Match = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
  status: string;
  p1: { username: string; emoji: string | null } | null;
  p2: { username: string; emoji: string | null } | null;
};

type TitleAgainst = {
  opponent_id: string; opponent_username: string;
  loss_streak: number; title: Title;
};

export default function PlayerPage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<LbRow | null>(null);
  const [worstTitle, setWorstTitle] = useState<Title>(null);
  const [titlesAgainst, setTitlesAgainst] = useState<TitleAgainst[]>([]);
  const [titlesHeld, setTitlesHeld] = useState<TitleAgainst[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) Profile
      const { data: p } = await supabase
        .from("profiles").select("*").eq("username", username).maybeSingle();
      if (!p) { setLoading(false); return; }
      setProfile(p as Profile);

      // 2) Stats
      const { data: lb } = await supabase
        .from("v_leaderboard").select("*")
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false });
      const idx = (lb ?? []).findIndex((r: any) => r.id === p.id);
      if (idx >= 0) {
        setStats(lb![idx] as LbRow);
        setRank(idx + 1);
      }

      // 3) Worst title (avatar)
      const { data: wt } = await supabase
        .from("v_player_worst_title")
        .select("worst_title").eq("player_id", p.id).maybeSingle();
      setWorstTitle((wt?.worst_title as Title) ?? null);

      // 4) Titles "against" (lui qui les subit) ET "held" (lui qui les inflige)
      const { data: allT } = await supabase.rpc("all_titles");
      const against = (allT ?? []).filter((t: any) => t.loser_id === p.id)
        .map((t: any) => ({
          opponent_id: t.winner_id, opponent_username: t.winner_username,
          loss_streak: t.loss_streak, title: t.title,
        }));
      const held = (allT ?? []).filter((t: any) => t.winner_id === p.id)
        .map((t: any) => ({
          opponent_id: t.loser_id, opponent_username: t.loser_username,
          loss_streak: t.loss_streak, title: t.title,
        }));
      setTitlesAgainst(against);
      setTitlesHeld(held);

      // 5) Derniers matchs validés
      const { data: ms } = await supabase
        .from("matches")
        .select(`
          id, player1_id, player2_id, player1_score, player2_score,
          team1, team2, played_at, status,
          p1:profiles!matches_player1_id_fkey(username, emoji),
          p2:profiles!matches_player2_id_fkey(username, emoji)
        `)
        .eq("status", "validated")
        .or(`player1_id.eq.${p.id},player2_id.eq.${p.id}`)
        .order("played_at", { ascending: false })
        .limit(10);
      setMatches((ms ?? []) as any);

      setLoading(false);
    })();
  }, [username]);

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!profile) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Joueur "{username}" introuvable.</p>
        <Link href="/leaderboard" className="btn-neon mt-4 inline-flex">← Classement</Link>
      </div>
    );
  }

  const displayAvatar = getDisplayAvatar(profile.emoji, worstTitle);
  const color = profile.favorite_color || "#00ff87";

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header profil */}
      <div className="card text-center" style={{ borderColor: `${color}40` }}>
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full text-6xl border-4 mb-3"
          style={{ borderColor: color, boxShadow: `0 0 40px ${color}50` }}>
          {displayAvatar}
        </div>
        <h1 className="text-3xl font-black">{profile.username}</h1>
        {rank && (
          <div className="text-sm text-gray-400 mt-1">
            🏅 {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : rank === 3 ? "🥉 #3" : `#${rank}`} au classement
          </div>
        )}
        {profile.bio && <p className="text-gray-300 mt-3 italic">"{profile.bio}"</p>}
        {profile.favorite_team && (
          <p className="text-xs text-gray-500 mt-2">⚽ Équipe fétiche : <span className="text-white font-bold">{profile.favorite_team}</span></p>
        )}
      </div>

      {/* Stats clés */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <Tile label="Matchs" v={stats.played} />
          <Tile label="Victoires" v={stats.wins} accent />
          <Tile label="Défaites" v={stats.losses} bad />
          <Tile label="Points" v={stats.points} accent />
          <Tile label="Buts +" v={stats.goals_for} accent />
          <Tile label="Buts −" v={stats.goals_against} bad />
          <Tile label="Diff" v={`${stats.goal_diff > 0 ? "+" : ""}${stats.goal_diff}`}
            accent={stats.goal_diff > 0} bad={stats.goal_diff < 0} />
          <Tile label="% Victoires" v={`${stats.win_rate}%`} />
        </div>
      )}

      {/* Titres */}
      {(titlesAgainst.length > 0 || titlesHeld.length > 0) && (
        <div className="card">
          <h2 className="text-lg font-black mb-3">🎭 Titres en cours</h2>

          {titlesHeld.length > 0 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-neon font-bold mb-2">Domine</p>
              <div className="flex flex-wrap gap-2">
                {titlesHeld.map((t) => (
                  <Link key={t.opponent_id} href={`/player/${encodeURIComponent(t.opponent_username)}`}
                    className="text-sm px-3 py-1.5 rounded-lg bg-bg/40 border border-border hover:border-neon">
                    {titleEmoji(t.title)} <b>{t.opponent_username}</b> est{" "}
                    <span className={`${titleColor(t.title)} font-black uppercase text-xs`}>{titleLabel(t.title)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {titlesAgainst.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-red-400 font-bold mb-2">Subit</p>
              <div className="flex flex-wrap gap-2">
                {titlesAgainst.map((t) => (
                  <Link key={t.opponent_id} href={`/player/${encodeURIComponent(t.opponent_username)}`}
                    className="text-sm px-3 py-1.5 rounded-lg bg-bg/40 border border-red-500/30 hover:border-red-500">
                    {titleEmoji(t.title)} est{" "}
                    <span className={`${titleColor(t.title)} font-black uppercase text-xs`}>{titleLabel(t.title)}</span>{" "}
                    de <b>{t.opponent_username}</b>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Derniers matchs */}
      {matches.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-black mb-3">📜 10 derniers matchs</h2>
          <div className="space-y-2">
            {matches.map((m) => {
              const isP1 = m.player1_id === profile.id;
              const myScore = isP1 ? m.player1_score : m.player2_score;
              const oppScore = isP1 ? m.player2_score : m.player1_score;
              const oppName = isP1 ? m.p2?.username : m.p1?.username;
              const won = myScore > oppScore;
              const lost = myScore < oppScore;
              return (
                <Link
                  key={m.id} href={`/player/${encodeURIComponent(oppName ?? "")}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-bg/40 hover:border-neon/40"
                >
                  <span className="text-xs text-gray-500 w-16">{fmt(m.played_at)}</span>
                  <div className="flex-1 text-sm">
                    <span className="text-gray-400">vs </span>
                    <span className="font-bold">{oppName}</span>
                  </div>
                  <span className={`text-lg font-black ${won ? "text-neon" : lost ? "text-red-400" : "text-gray-300"}`}>
                    {myScore}-{oppScore}
                  </span>
                  <span className={`text-[10px] uppercase font-black tracking-wider w-4 ${
                    won ? "text-neon" : lost ? "text-red-400" : "text-gray-500"
                  }`}>{won ? "V" : lost ? "D" : "N"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link href="/leaderboard" className="btn-ghost flex-1">← Classement</Link>
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: `${profile.username} sur FC Tracker`, url });
            } else {
              navigator.clipboard.writeText(url);
              alert("Lien copié !");
            }
          }}
          className="btn-neon flex-1"
        >
          🔗 Partager
        </button>
      </div>
    </div>
  );
}

function Tile({ label, v, accent, bad }: { label: string; v: any; accent?: boolean; bad?: boolean }) {
  return (
    <div className="card !p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-gray-400">{label}</div>
      <div className={`text-2xl font-black mt-1 ${accent ? "text-neon glow-text" : bad ? "text-red-400" : "text-white"}`}>{v}</div>
    </div>
  );
}
