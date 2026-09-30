import { Lineup, Player, Formation, PlacedPlayer } from '../../domain/entities';
import { LineupRepository } from '../ports';
import { LineupService } from '../../domain/services/lineupService';

export class LineupUseCases {
  constructor(private repository: LineupRepository) {}

  async createLineup(name: string, formationId: string): Promise<Lineup> {
    const lineup = LineupService.createLineup(name, formationId);
    await this.repository.save(lineup);
    return lineup;
  }

  async getLineup(id: string): Promise<Lineup | null> {
    return this.repository.findById(id);
  }

  async getAllLineups(): Promise<Lineup[]> {
    return this.repository.findAll();
  }

  async saveLineup(lineup: Lineup): Promise<void> {
    await this.repository.save(lineup);
  }

  async deleteLineup(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async addPlayer(lineupId: string, playerName: string, positionId: string, customX?: number, customY?: number): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const player = LineupService.createPlayer(playerName);
    const updatedLineup = LineupService.addPlayerToLineup(lineup, player, positionId, customX, customY);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async removePlayer(lineupId: string, playerId: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.removePlayerFromLineup(lineup, playerId);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async renamePlayer(lineupId: string, playerId: string, newName: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.renamePlayerInLineup(lineup, playerId, newName);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async movePlayer(lineupId: string, playerId: string, newPositionId: string, customX?: number, customY?: number): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.movePlayerInLineup(lineup, playerId, newPositionId, customX, customY);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async updateLineupDetails(lineupId: string, name: string, formationId: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup: Lineup = {
      ...lineup,
      name: name.trim(),
      formationId,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async addSubstitute(lineupId: string, playerName: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const player = LineupService.createPlayer(playerName);
    const updatedLineup = LineupService.addSubstituteToLineup(lineup, player);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async removeSubstitute(lineupId: string, substituteId: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.removeSubstituteFromLineup(lineup, substituteId);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async promoteSubstitute(
    lineupId: string,
    substituteId: string,
    positionId: string,
    customX?: number,
    customY?: number
  ): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.promoteSubstitute(lineup, substituteId, positionId, customX, customY);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async demotePlayer(lineupId: string, playerId: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.demotePlayerToBench(lineup, playerId);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async updateLineupColor(lineupId: string, color: string): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.setTeamColor(lineup, color);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }

  async updateLineupShirt(lineupId: string, shirtId: string | null): Promise<Lineup | null> {
    const lineup = await this.repository.findById(lineupId);
    if (!lineup) return null;

    const updatedLineup = LineupService.setTeamShirt(lineup, shirtId);
    await this.repository.save(updatedLineup);
    return updatedLineup;
  }
}