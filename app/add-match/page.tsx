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
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    setErr(null);
    if (!p1 || !p2 || p1 === p2) { setErr("Choisis 2 joueurs différents"); return; }
    if (s1 === "" || s2 === "") { setErr("Indique les 2 scores"); return; }
    setLoading(true);
    const { error } = await supabase.from("matches").insert({
      player1_id: p1, player2_id: p2,
      player1_score: Number(s1), player2_score: Number(s2),
      team1: t1 || null, team2: t2 || null,
      notes: notes || null,
      created_by: me.id,
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.push("/history"); router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-black mb-1">+ AJOUTER UN MATCH</h1>
        <p className="text-gray-400">Score final, en quelques secondes</p>
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
          <label className="label">Notes (optionnel)</label>
          <textarea
            className="input min-h-[80px]" rows={2}
            placeholder="Match de fou, prolongations, tirs au but..."
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button type="submit" className="btn-neon w-full !text-base !py-3" disabled={loading}>
          {loading ? "Enregistrement..." : "⚽ Valider le match"}
        </button>
      </form>
    </div>
  );
}
