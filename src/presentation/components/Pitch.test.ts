import { describe, it, expect } from 'vitest'
import { findClosestPosition } from './Pitch'
import { FORMATION_PRESETS } from '../../domain/entities/formations'

describe('findClosestPosition', () => {
  const positions = FORMATION_PRESETS[0].positions;

  it('snaps to the nearest tactical slot', () => {
    const gk = positions.find((p) => p.id === 'gk')!;
    const closest = findClosestPosition(positions, gk.x + 2, gk.y + 2);
    expect(closest?.id).toBe('gk');
  })

  it('returns null when there are no positions', () => {
    expect(findClosestPosition([], 50, 50)).toBeNull();
  })
})
