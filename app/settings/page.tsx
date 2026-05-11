"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { EMOJI_OPTIONS } from "@/lib/avatar";

type Profile = {
  id: string;
  username: string;
  emoji: string | null;
  bio: string | null;
  favorite_team: string | null;
  favorite_color: string | null;
};

export default function Settings() {
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [emoji, setEmoji] = useState("⚽");
  const [bio, setBio] = useState("");
  const [favTeam, setFavTeam] = useState("");
  const [favColor, setFavColor] = useState("#00ff87");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMe(user);

      const { data } = await supabase
        .from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        setUsername(p.username);
        setEmoji(p.emoji || "⚽");
        setBio(p.bio || "");
        setFavTeam(p.favorite_team || "");
        setFavColor(p.favorite_color || "#00ff87");
      }
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);
    const { error } = await supabase.from("profiles")
      .update({
        username, emoji, bio: bio || null,
        favorite_team: favTeam || null,
        favorite_color: favColor,
      })
      .eq("id", me.id);
    setSaving(false);
    if (error) setErr(error.message);
    else setMsg("✅ Profil mis à jour !");
  };

  if (!me || !profile) return <p className="text-gray-400">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-1">⚙️ MON PROFIL</h1>
        <p className="text-gray-400 text-sm">Personnalise comment tu apparais aux autres</p>
      </header>

      <form onSubmit={save} className="space-y-5">
        {/* Avatar */}
        <div className="card">
          <label className="label mb-3">Avatar</label>
          <div className="text-center mb-4">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl border-4"
              style={{ borderColor: favColor, boxShadow: `0 0 30px ${favColor}40` }}
            >
              {emoji}
            </div>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition ${
                  emoji === e
                    ? "bg-neon/20 border-2 border-neon"
                    : "bg-bg/40 border border-border hover:border-neon/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            ⚠️ Si tu deviens lkebda/zawja/l9a7ba, ton avatar sera <b>remplacé temporairement</b>.
            Bats-toi pour le récupérer 🔥
          </p>
        </div>

        {/* Pseudo */}
        <div className="card">
          <label className="label">Pseudo</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required minLength={2}
          />
        </div>

        {/* Bio */}
        <div className="card">
          <label className="label">Bio (optionnel)</label>
          <textarea
            className="input min-h-[80px]" rows={2}
            placeholder="Ex: Le boss de la Liga 🇪🇸"
            value={bio} maxLength={100}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/100</p>
        </div>

        {/* Équipe favorite + couleur */}
        <div className="card grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Équipe favorite</label>
            <input
              className="input"
              placeholder="Ex: PSG, Real Madrid..."
              value={favTeam}
              onChange={(e) => setFavTeam(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Couleur signature</label>
            <input
              type="color" className="input !p-1 h-12"
              value={favColor}
              onChange={(e) => setFavColor(e.target.value)}
            />
          </div>
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}
        {msg && <div className="text-neon text-sm font-bold">{msg}</div>}

        <button type="submit" className="btn-neon w-full !text-base !py-3" disabled={saving}>
          {saving ? "Sauvegarde..." : "💾 Enregistrer"}
        </button>

        <a href={`/player/${encodeURIComponent(username)}`} className="btn-ghost w-full">
          👁️ Voir ma page publique
        </a>
      </form>
    </div>
  );
}
