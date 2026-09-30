import { Lineup, PlacedPlayer, Player } from '../../domain/entities';
import { getShirt } from '../../domain/entities/shirts';

export interface SharedLineupData {
  v: 1;
  name: string;
  formationId: string;
  color: string;
  shirtId: string | null;
  players: PlacedPlayer[];
  substitutes: Player[];
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeLineup(lineup: Lineup): string {
  const data: SharedLineupData = {
    v: 1,
    name: lineup.name,
    formationId: lineup.formationId,
    color: lineup.color,
    shirtId: lineup.shirtId,
    players: lineup.players,
    substitutes: lineup.substitutes,
  };
  return toBase64Url(JSON.stringify(data));
}

export function decodeLineup(encoded: string): SharedLineupData {
  const data = JSON.parse(fromBase64Url(encoded)) as SharedLineupData;
  if (data?.v !== 1 || typeof data.name !== 'string' || !Array.isArray(data.players)) {
    throw new Error('Invalid shared lineup');
  }
  return {
    v: 1,
    name: data.name,
    formationId: typeof data.formationId === 'string' ? data.formationId : '4-4-2',
    color: typeof data.color === 'string' ? data.color : '#15803d',
    shirtId: getShirt(data.shirtId) ? (data.shirtId as string) : null,
    players: data.players,
    substitutes: Array.isArray(data.substitutes) ? data.substitutes : [],
  };
}

export function buildShareUrl(lineup: Lineup): string {
  return `${window.location.origin}${window.location.pathname}#s=${encodeLineup(lineup)}`;
}

export function parseShareHash(hash: string): SharedLineupData | null {
  const match = hash.match(/#s=([A-Za-z0-9\-_]+)/);
  if (!match) return null;
  try {
    return decodeLineup(match[1]);
  } catch {
    return null;
  }
}
