import { Lineup } from '../../domain/entities';
import { LineupRepository } from '../../application/ports';
import { LineupService } from '../../domain/services/lineupService';
import { getShirt } from '../../domain/entities/shirts';

const STORAGE_KEY = 'lineup11-lineups';

function normalize(stored: Partial<Lineup> & { id: string }): Lineup {
  return {
    id: stored.id,
    name: stored.name ?? 'Untitled',
    formationId: stored.formationId ?? '4-4-2',
    color: stored.color ?? LineupService.DEFAULT_COLOR,
    shirtId: getShirt(stored.shirtId) ? (stored.shirtId as string) : null,
    players: stored.players ?? [],
    substitutes: stored.substitutes ?? [],
    createdAt: stored.createdAt ?? new Date().toISOString(),
    updatedAt: stored.updatedAt ?? new Date().toISOString(),
  };
}

export class LocalStorageLineupRepository implements LineupRepository {
  async save(lineup: Lineup): Promise<void> {
    const lineups = await this.findAll();
    const index = lineups.findIndex((l) => l.id === lineup.id);
    if (index >= 0) {
      lineups[index] = lineup;
    } else {
      lineups.push(lineup);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lineups));
  }

  async findById(id: string): Promise<Lineup | null> {
    const lineups = await this.findAll();
    return lineups.find((l) => l.id === id) || null;
  }

  async findAll(): Promise<Lineup[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data) as Array<Partial<Lineup> & { id: string }>;
      return parsed.map(normalize);
    } catch {
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const lineups = await this.findAll();
    const filtered = lineups.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}