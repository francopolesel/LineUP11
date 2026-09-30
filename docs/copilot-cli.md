# Uso de GitHub Copilot CLI en Lineup 11

Este documento registra cómo se usó asistencia de IA tipo CLI durante el desarrollo del MVP,
qué tareas se delegaron y qué aprendizajes quedaron.

> Nota: el desarrollo de este repo se apoyó en herramientas de IA para
> generación de código, debugging, refactorización y tests, en línea con el
> objetivo SMART del proyecto.

## 1. Alcance del MVP documentado

Funcionalidades cubiertas por el MVP:

- Selección de formaciones tácticas (`src/domain/entities/formations.ts`):
  4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1 + formación libre `custom`.
- Incorporación de jugadores: `LineupService.addPlayerToLineup` + `addSubstituteToLineup`
  (`src/domain/services/lineupService.ts`).
- Posicionamiento con drag & drop: `src/presentation/components/App.tsx` (`handleDragEnd`),
  `Pitch.tsx`, `PlayerSlot.tsx` con `@dnd-kit/core`.
- Edición de datos:
  - Alineación: `updateLineupDetails`, `renameLineup`
  - Jugador (titular o suplente): `renamePlayerInLineup` → `renamePlayer` (use-case + store)
  - Equipo: `updateColor`, `updateShirt`
- Guardado de alineaciones: `LocalStorageLineupRepository`
  (`src/infrastructure/persistence/localStorageLineupRepository.ts`) + acciones
  `saveCurrentLineup / loadAllLineups / loadLineup / deleteLineup` en
  `src/presentation/store/lineupStore.ts`.
- Extras que superan el MVP: banca de 7 suplentes con promover/degradar,
  export PNG (`canvasExportService.ts`), share URL (`shareService.ts`),
  i18n en/es, dark mode, camisetas históricas.

## 2. Cómo se usó la asistencia CLI

Ejemplos de prompts/tareas delegadas:

1. **Generación de código**
   - `Crear FORMATION_PRESETS con coordenadas x/y para 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1`
   - `Generar LineupService con cap 11 titulares + 7 suplentes y swap al mover`
   - `Generar LocalStorageLineupRepository con normalize y safe-parse`
2. **Implementación de funcionalidades**
   - `Agregar rename de jugador titular/suplente en domain + use-case + store + UI inline-edit`
   - `Mostrar badge de posición (GK, CB, CM…) siempre visible sin tapar el nombre`
3. **Debugging**
   - `Corregir drop de suplente a pitch en modo custom (customX/customY clamp 5-95)`
   - `Evitar colisión de nombre vs badge en fila GK (y > 80)`
4. **Refactorización**
   - `Extraer getFormationPositions para unificar Pitch UI + export canvas`
   - `Partir PlayerPool en StarterCard / BenchSection / SubCard`
5. **Tests**
   - `Generar tests vitest para rename: nombre vacío, jugador inexistente, persiste en repo`
   - `Verificar i18n en/es para pool.rename / pool.save / pool.cancel`

## 3. Flujo de trabajo habitual

1. Describir la tarea en una frase + archivos involucrados.
2. Dejar que el CLI proponga el diff.
3. Revisar el diff (no aceptar a ciegas), correr `npm run test` y `npm run dev`.
4. Ajustar a mano estilos/nombres según convenciones del repo.
5. Guardar en memoria la decisión si es arquitectónica.

## 4. Aprendizajes principales

- **La IA acelera el boilerplate, no el diseño:** formaciones, services y repos salen
  rápido, pero las decisiones (¿rename muta `players` y `substitutes` a la vez?,
  ¿dónde va el badge para no tapar el nombre?) las toma el humano.
- **Especificar IDs y paths evita alucinaciones:** decir
  `src/domain/services/lineupService.ts:renamePlayerInLineup` es más fiable que
  `agregá rename donde corresponda`.
- **Verificación obligatoria:** todo cambio se valida con `npm run test`
  (vitest) + prueba manual en `http://localhost:5173/`.
- **UI mínima > UI ingeniosa:** el badge de posición fijo en `-bottom-2` con
  `pointer-events-none` no rompe drag & drop y no tapa el nombre (que va en
  `top-full` o `bottom-full` para GK). La versión hover-only ahorraba píxeles
  pero escondía información táctica clave.
- **Documentar mientras se construye:** este archivo existe porque el objetivo
  medible pedía evidencia del uso de IA, no solo el MVP.

## 5. Cómo reproducir

```bash
npm install
npm run dev     # http://localhost:5173/
npm run test    # vitest run
npm run build   # tsc --noEmit && vite build
```

## 6. Próximos pasos sugeridos

- Renombrar jugador también desde el `PlayerSlot` del pitch (hoy solo desde el pool).
- Incluir badge de posición en el export PNG (`drawPlayers`).
- Persistir en backend en lugar de solo `localStorage`.
