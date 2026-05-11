"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Profile = { id: string; username: string };

export default function AddMatch() {
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [p1, setP1] = useState(""); const [p2, setP2] = useState("");
  const [s1, setS1] = useState<number | "">(""); const [s2, setS2] = useState<number | "">("");
  const [t1, setT1] = useState(""); const [t2, setT2] = useState("");
  const [notes, setNotes] = useState("");
  const [playedAt, setPlayedAt] = useState(getDefaultLocalDateTime());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMe(user);
      const { data } = await supabase.from("profiles").select("id, username").order("username");
      setProfiles((data ?? []) as Profile[]);
      if (user) setP1(user.id);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOkMsg(null);
    if (!p1 || !p2 || p1 === p2) { setErr("Choisis 2 joueurs différents"); return; }
    if (s1 === "" || s2 === "") { setErr("Indique les 2 scores"); return; }
    setLoading(true);

    const { error } = await supabase.from("matches").insert({
      player1_id: p1, player2_id: p2,
      player1_score: Number(s1), player2_score: Number(s2),
      team1: t1 || null, team2: t2 || null,
      notes: notes || null,
      created_by: me.id,
      played_at: new Date(playedAt).toISOString(),
    });

    setLoading(false);
    if (error) { setErr(error.message); return; }

    // Si le créateur n'est pas un des joueurs → message expliquant la validation
    const creatorIsPlayer = me.id === p1 || me.id === p2;
    const otherPlayer = creatorIsPlayer
      ? (me.id === p1 ? profiles.find(p => p.id === p2)?.username : profiles.find(p => p.id === p1)?.username)
      : null;

    if (creatorIsPlayer) {
      setOkMsg(`✅ Match enregistré ! En attente de validation par ${otherPlayer ?? "l'autre joueur"}.`);
    } else {
      setOkMsg("✅ Match enregistré ! En attente de validation par les 2 joueurs.");
    }

    setTimeout(() => router.push("/history"), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-1">+ AJOUTER UN MATCH</h1>
        <p className="text-gray-400 text-sm">Le match sera visible mais non comptabilisé tant qu'il n'est pas validé par les 2 joueurs</p>
      </header>

      <form onSubmit={submit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Joueur 1 */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-bg/40">
            <div className="text-xs uppercase tracking-widest text-neon font-black">Joueur 1 (Domicile)</div>
            <select className="input" value={p1} onChange={(e) => setP1(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.username}</option>)}
            </select>
            <input className="input" placeholder="Équipe (ex: PSG)" value={t1} onChange={(e) => setT1(e.target.value)} />
            <input
              type="number" min={0} className="input text-center text-3xl font-black"
              placeholder="0" value={s1}
              onChange={(e) => setS1(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          {/* Joueur 2 */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-bg/40">
            <div className="text-xs uppercase tracking-widest text-accent font-black">Joueur 2 (Extérieur)</div>
            <select className="input" value={p2} onChange={(e) => setP2(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.username}</option>)}
            </select>
            <input className="input" placeholder="Équipe (ex: Real Madrid)" value={t2} onChange={(e) => setT2(e.target.value)} />
            <input
              type="number" min={0} className="input text-center text-3xl font-black"
              placeholder="0" value={s2}
              onChange={(e) => setS2(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="label">📅 Date et heure du match</label>
          <input
            type="datetime-local"
            className="input"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Par défaut : maintenant. Tu peux saisir une date passée.</p>
        </div>

        <div>
          <label className="label">Notes (optionnel)</label>
          <textarea
            className="input min-h-[80px]" rows={2}
            placeholder="Match de fou, prolongations, tirs au but..."
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}
        {okMsg && <div className="text-neon text-sm font-bold">{okMsg}</div>}

        <button type="submit" className="btn-neon w-full !text-base !py-3" disabled={loading || !!okMsg}>
          {loading ? "Enregistrement..." : "⚽ Enregistrer le match"}
        </button>
      </form>
    </div>
  );
}

function getDefaultLocalDateTime(): string {
  const d = new Date();
  // Format yyyy-MM-ddTHH:mm pour l'input datetime-local
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
