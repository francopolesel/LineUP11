export type ShirtPattern =
  | 'plain'
  | 'stripes-v'
  | 'hoops'
  | 'halves'
  | 'band-h'
  | 'sash'
  | 'center'
  | 'sleeves';

export interface Shirt {
  id: string;
  name: string;
  /** Main fabric color */
  base: string;
  pattern: ShirtPattern;
  /** Pattern color (stripes, band, sash, second half, sleeves) */
  accent: string;
  /** Optional thin flanks for the 'center' pattern */
  accent2?: string;
  /** Collar color */
  trim: string;
}

export const SHIRT_PATTERNS: ShirtPattern[] = [
  'plain',
  'stripes-v',
  'hoops',
  'halves',
  'band-h',
  'sash',
  'center',
  'sleeves',
];

/** Shared silhouette path (100x96 space) used by the SVG and canvas renderers. */
export const SHIRT_SILHOUETTE =
  'M36 8 L22 14 L10 34 L23 41 L28 32 L28 84 Q28 89 33 89 L67 89 Q72 89 72 84 L72 32 L77 41 L90 34 L78 14 L64 8 Q57 16 50 16 Q43 16 36 8 Z';

export const SHIRTS: Shirt[] = [
  { id: 'argentina', name: 'Argentina', base: '#FFFFFF', pattern: 'stripes-v', accent: '#75AADB', trim: '#0F172A' },
  { id: 'river', name: 'River Plate', base: '#FFFFFF', pattern: 'sash', accent: '#D21034', trim: '#000000' },
  { id: 'boca', name: 'Boca Juniors', base: '#003391', pattern: 'band-h', accent: '#FFDD00', trim: '#FFDD00' },
  { id: 'brasil', name: 'Brasil', base: '#FFDF00', pattern: 'plain', accent: '#FFDF00', trim: '#009B3A' },
  { id: 'alemania', name: 'Alemania', base: '#FFFFFF', pattern: 'plain', accent: '#FFFFFF', trim: '#000000' },
  { id: 'francia', name: 'Francia', base: '#002654', pattern: 'plain', accent: '#002654', trim: '#FFFFFF' },
  { id: 'italia', name: 'Italia', base: '#0064AA', pattern: 'plain', accent: '#0064AA', trim: '#FFFFFF' },
  { id: 'espana', name: 'España', base: '#C60B1E', pattern: 'plain', accent: '#C60B1E', trim: '#FFC400' },
  { id: 'inglaterra', name: 'Inglaterra', base: '#FFFFFF', pattern: 'plain', accent: '#FFFFFF', trim: '#012169' },
  { id: 'uruguay', name: 'Uruguay', base: '#5EB0E5', pattern: 'plain', accent: '#5EB0E5', trim: '#000000' },
  { id: 'holanda', name: 'Países Bajos', base: '#FF6A00', pattern: 'plain', accent: '#FF6A00', trim: '#21468B' },
  { id: 'real-madrid', name: 'Real Madrid', base: '#FFFFFF', pattern: 'plain', accent: '#FFFFFF', trim: '#C9A227' },
  { id: 'barcelona', name: 'Barcelona', base: '#A50044', pattern: 'halves', accent: '#004D98', trim: '#EDBB00' },
  { id: 'atletico', name: 'Atlético Madrid', base: '#FFFFFF', pattern: 'stripes-v', accent: '#CB3524', trim: '#0F172A' },
  { id: 'bayern', name: 'Bayern', base: '#DC052D', pattern: 'plain', accent: '#DC052D', trim: '#000000' },
  { id: 'dortmund', name: 'Dortmund', base: '#FDE100', pattern: 'plain', accent: '#FDE100', trim: '#000000' },
  { id: 'psg', name: 'PSG', base: '#004170', pattern: 'center', accent: '#FFFFFF', accent2: '#DA291C', trim: '#FFFFFF' },
  { id: 'man-united', name: 'Manchester United', base: '#DA291C', pattern: 'plain', accent: '#DA291C', trim: '#FFFFFF' },
  { id: 'man-city', name: 'Manchester City', base: '#6CABDD', pattern: 'plain', accent: '#6CABDD', trim: '#FFFFFF' },
  { id: 'liverpool', name: 'Liverpool', base: '#C8102E', pattern: 'plain', accent: '#C8102E', trim: '#F6EB61' },
  { id: 'chelsea', name: 'Chelsea', base: '#034694', pattern: 'plain', accent: '#034694', trim: '#FFFFFF' },
  { id: 'arsenal', name: 'Arsenal', base: '#EF0107', pattern: 'sleeves', accent: '#FFFFFF', trim: '#FFFFFF' },
  { id: 'milan', name: 'Milan', base: '#000000', pattern: 'stripes-v', accent: '#FB090B', trim: '#000000' },
  { id: 'inter', name: 'Inter', base: '#0068A8', pattern: 'stripes-v', accent: '#000000', trim: '#000000' },
  { id: 'juventus', name: 'Juventus', base: '#FFFFFF', pattern: 'stripes-v', accent: '#000000', trim: '#000000' },
  { id: 'ajax', name: 'Ajax', base: '#FFFFFF', pattern: 'center', accent: '#D21034', trim: '#D21034' },
  { id: 'racing', name: 'Racing', base: '#8FD0EA', pattern: 'plain', accent: '#8FD0EA', trim: '#FFFFFF' },
  { id: 'independiente', name: 'Independiente', base: '#D5001C', pattern: 'plain', accent: '#D5001C', trim: '#FFFFFF' },
  { id: 'san-lorenzo', name: 'San Lorenzo', base: '#0A3D91', pattern: 'stripes-v', accent: '#E30613', trim: '#FFFFFF' },
  { id: 'flamengo', name: 'Flamengo', base: '#000000', pattern: 'hoops', accent: '#E30613', trim: '#E30613' },
];

export function getShirt(id: string | null | undefined): Shirt | undefined {
  if (!id) return undefined;
  return SHIRTS.find((s) => s.id === id);
}
