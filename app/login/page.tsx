"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username || email.split("@")[0] } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setMsg("Compte créé ! Vérifie ton email pour confirmer (ou désactive la confirmation dans Supabase).");
        } else {
          router.push("/leaderboard"); router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/leaderboard"); router.refresh();
      }
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-2">
          {mode === "signin" ? "Connexion" : "Inscription"}
        </h1>
        <p className="text-gray-400 text-sm">
          {mode === "signin" ? "Entre dans l'arène" : "Rejoins la ligue"}
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        {mode === "signup" && (
          <div>
            <label className="label">Pseudo</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: Fodil10"
              required
              minLength={2}
            />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input
            type="email" className="input"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            type="password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6}
          />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}
        {msg && <div className="text-neon text-sm">{msg}</div>}

        <button type="submit" className="btn-neon w-full" disabled={loading}>
          {loading ? "..." : (mode === "signin" ? "Se connecter" : "Créer mon compte")}
        </button>

        <div className="text-center text-sm text-gray-400">
          {mode === "signin" ? (
            <>Pas encore de compte ?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-neon font-bold hover:underline">
                S'inscrire
              </button>
            </>
          ) : (
            <>Déjà inscrit ?{" "}
              <button type="button" onClick={() => setMode("signin")} className="text-neon font-bold hover:underline">
                Se connecter
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
