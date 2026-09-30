import { describe, it, expect } from 'vitest'
import { LineupService } from './lineupService'

describe('LineupService (Lineup11 v1 spec)', () => {
  it('creates a player with trimmed name', () => {
    const p = LineupService.createPlayer('  Messi  ')
    expect(p.name).toBe('Messi')
    expect(p.id).toBeTruthy()
  })

  it('rejects empty player names', () => {
    expect(() => LineupService.createPlayer('   ')).toThrow()
  })

  it('stores playerName when adding to lineup so it persists', () => {
    const lineup = LineupService.createLineup('Dream', '4-4-2')
    const player = LineupService.createPlayer('Messi')
    const updated = LineupService.addPlayerToLineup(lineup, player, 'st-1')
    expect(updated.players).toHaveLength(1)
    expect(updated.players[0].playerName).toBe('Messi')
    expect(updated.players[0].playerId).toBe(player.id)
  })

  it('allows duplicate names', () => {
    const lineup = LineupService.createLineup('Dream', '4-4-2')
    const p1 = LineupService.createPlayer('Messi')
    const p2 = LineupService.createPlayer('Messi')
    let l = LineupService.addPlayerToLineup(lineup, p1, 'st-1')
    l = LineupService.addPlayerToLineup(l, p2, 'st-2')
    expect(l.players).toHaveLength(2)
  })

  it('caps roster at exactly 11 players', () => {    let lineup = LineupService.createLineup('Dream', '4-4-2')
    for (let i = 0; i < 11; i++) {
      const p = LineupService.createPlayer(`Player ${i}`)
      lineup = LineupService.addPlayerToLineup(lineup, p, `pos-${i}`)
    }
    expect(lineup.players).toHaveLength(11)
    const extra = LineupService.createPlayer('Extra')
    expect(() => LineupService.addPlayerToLineup(lineup, extra, 'pos-x')).toThrow()
  })

  it('clears placement when formation changes', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    const p = LineupService.createPlayer('Messi')
    lineup = LineupService.addPlayerToLineup(lineup, p, 'st-1')
    const cleared = LineupService.changeFormation(lineup, '4-3-3')
    expect(cleared.formationId).toBe('4-3-3')
    expect(cleared.players).toHaveLength(0)
  })

  it('renames a starter trimming the name', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    const p = LineupService.createPlayer('Messi')
    lineup = LineupService.addPlayerToLineup(lineup, p, 'st-1')
    const renamed = LineupService.renamePlayerInLineup(lineup, p.id, '  Leo  ')
    expect(renamed.players[0].playerName).toBe('Leo')
  })

  it('renames a substitute', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    const p = LineupService.createPlayer('Dybala')
    lineup = LineupService.addSubstituteToLineup(lineup, p)
    const renamed = LineupService.renamePlayerInLineup(lineup, p.id, 'Paulo')
    expect(renamed.substitutes[0].name).toBe('Paulo')
  })

  it('rejects empty names and unknown players when renaming', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    const p = LineupService.createPlayer('Messi')
    lineup = LineupService.addPlayerToLineup(lineup, p, 'st-1')
    expect(() => LineupService.renamePlayerInLineup(lineup, p.id, '   ')).toThrow()
    expect(() => LineupService.renamePlayerInLineup(lineup, 'missing', 'Ney')).toThrow()
  })
})
