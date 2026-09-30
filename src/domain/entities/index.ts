export interface Player {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  label: string;
}

export interface PlacedPlayer {
  playerId: string;
  playerName: string;
  positionId: string;
  customX?: number; // for free-form placement
  customY?: number;
}

export interface Formation {
  id: string;
  name: string;
  positions: Position[];
}

export interface Lineup {
  id: string;
  name: string;
  formationId: string;
  color: string;
  /** Preset shirt id, or null for plain color */
  shirtId: string | null;
  players: PlacedPlayer[];
  substitutes: Player[];
  createdAt: string;
  updatedAt: string;
}