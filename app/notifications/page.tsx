"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type BaseMatch = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
  notes: string | null;
  created_by: string;
  status: string;
  validated_by_p1: boolean;
  validated_by_p2: boolean;
  refused_by: string | null;
  arbitrated_by: string | null;
  p1_username: string;
  p2_username: string;
  creator_username: string;
  refused_by_username?: string | null;
};

type Tab = "to_validate" | "my_rejected" | "to_arbitrate";

export default function Notifications() {
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("to_validate");

  const [toValidate, setToValidate] = useState<BaseMatch[]>([]);
  const [myRejected, setMyRejected] = useState<BaseMatch[]>([]);
  const [toArbitrate, setToArbitrate] = useState<BaseMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setMe(user);

    // 1) À valider — matchs pending où je suis player1 ou player2 ET je n'ai pas validé
    const { data: pending } = await supabase
      .from("v_pending_matches")
      .select("*")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order("played_at", { ascending: false });

    const tv = (pending ?? []).filter((m: any) => {
      const isP1 = m.player1_id === user.id;
      return isP1 ? !m.validated_by_p1 : !m.validated_by_p2;
    });
    setToValidate(tv as BaseMatch[]);

    // 2) Mes matchs refusés (créés par moi, en status rejected)
    const { data: rejected } = await supabase
      .from("v_rejected_matches")
      .select("*")
      .eq("created_by", user.id)
      .order("played_at", { ascending: false });
    setMyRejected((rejected ?? []) as BaseMatch[]);

    // 3) Litiges à arbitrer (status disputed, où je ne suis NI player1 NI player2)
    const { data: disputed } = await supabase
      .from("v_disputed_matches")
      .select("*")
      .order("played_at", { ascending: false });
    const ta = (disputed ?? []).filter((m: any) =>
      m.player1_id !== user.id && m.player2_id !== user.id
    );
    setToArbitrate(ta as BaseMatch[]);

    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("matches-notif")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Actions
  const validate = async (m: BaseMatch) => {
    if (!me) return;
    const isP1 = m.player1_id === me.id;
    const update = isP1 ? { validated_by_p1: true } : { validated_by_p2: true };
    await supabase.from("matches").update(update).eq("id", m.id);
    load();
  };

  const reject = async (m: BaseMatch) => {
    if (!confirm("Refuser ce match ?")) return;
    await supabase.from("matches")
      .update({ status: "rejected", refused_by: me.id })
      .eq("id", m.id);
    load();
  };

  const claim = async (m: BaseMatch) => {
    if (!confirm("Réclamer ce match ? Un autre joueur devra trancher.")) return;
    await supabase.from("matches")
      .update({ status: "disputed" })
      .eq("id", m.id);
    load();
  };

  const acceptRejection = async (m: BaseMatch) => {
    if (!confirm("Confirmer le refus ? Le match sera supprimé définitivement.")) return;
    await supabase.from("matches").delete().eq("id", m.id);
    load();
  };

  const arbitrateValidate = async (m: BaseMatch) => {
    if (!me) return;
    if (!confirm("Confirmer ce match comme valide ?")) return;
    await supabase.from("matches")
      .update({
        status: "validated",
        validated_by_p1: true,
        validated_by_p2: true,
        arbitrated_by: me.id,
        arbitrated_at: new Date().toISOString(),
      })
      .eq("id", m.id);
    load();
  };

  const arbitrateReject = async (m: BaseMatch) => {
    if (!me) return;
    if (!confirm("Rejeter définitivement ce match ?")) return;
    await supabase.from("matches")
      .update({
        status: "rejected_final",
        arbitrated_by: me.id,
        arbitrated_at: new Date().toISOString(),
      })
      .eq("id", m.id);
    load();
  };

  const counts = {
    to_validate: toValidate.length,
    my_rejected: myRejected.length,
    to_arbitrate: toArbitrate.length,
  };
  const total = counts.to_validate + counts.my_rejected + counts.to_arbitrate;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-black mb-1">🔔 NOTIFICATIONS</h1>
        <p className="text-gray-400">
          {total === 0 ? "Aucune action en attente" : `${total} action${total > 1 ? "s" : ""} en attente`}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabBtn active={tab === "to_validate"}  onClick={() => setTab("to_validate")}  count={counts.to_validate}>
          ⏳ À valider
        </TabBtn>
        <TabBtn active={tab === "my_rejected"}  onClick={() => setTab("my_rejected")}  count={counts.my_rejected}>
          ❌ Mes refusés
        </TabBtn>
        <TabBtn active={tab === "to_arbitrate"} onClick={() => setTab("to_arbitrate")} count={counts.to_arbitrate}>
          ⚖️ À arbitrer
        </TabBtn>
      </div>

      {loading && <p className="text-gray-400">Chargement...</p>}

      {/* === Onglet À VALIDER === */}
      {tab === "to_validate" && !loading && (
        <Section
          empty="✨ Aucun match à valider."
          items={toValidate}
          render={(m) => (
            <MatchCard
              key={m.id} m={m} me={me}
              footer={
                <>
                  <div className="text-xs text-gray-400 mb-3">
                    Ajouté par <span className="text-white font-bold">{m.creator_username}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => validate(m)} className="btn-neon flex-1">✅ Valider</button>
                    <button onClick={() => reject(m)} className="btn-ghost !text-red-400 hover:!border-red-400">❌ Refuser</button>
                  </div>
                </>
              }
            />
          )}
        />
      )}

      {/* === Onglet MES REFUSÉS === */}
      {tab === "my_rejected" && !loading && (
        <Section
          empty="✨ Aucun match refusé. Tout va bien."
          items={myRejected}
          render={(m) => (
            <MatchCard
              key={m.id} m={m} me={me}
              border="border-red-500/40 bg-red-500/5"
              footer={
                <>
                  <div className="text-sm text-red-300 mb-3 font-bold">
                    ❌ Refusé par {m.refused_by_username}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Tu peux accepter ce refus (le match sera supprimé) ou réclamer pour qu'un autre joueur tranche.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => claim(m)} className="btn-neon flex-1">⚖️ Réclamer</button>
                    <button onClick={() => acceptRejection(m)} className="btn-ghost">Accepter le refus</button>
                  </div>
                </>
              }
            />
          )}
        />
      )}

      {/* === Onglet À ARBITRER === */}
      {tab === "to_arbitrate" && !loading && (
        <Section
          empty="✨ Aucun litige à arbitrer."
          items={toArbitrate}
          render={(m) => (
            <MatchCard
              key={m.id} m={m} me={me}
              border="border-yellow-500/40 bg-yellow-500/5"
              footer={
                <>
                  <div className="text-sm text-yellow-300 mb-3 font-bold">
                    ⚖️ Litige : {m.creator_username} a déclaré ce score, {m.refused_by_username} l'a refusé.
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Ta décision est <span className="text-white font-bold">finale</span>. Choisis honnêtement.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => arbitrateValidate(m)} className="btn-neon flex-1">✅ Score valide</button>
                    <button onClick={() => arbitrateReject(m)} className="btn-ghost !text-red-400 hover:!border-red-400 flex-1">❌ Score invalide</button>
                  </div>
                </>
              }
            />
          )}
        />
      )}

      {/* Help box */}
      <div className="card mt-8 text-sm text-gray-400">
        <p className="text-white font-bold mb-2">⚖️ Comment ça marche</p>
        <p>1️⃣ Quand quelqu'un ajoute un match qui te concerne → tu reçois une notification pour <b>valider</b> ou <b>refuser</b>.</p>
        <p>2️⃣ Si tu refuses → le créateur peut <b>réclamer</b>.</p>
        <p>3️⃣ Si réclamation → un <b>autre joueur</b> tranche définitivement.</p>
        <p className="mt-2 text-xs">Tant qu'un match n'est pas validé, il n'est pas comptabilisé dans le classement ni les stats.</p>
      </div>
    </div>
  );
}

function Section({ items, render, empty }:
  { items: BaseMatch[]; render: (m: BaseMatch) => React.ReactNode; empty: string }) {
  if (items.length === 0) {
    return <div className="card text-center py-12 text-gray-400 text-lg">{empty}</div>;
  }
  return <div className="space-y-3">{items.map(render)}</div>;
}

function TabBtn({ active, onClick, count, children }:
  { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
        active ? "bg-neon text-bg" : "border border-border text-gray-400 hover:text-white hover:border-neon"
      }`}
    >
      {children}
      {count > 0 && (
        <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${
          active ? "bg-bg text-neon" : "bg-accent text-white"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function MatchCard({ m, me, footer, border }:
  { m: BaseMatch; me: any; footer: React.ReactNode; border?: string }) {
  const fmt = (d: string) => new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
  const win1 = m.player1_score > m.player2_score;
  const win2 = m.player2_score > m.player1_score;

  return (
    <div className={`card ${border ?? ""}`}>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>📅 {fmt(m.played_at)}</span>
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

      {footer}
    </div>
  );
}
