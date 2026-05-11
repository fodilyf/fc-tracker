// Système de titres entre 2 joueurs (basé sur défaites consécutives)
export type Title = "lkebda" | "zawja" | "l9a7ba" | null;

export const TITLE_THRESHOLDS = {
  lkebda: 3,
  zawja: 5,
  l9a7ba: 10,
} as const;

export function getTitle(consecutiveLosses: number): Title {
  if (consecutiveLosses >= 10) return "l9a7ba";
  if (consecutiveLosses >= 5) return "zawja";
  if (consecutiveLosses >= 3) return "lkebda";
  return null;
}

export function titleEmoji(title: Title): string {
  switch (title) {
    case "lkebda": return "🥩";
    case "zawja":  return "💍";
    case "l9a7ba": return "👠";
    default:       return "";
  }
}

export function titleColor(title: Title): string {
  switch (title) {
    case "lkebda": return "text-yellow-400";
    case "zawja":  return "text-pink-400";
    case "l9a7ba": return "text-red-500";
    default:       return "text-gray-400";
  }
}

export function titleLabel(title: Title): string {
  switch (title) {
    case "lkebda": return "LKEBDA";
    case "zawja":  return "ZAWJA";
    case "l9a7ba": return "L9A7BA";
    default:       return "";
  }
}
