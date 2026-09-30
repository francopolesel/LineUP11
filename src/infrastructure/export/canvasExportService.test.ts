import { describe, it, expect } from 'vitest'
import { safeFilename } from './canvasExportService'

describe('safeFilename', () => {
  it('strips filesystem-illegal characters', () => {
    expect(safeFilename('My Team: 2024/25?')).toBe('My Team 202425');
  })

  it('falls back for blank names', () => {
    expect(safeFilename('   ')).toBe('lineup-11');
  })

  it('keeps accents and normal names untouched', () => {
    expect(safeFilename('Sueño Celeste')).toBe('Sueño Celeste');
  })
})
