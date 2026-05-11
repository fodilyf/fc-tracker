"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type PendingMatch = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
  notes: string | null;
  created_by: string;
  validated_by_p1: boolean;
  validated_by_p2: boolean;
  p1_username: string;
  p2_username: string;
  creator_username: string;
};

export default function Notifications() {
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [items, setItems] = useState<PendingMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setMe(user);

    const { data } = await supabase
      .from("v_pending_matches")
      .select("*")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order("played_at", { ascending: false });

    setItems((data ?? []) as PendingMatch[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("matches-notif")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const validate = async (m: PendingMatch) => {
    if (!me) return;
    const isP1 = m.player1_id === me.id;
    const update: any = isP1
      ? { validated_by_p1: true }
      : { validated_by_p2: true };
    await supabase.from("matches").update(update).eq("id", m.id);
    load();
  };

  const reject = async (m: PendingMatch) => {
    if (!confirm("Refuser ce match ? Il sera supprimé définitivement.")) return;
    await supabase.from("matches").delete().eq("id", m.id);
    load();
  };

  const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-black mb-1">🔔 NOTIFICATIONS</h1>
        <p className="text-gray-400">Matchs en attente de ta validation</p>
      </header>

      {loading && <p className="text-gray-400">Chargement...</p>}

      {!loading && items.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">✨ Tout est à jour, aucun match en attente.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((m) => {
          const isP1 = me?.id === m.player1_id;
          const myValidated = isP1 ? m.validated_by_p1 : m.validated_by_p2;
          const otherValidated = isP1 ? m.validated_by_p2 : m.validated_by_p1;
          const otherName = isP1 ? m.p2_username : m.p1_username;
          const win1 = m.player1_score > m.player2_score;
          const win2 = m.player2_score > m.player1_score;

          return (
            <div key={m.id} className="card">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>📅 {fmt(m.played_at)}</span>
                <span>Ajouté par <span className="text-white font-bold">{m.creator_username}</span></span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4">
                <div className={`text-right ${win1 ? "text-neon" : "text-gray-300"}`}>
                  <div className="font-bold">{m.p1_username}</div>
                  {m.team1 && <div className="text-xs text-gray-500">{m.team1}</div>}
                </div>
                <div className="flex items-center gap-3 text-3xl font-black">
                  <span className={win1 ? "text-neon glow-text" : ""}>{m.player1_score}</span>
                  <span className="text-gray-600">—</span>
                  <span className={win2 ? "text-neon glow-text" : ""}>{m.player2_score}</span>
                </div>
                <div className={`text-left ${win2 ? "text-neon" : "text-gray-300"}`}>
                  <div className="font-bold">{m.p2_username}</div>
                  {m.team2 && <div className="text-xs text-gray-500">{m.team2}</div>}
                </div>
              </div>

              {m.notes && (
                <div className="text-sm text-gray-400 italic mb-3 px-3 py-2 bg-bg/40 rounded">"{m.notes}"</div>
              )}

              <div className="text-xs text-gray-400 mb-3">
                {myValidated ? "✅ Tu as validé. " : "⏳ En attente de toi. "}
                {otherValidated ? `✅ ${otherName} a validé.` : `⏳ En attente de ${otherName}.`}
              </div>

              <div className="flex gap-2">
                {!myValidated && (
                  <button onClick={() => validate(m)} className="btn-neon flex-1">
                    ✅ Valider
                  </button>
                )}
                <button onClick={() => reject(m)} className="btn-ghost !text-red-400 hover:!border-red-400">
                  ❌ Refuser
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
