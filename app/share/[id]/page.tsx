"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { getDisplayAvatar } from "@/lib/avatar";

type FullMatch = {
  id: number;
  player1_id: string; player2_id: string;
  player1_score: number; player2_score: number;
  team1: string | null; team2: string | null;
  played_at: string;
  notes: string | null;
  status: string;
  p1: { username: string; emoji: string | null; favorite_color: string | null } | null;
  p2: { username: string; emoji: string | null; favorite_color: string | null } | null;
};

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const supabase = createClient();
  const [m, setM] = useState<FullMatch | null>(null);
  const [worst1, setWorst1] = useState<any>(null);
  const [worst2, setWorst2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("matches")
        .select(`
          id, player1_id, player2_id, player1_score, player2_score,
          team1, team2, played_at, notes, status,
          p1:profiles!matches_player1_id_fkey(username, emoji, favorite_color),
          p2:profiles!matches_player2_id_fkey(username, emoji, favorite_color)
        `)
        .eq("id", Number(params.id))
        .maybeSingle();
      if (data) setM(data as any);

      // Récup worst titles pour avatars dynamiques
      if (data) {
        const { data: w } = await supabase
          .from("v_player_worst_title")
          .select("player_id, worst_title")
          .in("player_id", [(data as any).player1_id, (data as any).player2_id]);
        const wm: any = {};
        (w ?? []).forEach((r: any) => { wm[r.player_id] = r.worst_title; });
        setWorst1(wm[(data as any).player1_id] ?? null);
        setWorst2(wm[(data as any).player2_id] ?? null);
      }
      setLoading(false);
    })();
  }, [params.id]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // @ts-ignore — html-to-image chargé dynamiquement
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true, pixelRatio: 2, backgroundColor: "#0a0e1a",
      });
      const link = document.createElement("a");
      link.download = `fctracker-match-${m?.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("Erreur de génération de l'image. Tu peux faire une capture d'écran à la place.");
    } finally {
      setDownloading(false);
    }
  };

  const shareNative = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // @ts-ignore
      const htmlToImage = await import("html-to-image");
      const blob = await htmlToImage.toBlob(cardRef.current, {
        pixelRatio: 2, backgroundColor: "#0a0e1a",
      });
      if (!blob) throw new Error("blob vide");
      const file = new File([blob], `fctracker-match.png`, { type: "image/png" });
      const text = `${m?.p1?.username} ${m?.player1_score}-${m?.player2_score} ${m?.p2?.username} 🔥`;
      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "FC Tracker" });
      } else {
        downloadCard();
      }
    } catch (e) {
      downloadCard();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!m) return <div className="card text-center text-gray-400 py-12">Match introuvable.</div>;

  const win1 = m.player1_score > m.player2_score;
  const win2 = m.player2_score > m.player1_score;
  const a1 = getDisplayAvatar(m.p1?.emoji, worst1);
  const a2 = getDisplayAvatar(m.p2?.emoji, worst2);
  const c1 = m.p1?.favorite_color || "#00ff87";
  const c2 = m.p2?.favorite_color || "#ff0080";

  return (
    <div className="max-w-md mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-black mb-1">📤 Partager le match</h1>
        <p className="text-gray-400 text-sm">Carte style FIFA Ultimate Team</p>
      </header>

      {/* La carte (1080x1080 ratio) */}
      <div
        ref={cardRef}
        className="aspect-square rounded-3xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${c1}22 0%, #0a0e1a 50%, ${c2}22 100%)`,
          border: `2px solid #ffd700`,
        }}
      >
        {/* Pattern grille FIFA */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            "linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />

        <div className="relative h-full flex flex-col p-6">
          {/* Top : badge */}
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
              style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid #ffd70060" }}>
              ⚽ FC TRACKER MATCH
            </div>
          </div>

          {/* Joueurs + score */}
          <div className="flex-1 flex items-center justify-between gap-3">
            {/* Joueur 1 */}
            <div className="flex-1 text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full text-5xl border-4 mb-2"
                style={{ borderColor: c1, boxShadow: `0 0 25px ${c1}80` }}
              >{a1}</div>
              <div className="font-black text-base text-white truncate">{m.p1?.username}</div>
              {m.team1 && <div className="text-[10px] text-gray-300 truncate">{m.team1}</div>}
              {win1 && <div className="text-[10px] uppercase font-black tracking-widest mt-1" style={{color: "#ffd700"}}>👑 GAGNANT</div>}
            </div>

            {/* Score */}
            <div className="text-center px-2">
              <div className="text-5xl font-black text-white leading-none mb-1" style={{textShadow: "0 0 20px rgba(255,215,0,0.5)"}}>
                <span className={win1 ? "text-yellow-400" : ""}>{m.player1_score}</span>
                <span className="text-gray-500 mx-2">-</span>
                <span className={win2 ? "text-yellow-400" : ""}>{m.player2_score}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400">FINAL</div>
            </div>

            {/* Joueur 2 */}
            <div className="flex-1 text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full text-5xl border-4 mb-2"
                style={{ borderColor: c2, boxShadow: `0 0 25px ${c2}80` }}
              >{a2}</div>
              <div className="font-black text-base text-white truncate">{m.p2?.username}</div>
              {m.team2 && <div className="text-[10px] text-gray-300 truncate">{m.team2}</div>}
              {win2 && <div className="text-[10px] uppercase font-black tracking-widest mt-1" style={{color: "#ffd700"}}>👑 GAGNANT</div>}
            </div>
          </div>

          {/* Notes */}
          {m.notes && (
            <div className="text-center text-xs text-gray-300 italic mb-3 px-4">"{m.notes}"</div>
          )}

          {/* Footer */}
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              {new Date(m.played_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <div className="text-[10px] uppercase font-black tracking-widest" style={{color: "#00ff87"}}>
              FC<span className="text-white">TRACKER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={shareNative} disabled={downloading} className="btn-neon">
          {downloading ? "..." : "📲 Partager"}
        </button>
        <button onClick={downloadCard} disabled={downloading} className="btn-ghost">
          ⬇️ Télécharger
        </button>
      </div>
      <a href="/history" className="btn-ghost w-full">← Retour</a>
    </div>
  );
}
