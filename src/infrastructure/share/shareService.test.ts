import { describe, it, expect } from 'vitest'
import { LineupService } from '../../domain/services/lineupService'
import { encodeLineup, decodeLineup, parseShareHash } from './shareService'

describe('shareService', () => {
  it('round-trips a lineup with names, accents and color', () => {
    let lineup = LineupService.createLineup('Sueño', '4-3-3', '#1d4ed8')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('Julián Álvarez'), 'st')
    lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Dybala'))
    const decoded = decodeLineup(encodeLineup(lineup))
    expect(decoded.name).toBe('Sueño')
    expect(decoded.color).toBe('#1d4ed8')
    expect(decoded.players[0].playerName).toBe('Julián Álvarez')
    expect(decoded.substitutes[0].name).toBe('Dybala')
  })

  it('round-trips the shirt selection', () => {
    let lineup = LineupService.createLineup('Sueño', '4-4-2')
    lineup = LineupService.setTeamShirt(lineup, 'boca')
    const decoded = decodeLineup(encodeLineup(lineup))
    expect(decoded.shirtId).toBe('boca')
  })

  it('returns null for hashes without shared data', () => {
    expect(parseShareHash('')).toBeNull()
    expect(parseShareHash('#s=!!!')).toBeNull()
  })

  it('rejects tampered or invalid payloads', () => {
    expect(() => decodeLineup('bm90LWpzb24=')).toThrow()
    expect(parseShareHash('#s=bm90LWpzb24=')).toBeNull()
  })

  it('applies defaults for missing optional fields', () => {
    const minimal = { v: 1, name: 'X', players: [] };
    const encoded = btoa(JSON.stringify(minimal)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const decoded = decodeLineup(encoded);
    expect(decoded.formationId).toBe('4-4-2');
    expect(decoded.substitutes).toEqual([]);
  })
})
