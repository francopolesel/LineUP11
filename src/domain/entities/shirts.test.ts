import { describe, it, expect } from 'vitest'
import { SHIRTS, SHIRT_PATTERNS, getShirt } from './shirts'

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('SHIRTS catalog', () => {
  it('has 30 shirts', () => {
    expect(SHIRTS).toHaveLength(30);
  })

  it('has unique ids', () => {
    const ids = SHIRTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  })

  it('includes the requested historic shirts', () => {
    for (const id of ['argentina', 'river', 'boca', 'real-madrid', 'barcelona', 'bayern', 'man-united']) {
      expect(getShirt(id)?.name, id).toBeTruthy();
    }
  })

  it('uses valid hex colors and known patterns', () => {
    for (const shirt of SHIRTS) {
      expect(shirt.base, `${shirt.id}.base`).toMatch(HEX);
      expect(shirt.accent, `${shirt.id}.accent`).toMatch(HEX);
      expect(shirt.trim, `${shirt.id}.trim`).toMatch(HEX);
      if (shirt.accent2) expect(shirt.accent2, `${shirt.id}.accent2`).toMatch(HEX);
      expect(SHIRT_PATTERNS, shirt.id).toContain(shirt.pattern);
      expect(shirt.name.trim().length, shirt.id).toBeGreaterThan(0);
    }
  })

  it('returns undefined for unknown ids', () => {
    expect(getShirt('nope')).toBeUndefined();
    expect(getShirt(null)).toBeUndefined();
  })
})
