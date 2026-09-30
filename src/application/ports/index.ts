import { Formation, Lineup } from '../../domain/entities';

export interface LineupRepository {
  save(lineup: Lineup): Promise<void>;
  findById(id: string): Promise<Lineup | null>;
  findAll(): Promise<Lineup[]>;
  delete(id: string): Promise<void>;
}

export interface ExportService {
  exportLineup(lineup: Lineup, formation: Formation, filename: string): Promise<void>;
  renderLineupBlob(lineup: Lineup, formation: Formation): Promise<Blob>;
}

export type ShareResult = 'shared' | 'copied' | 'dismissed' | 'failed';