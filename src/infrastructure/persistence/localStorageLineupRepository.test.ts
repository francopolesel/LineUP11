import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageLineupRepository } from './localStorageLineupRepository'
import { LineupService } from '../../domain/services/lineupService'

const KEY = 'lineup11-lineups';

describe('LocalStorageLineupRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, finds and deletes lineups', async () => {
    const repo = new LocalStorageLineupRepository();
    const lineup = LineupService.createLineup('Dream', '4-4-2');
    await repo.save(lineup);
    expect(await repo.findById(lineup.id)).toEqual(lineup);
    expect(await repo.findAll()).toHaveLength(1);
    await repo.delete(lineup.id);
    expect(await repo.findAll()).toHaveLength(0);
    expect(await repo.findById(lineup.id)).toBeNull();
  });

  it('normalizes legacy saves missing color and substitutes', async () => {
    const legacy = {
      id: 'legacy-1',
      name: 'Old',
      formationId: '4-4-2',
      teamName: 'Old Team',
      players: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    localStorage.setItem(KEY, JSON.stringify([legacy]));
    const repo = new LocalStorageLineupRepository();
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].color).toBe(LineupService.DEFAULT_COLOR);
    expect(all[0].substitutes).toEqual([]);
    expect(all[0].name).toBe('Old');
  });

  it('returns empty on corrupt storage', async () => {
    localStorage.setItem(KEY, 'not-json{{{');
    const repo = new LocalStorageLineupRepository();
    expect(await repo.findAll()).toEqual([]);
  });
})
