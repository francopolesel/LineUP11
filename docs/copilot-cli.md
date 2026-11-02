# Uso de CLI con IA en Lineup 11

Este documento registra cómo usé asistencia de IA por CLI mientras construía el MVP de Lineup 11: qué se decidió en la conversación, en qué se equivocó el agente y qué hice cuando eso pasó. No es un resumen de funcionalidades; es el registro de un proceso, con las partes que salieron mal incluidas.

## 1. Alcance del MVP

El resultado es un MVP que permite crear y personalizar formaciones de fútbol:

- Selección de esquemas tácticos (4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1 y modo libre).
- Altas de jugadores titulares y suplentes (hasta 7 en el banco), con drag & drop sobre la cancha.
- Edición de datos del jugador y de la alineación.
- Guardado en el navegador, compartir por URL y exportación a PNG.
- Internacionalización español/inglés, modo oscuro y un catálogo de 30 camisetas sobre 8 patrones.

Stack: React 19 + TypeScript + Vite, Zustand para el estado, Tailwind v4, dnd-kit para el arrastre y Vitest para tests. La estructura está separada en `domain`, `application`, `infrastructure` y `presentation`.

## 2. Cómo trabajé con el agente

Arranqué pidiendo código. Fue la peor parte del proyecto: las primeras respuestas eran plausibles pero no encajaban con lo que tenía en la cabeza, y volvían como componentes grandes con la lógica de dominio mezclada con la UI. Cuando entendí que el problema era mi forma de pedir, cambié el orden: primero describir el problema y el alcance, después pedir implementación.

**Stack.** Le pedí comparar opciones de frontend, estado, estilos y drag & drop. La decisión la tomé yo, pero tener las alternativas y sus costos sobre la mesa en una sola conversación me ahorró una tarde de búsquedas.

**Especificar antes de generar.** Trabajé con una dinámica de Spec-Driven Development sin documentos formales: antes de tocar código, definir qué debía hacer la funcionalidad y qué casos borde entraban. El renombrado de jugadores y el guardado de alineaciones salieron mucho mejor después de esa conversación previa que las features que pedí de una.

**TDD donde importaba.** Empecé con 16 tests. Hoy hay 53 en 10 archivos. Con el agente escribíamos primero los casos (nombre vacío, jugador inexistente, límite de titulares y suplentes, normalización de datos viejos guardados en `localStorage`) y después la implementación. En la UI no hice TDD puro y se nota: es la parte con menos cobertura.

**El caso que más me enseñó: la exportación a PNG.** La primera versión sacaba una captura del DOM con `html2canvas`. En producción de prueba, el botón tiraba `Uncaught Attempting to parse unsupported color function` y descargaba un PNG en blanco. La causa: Tailwind v4 emite colores en `oklch()` y `color-mix()`, y `html2canvas` no sabe parsear ninguna de las dos. No era un problema de configuración, era un límite de la librería.

La salida fue sacar la dependencia y dibujar la imagen a mano con la Canvas API: un servicio de 277 líneas que arma la tarjeta con cabecera, líneas de la cancha, chips con el color del equipo y la lista de suplentes. El resultado se ve mejor que la captura y no depende del CSS del navegador. La lección no fue "usá Canvas"; fue que una dependencia que "casi sirve" termina costando más que escribir lo que necesitás.

**El bug que no era un bug.** La cancha seguía mostrando círculos de color cuando el panel lateral ya mostraba las camisetas nuevas. Mi primera reacción fue sospechar del store. Antes de tocar nada, pedí verificar qué estaba sirviendo el servidor: pedí el módulo `PlayerSlot` ya transformado y era el correcto; corrí los tests del flujo y pasaban.

El problema no estaba en el código: había una pestaña vieja con un boundary de HMR roto y dos servidores de Vite vivos (5174 y 5175) respondiendo versiones distintas. Cerré todo, levanté uno solo en 5176 y la camiseta apareció. Cero cambios de código. Y la causa de fondo era mía: había borrado `html2CanvasExportService.ts` sin actualizar antes los imports, y eso rompió el refresh de los módulos que lo importaban.

**Lo que el agente no decidió.** La elección del stack, los límites del plantel, dónde va la información táctica en la UI y el nombre del equipo. Sobre esto último hubo marcha atrás: la entidad tenía `teamName` y `name`, que sonaban a lo mismo en todos lados, así que eliminé `teamName` y dejé un solo nombre que se usa en el modal, el badge, el listado y el nombre del archivo PNG.

## 3. Principales aprendizajes

- Describir el problema antes de pedir código. La diferencia no es de estilo: sin contexto, el agente resuelve el síntoma y te deja el problema.
- Un error de un solo paso cuesta caro después. Borrar un archivo antes de corregir sus imports me costó una sesión entera de debugging de un bug que no existía.
- Cuando la UI contradice el estado, primero hay que decidir de qué lado está la mentira. Mirar el código antes de esa decisión es adivinar.
- Los tests no son una métrica de cobertura, son la red que te permite refactorizar sin miedo. Pasar de 16 a 53 no fue para tener un número más grande.
- Con la IA hay que revisar, pero sobre todo hay que pedir. El agente tiende a resolver rápido y en pocos archivos grandes; la separación por capas y los nombres claros hubo que pedirlos explícitamente en cada iteración.
- Documentar mientras se trabaja. Este archivo existe porque anoté los episodios el mismo día en que pasaron. Al final del proyecto uno se acuerda de que "andaba", no de por qué.

## 4. Cómo reproducir

```bash
npm install
npm run dev     # http://localhost:5173/
npm run test    # 53 tests
npm run build   # tsc --noEmit && vite build
```

Un detalle que me costó caro: correr un solo `npm run dev` a la vez. Dos servidores en puertos distintos sirven versiones distintas del mismo módulo y el navegador te muestra una mezcla que no existe en el código.
