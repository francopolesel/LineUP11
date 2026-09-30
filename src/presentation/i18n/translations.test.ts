import { describe, it, expect } from 'vitest'
import { translate, translationKeys, type TranslationKey } from './translations'

describe('translations', () => {
  it('every English key has a Spanish text', () => {
    const keys: TranslationKey[] = [
      'brand', 'toolbar.new', 'toolbar.save', 'toolbar.export', 'new.title',
      'app.welcome', 'pool.add', 'formations.title', 'lineups.title', 'confirm.ok',
    ];
    for (const key of keys) {
      const text = translate('es', key);
      expect(text).toBeTruthy();
      expect(text).not.toBe(key);
    }
  })

  it('every key is translated and non-empty in both languages', () => {
    expect(translationKeys.length).toBeGreaterThan(30);
    for (const key of translationKeys) {
      expect(translate('en', key), `en:${key}`).toBeTruthy();
      expect(translate('es', key), `es:${key}`).toBeTruthy();
    }
  })

  it('interpolates variables', () => {
    expect(translate('en', 'confirm.body', { formation: '4-3-3', count: 5 })).toContain('4-3-3');
    expect(translate('es', 'confirm.body', { formation: '4-3-3', count: 5 })).toContain('4-3-3');
  })
})
