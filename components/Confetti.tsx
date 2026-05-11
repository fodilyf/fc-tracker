"use client";
import { useEffect, useState } from "react";

type Piece = { id: number; left: number; delay: number; duration: number; color: string; rotation: number };

export function Confetti({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const colors = ["#00ff87", "#ffd700", "#ff0080", "#9d4edd", "#00cc6a"];
    const newPieces: Piece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 500,
        duration: 2000 + Math.random() * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      });
    }
    setPieces(newPieces);
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3500);
    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block w-2.5 h-2.5"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}ms ease-out ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
