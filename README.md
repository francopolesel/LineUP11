# Lineup 11

Crea y personaliza formaciones de fútbol: elegí esquema táctico, sumá jugadores,
posicionalos con drag & drop, editá sus datos y guardá alineaciones.

## MVP

- Formaciones: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1 + libre (`src/domain/entities/formations.ts`)
- Jugadores: alta, posicionamiento, edición de nombre, suplentes (`PlayerPool.tsx`, `lineupService.ts`)
- Guardado: `localStorage` (`localStorageLineupRepository.ts`)
- Extras: export PNG, share URL, i18n en/es, dark mode, camisetas

## Dev

```bash
npm install
npm run dev    # http://localhost:5173/
npm run test
npm run build
```

## Docs IA

Ver `docs/copilot-cli.md` para uso de asistencia CLI y aprendizajes.
