import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-16">
      <div className="inline-block mb-4 px-4 py-1 rounded-full border border-neon/30 bg-neon/5 text-neon text-xs font-bold uppercase tracking-widest">
        ⚽ Score Hub
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
        FC<span className="text-neon glow-text">TRACKER</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
        Le tableau de bord ultime pour suivre vos matchs FC entre potes.
        Classement, historique, stats par duo, et le système de titres légendaire.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/login" className="btn-neon">Commencer</Link>
        <Link href="/leaderboard" className="btn-ghost">Voir le classement</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
        <div className="card">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-neon font-black uppercase tracking-wider">Classement live</h3>
          <p className="text-gray-400 text-sm mt-2">
            Points, ratio de victoires, différence de buts. Mis à jour en temps réel.
          </p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">⚔️</div>
          <h3 className="text-neon font-black uppercase tracking-wider">Duels (head-to-head)</h3>
          <p className="text-gray-400 text-sm mt-2">
            Compare-toi à n'importe lequel de tes potes : qui domine vraiment ?
          </p>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">🥩</div>
          <h3 className="text-neon font-black uppercase tracking-wider">Système de titres</h3>
          <p className="text-gray-400 text-sm mt-2">
            3 défaites de suite ? Tu deviens le <span className="text-yellow-400">lkebda</span>. 5 ? <span className="text-pink-400">zawja</span>. 10 ? <span className="text-red-500">l9a7ba</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
