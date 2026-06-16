import { StickerRarity, STICKER_RARITY_ODDS } from '@/types';

export const DEFAULT_STICKER_RARITY: StickerRarity = 'Lilás';

export const RARITY_CONFIG: Record<StickerRarity, {
  label: string;
  shortLabel: string;
  emoji: string;
  odds: string;
  frameClass: string;
  badgeClass: string;
  glowClass: string;
}> = {
  'Ouro': {
    label: 'Dourada (Ouro)',
    shortLabel: 'Ouro',
    emoji: '🥇',
    odds: STICKER_RARITY_ODDS['Ouro'],
    frameClass: 'rarity-frame-ouro',
    badgeClass: 'rarity-badge-ouro',
    glowClass: 'rarity-glow-ouro',
  },
  'Prata': {
    label: 'Prata',
    shortLabel: 'Prata',
    emoji: '🥈',
    odds: STICKER_RARITY_ODDS['Prata'],
    frameClass: 'rarity-frame-prata',
    badgeClass: 'rarity-badge-prata',
    glowClass: 'rarity-glow-prata',
  },
  'Bronze': {
    label: 'Bronze',
    shortLabel: 'Bronze',
    emoji: '🥉',
    odds: STICKER_RARITY_ODDS['Bronze'],
    frameClass: 'rarity-frame-bronze',
    badgeClass: 'rarity-badge-bronze',
    glowClass: 'rarity-glow-bronze',
  },
  'Lilás': {
    label: 'Roxa (Lilás)',
    shortLabel: 'Lilás',
    emoji: '💜',
    odds: STICKER_RARITY_ODDS['Lilás'],
    frameClass: 'rarity-frame-lilas',
    badgeClass: 'rarity-badge-lilas',
    glowClass: 'rarity-glow-lilas',
  },
};

export function normalizeRarity(rarity?: string | null): StickerRarity {
  if (rarity === 'Ouro' || rarity === 'Prata' || rarity === 'Bronze' || rarity === 'Lilás') {
    return rarity;
  }
  return DEFAULT_STICKER_RARITY;
}
