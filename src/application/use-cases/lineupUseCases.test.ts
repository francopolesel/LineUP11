import { describe, it, expect, beforeEach } from 'vitest'
import { LineupUseCases } from './lineupUseCases'
import { LineupService } from '../../domain/services/lineupService'
import type { LineupRepository } from '../ports'
import type { Lineup } from '../../domain/entities'

class MemoryRepo implements LineupRepository {
  private map = new Map<string, Lineup>();
  async save(lineup: Lineup): Promise<void> {
    this.map.set(lineup.id, structuredClone(lineup));
  }
  async findById(id: string): Promise<Lineup | null> {
    const found = this.map.get(id);
    return found ? structuredClone(found) : null;
  }
  async findAll(): Promise<Lineup[]> {
    return [...this.map.values()].map((l) => structuredClone(l));
  }
  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

describe('LineupUseCases', () => {
  let repo: MemoryRepo;
  let useCases: LineupUseCases;

  beforeEach(() => {
    repo = new MemoryRepo();
    useCases = new LineupUseCases(repo);
  });

  it('creates and persists a lineup with defaults', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    expect(lineup.name).toBe('Dream');
    expect(lineup.color).toBe(LineupService.DEFAULT_COLOR);
    expect(await useCases.getLineup(lineup.id)).toEqual(lineup);
  });

  it('returns null when the lineup does not exist', async () => {
    expect(await useCases.getLineup('missing')).toBeNull();
    expect(await useCases.addPlayer('missing', 'Messi', 'st-1')).toBeNull();
    expect(await useCases.removePlayer('missing', 'x')).toBeNull();
    expect(await useCases.movePlayer('missing', 'x', 'st-1')).toBeNull();
    expect(await useCases.updateLineupDetails('missing', 'N', '4-4-2')).toBeNull();
  });

  it('adds a player persisting the name', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    const updated = await useCases.addPlayer(lineup.id, '  Messi  ', 'st-1');
    expect(updated?.players[0].playerName).toBe('Messi');
  });

  it('enforces the 11-player cap through the use case', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    for (let i = 0; i < 11; i++) {
      await useCases.addPlayer(lineup.id, `Player ${i}`, `pos-${i}`);
    }
    await expect(useCases.addPlayer(lineup.id, 'Extra', 'pos-x')).rejects.toThrow();
  });

  it('moves a player swapping the occupant', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    await useCases.addPlayer(lineup.id, 'A', 'st-1');
    await useCases.addPlayer(lineup.id, 'B', 'st-2');
    const current = (await useCases.getLineup(lineup.id))!;
    const idA = current.players.find((p) => p.playerName === 'A')!.playerId;
    const moved = await useCases.movePlayer(lineup.id, idA, 'st-2');
    expect(moved?.players.find((p) => p.positionId === 'st-2')?.playerName).toBe('A');
    expect(moved?.players.find((p) => p.positionId === 'st-1')?.playerName).toBe('B');
  });

  it('removes a player and updates details keeping the roster', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    await useCases.addPlayer(lineup.id, 'Messi', 'st-1');
    const current = (await useCases.getLineup(lineup.id))!;
    const id = current.players[0].playerId;
    const afterRemove = await useCases.removePlayer(lineup.id, id);
    expect(afterRemove?.players).toHaveLength(0);

    await useCases.addPlayer(lineup.id, 'Neymar', 'st-1');
    const renamed = await useCases.updateLineupDetails(lineup.id, '  New Name  ', '4-3-3');
    expect(renamed?.name).toBe('New Name');
    expect(renamed?.formationId).toBe('4-3-3');
    expect(renamed?.players).toHaveLength(1);
  });

  it('manages substitutes and color end to end', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    await useCases.addSubstitute(lineup.id, 'Dybala');
    let current = (await useCases.getLineup(lineup.id))!;
    expect(current.substitutes).toHaveLength(1);

    const subId = current.substitutes[0].id;
    await useCases.promoteSubstitute(lineup.id, subId, 'st-1');
    current = (await useCases.getLineup(lineup.id))!;
    expect(current.players[0].playerName).toBe('Dybala');

    const starterId = current.players[0].playerId;
    await useCases.demotePlayer(lineup.id, starterId);
    current = (await useCases.getLineup(lineup.id))!;
    expect(current.players).toHaveLength(0);
    expect(current.substitutes).toHaveLength(1);

    const colored = await useCases.updateLineupColor(lineup.id, '#1d4ed8');
    expect(colored?.color).toBe('#1d4ed8');
    await expect(useCases.updateLineupColor(lineup.id, 'nope')).rejects.toThrow();
  });

  it('deletes lineups', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    await useCases.deleteLineup(lineup.id);
    expect(await useCases.getLineup(lineup.id)).toBeNull();
    expect(await useCases.getAllLineups()).toHaveLength(0);
  });

  it('sets and clears the shirt', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    const withShirt = await useCases.updateLineupShirt(lineup.id, 'river');
    expect(withShirt?.shirtId).toBe('river');
    const cleared = await useCases.updateLineupShirt(lineup.id, null);
    expect(cleared?.shirtId).toBeNull();
    await expect(useCases.updateLineupShirt(lineup.id, 'nope')).rejects.toThrow();
    expect(await useCases.updateLineupShirt('missing', 'river')).toBeNull();
  });

  it('renames starters and substitutes', async () => {
    const lineup = await useCases.createLineup('Dream', '4-4-2');
    await useCases.addPlayer(lineup.id, 'Messi', 'st-1');
    await useCases.addSubstitute(lineup.id, 'Dybala');
    let current = (await useCases.getLineup(lineup.id))!;
    const starterId = current.players[0].playerId;
    const subId = current.substitutes[0].id;

    const renamedStarter = await useCases.renamePlayer(lineup.id, starterId, '  Leo  ');
    expect(renamedStarter?.players[0].playerName).toBe('Leo');

    const renamedSub = await useCases.renamePlayer(lineup.id, subId, 'Paulo');
    expect(renamedSub?.substitutes[0].name).toBe('Paulo');

    expect(await useCases.renamePlayer('missing', starterId, 'X')).toBeNull();
    await expect(useCases.renamePlayer(lineup.id, starterId, '   ')).rejects.toThrow();
  });
})
