export interface ClubPalette {
  stripe: string;
  badgeBg: string;
  badgeText: string;
}

export const CLUB_PALETTES: ClubPalette[] = [
  {
    stripe: "bg-[#8b4513]",
    badgeBg: "bg-[#8b4513]/10",
    badgeText: "text-[#8b4513]",
  },
  {
    stripe: "bg-[#4a5d4a]",
    badgeBg: "bg-[#4a5d4a]/10",
    badgeText: "text-[#4a5d4a]",
  },
  {
    stripe: "bg-[#1e3a5f]",
    badgeBg: "bg-[#1e3a5f]/10",
    badgeText: "text-[#1e3a5f]",
  },
  {
    stripe: "bg-[#6b2d5c]",
    badgeBg: "bg-[#6b2d5c]/10",
    badgeText: "text-[#6b2d5c]",
  },
  {
    stripe: "bg-[#a2682a]",
    badgeBg: "bg-[#a2682a]/10",
    badgeText: "text-[#a2682a]",
  },
];

export function getClubPalette(seed: string): ClubPalette {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CLUB_PALETTES.length;
  return CLUB_PALETTES[index];
}

export interface JacketTheme {
  gradient: string;
  border: string;
  accent: string;
}

export const FALLBACK_JACKET_THEMES: JacketTheme[] = [
  {
    gradient: "from-[#362115] via-[#4a2e1d] to-[#24150c]",
    border: "border-amber-200/25",
    accent: "text-amber-300/80",
  },
  {
    gradient: "from-[#1b2f25] via-[#274235] to-[#122019]",
    border: "border-emerald-200/25",
    accent: "text-emerald-300/80",
  },
  {
    gradient: "from-[#1b2336] via-[#26314c] to-[#111724]",
    border: "border-sky-200/25",
    accent: "text-sky-300/80",
  },
  {
    gradient: "from-[#351a2a] via-[#4a243a] to-[#22101b]",
    border: "border-rose-200/25",
    accent: "text-rose-300/80",
  },
  {
    gradient: "from-[#2b3036] via-[#3a4149] to-[#1d2024]",
    border: "border-stone-300/25",
    accent: "text-stone-300/80",
  },
];

export function getJacketTheme(seed: string): JacketTheme {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_JACKET_THEMES.length;
  return FALLBACK_JACKET_THEMES[index];
}

export function formatClubTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "recently";
  }
}
