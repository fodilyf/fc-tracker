// Avatar dynamique selon le titre
import { type Title } from "./titles";

// Avatars par titre — peuvent être emojis ou n'importe quel string
const TITLE_AVATARS: Record<NonNullable<Title>, string> = {
  lkebda: "🥩",   // Lkebda = boucher
  zawja:  "👰",   // Zawja = mariée (femme en robe blanche)
  l9a7ba: "💃",   // L9a7ba = celle qui danse (interprétation soft)
};

// Choisit l'emoji à afficher pour un joueur
// Si le joueur a un titre actif → emoji du titre (overrides)
// Sinon → emoji personnel choisi par le joueur (ou ⚽ par défaut)
export function getDisplayAvatar(personalEmoji: string | null | undefined, worstTitle: Title): string {
  if (worstTitle) return TITLE_AVATARS[worstTitle];
  return personalEmoji || "⚽";
}

// Emojis disponibles à la sélection
export const EMOJI_OPTIONS = [
  "⚽", "🔥", "👑", "💎", "🎯", "🚀", "⚡", "🌟",
  "🦁", "🐉", "🦊", "🐺", "🦅", "🐍", "🦈", "🐢",
  "💪", "🧠", "🎮", "🏆", "🎩", "👽", "🤖", "👻",
  "🇫🇷", "🇪🇸", "🇮🇹", "🇩🇪", "🇧🇷", "🇦🇷", "🇵🇹", "🇲🇦",
];
