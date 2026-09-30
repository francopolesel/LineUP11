import { describe, it, expect } from 'vitest'
import { LineupService } from './lineupService'

describe('LineupService substitutes & color', () => {
  it('creates a lineup with default color and empty bench', () => {
    const lineup = LineupService.createLineup('Dream', '4-4-2')
    expect(lineup.color).toBe(LineupService.DEFAULT_COLOR)
    expect(lineup.shirtId).toBeNull()
    expect(lineup.substitutes).toEqual([])
  })

  it('adds substitutes up to 7 and rejects the 8th', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    for (let i = 0; i < 7; i++) {
      lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer(`Sub ${i}`))
    }
    expect(lineup.substitutes).toHaveLength(7)
    expect(() => LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Extra'))).toThrow()
  })

  it('promotes a substitute to a free position', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Messi'))
    const subId = lineup.substitutes[0].id
    lineup = LineupService.promoteSubstitute(lineup, subId, 'st-1')
    expect(lineup.players).toHaveLength(1)
    expect(lineup.players[0].playerName).toBe('Messi')
    expect(lineup.substitutes).toHaveLength(0)
  })

  it('swaps the occupant to the bench when promoting onto an occupied slot', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('Neymar'), 'st-1')
    lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Messi'))
    const subId = lineup.substitutes[0].id
    lineup = LineupService.promoteSubstitute(lineup, subId, 'st-1')
    expect(lineup.players.find((p) => p.positionId === 'st-1')?.playerName).toBe('Messi')
    expect(lineup.substitutes.map((s) => s.name)).toContain('Neymar')
  })

  it('demotes a starter to the bench', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('Neymar'), 'st-1')
    const starterId = lineup.players[0].playerId
    lineup = LineupService.demotePlayerToBench(lineup, starterId)
    expect(lineup.players).toHaveLength(0)
    expect(lineup.substitutes.map((s) => s.name)).toContain('Neymar')
  })

  it('accepts a valid hex color and rejects garbage', () => {
    const lineup = LineupService.createLineup('Dream', '4-4-2')
    expect(LineupService.setTeamColor(lineup, '#1d4ed8').color).toBe('#1d4ed8')
    expect(() => LineupService.setTeamColor(lineup, 'red')).toThrow()
  })

  it('sets a known shirt, clears it with null and rejects unknown ids', () => {
    const lineup = LineupService.createLineup('Dream', '4-4-2')
    expect(LineupService.setTeamShirt(lineup, 'boca').shirtId).toBe('boca')
    expect(LineupService.setTeamShirt(lineup, null).shirtId).toBeNull()
    expect(() => LineupService.setTeamShirt(lineup, 'nope')).toThrow()
  })

  it('swaps starters when moving onto an occupied slot', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('A'), 'st-1')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('B'), 'st-2')
    const idA = lineup.players.find((p) => p.playerName === 'A')!.playerId
    lineup = LineupService.movePlayerInLineup(lineup, idA, 'st-2')
    expect(lineup.players.find((p) => p.positionId === 'st-2')?.playerName).toBe('A')
    expect(lineup.players.find((p) => p.positionId === 'st-1')?.playerName).toBe('B')
  })

  it('removes a starter by id', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('A'), 'st-1')
    const id = lineup.players[0].playerId
    lineup = LineupService.removePlayerFromLineup(lineup, id)
    expect(lineup.players).toHaveLength(0)
  })

  it('keeps the bench when the formation changes', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addPlayerToLineup(lineup, LineupService.createPlayer('A'), 'st-1')
    lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Sub'))
    lineup = LineupService.changeFormation(lineup, '4-3-3')
    expect(lineup.players).toHaveLength(0)
    expect(lineup.substitutes.map((s) => s.name)).toContain('Sub')
  })

  it('removes a substitute by id', () => {
    let lineup = LineupService.createLineup('Dream', '4-4-2')
    lineup = LineupService.addSubstituteToLineup(lineup, LineupService.createPlayer('Sub'))
    const id = lineup.substitutes[0].id
    lineup = LineupService.removeSubstituteFromLineup(lineup, id)
    expect(lineup.substitutes).toHaveLength(0)
  })
})
