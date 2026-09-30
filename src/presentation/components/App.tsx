import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Formation, Lineup } from '../../domain/entities';
import { FORMATION_PRESETS, CUSTOM_FORMATION } from '../../domain/entities/formations';
import { SHIRTS, getShirt } from '../../domain/entities/shirts';
import { useLineupStore, useT } from '../store/lineupStore';
import { Pitch, findClosestPosition } from './Pitch';
import { ShirtSvg } from './ShirtSvg';
import { PlayerPool } from './PlayerPool';
import { FormationPanel } from './FormationPanel';
import { LineupList } from './LineupList';
import { Toolbar } from './Toolbar';
import { parseShareHash } from '../../infrastructure/share/shareService';
import type { ShareResult } from '../../application/ports';

const TEAM_COLORS = ['#15803d', '#1d4ed8', '#dc2626', '#eab308', '#f97316', '#7c3aed', '#0d9488', '#111827'];

export function App() {
  const {
    currentLineup,
    currentFormation,
    loadAllLineups,
    createNewLineup,
    loadLineup,
    loadSharedLineup,
    saveCurrentLineup,
    deleteLineup,
    addPlayer,
    addSubstitute,
    removeSubstitute,
    promoteSubstitute,
    demotePlayer,
    removePlayer,
    renamePlayer,
    movePlayer,
    updateLineupDetails,
    updateColor,
    updateShirt,
    exportAsPNG,
    shareLineup,
    setIsFormationPanelOpen,
    setIsLineupListOpen,
    setIsPlayerPoolOpen,
    isPlayerPoolOpen,
  } = useLineupStore();

  const exportRef = useRef<HTMLDivElement>(null);
  const [pendingFormation, setPendingFormation] = useState<Formation | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const t = useT();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const shared = parseShareHash(window.location.hash);
    if (shared) {
      loadSharedLineup(shared);
    } else {
      loadAllLineups();
    }
  }, [loadAllLineups, loadSharedLineup]);

  const starters = useMemo(() => {
    if (!currentLineup) return [];
    return currentLineup.players.map((pp) => ({ id: pp.playerId, name: pp.playerName }));
  }, [currentLineup]);

  const substitutes = useMemo(() => currentLineup?.substitutes ?? [], [currentLineup]);
  const shirt = useMemo(
    () => (currentLineup?.shirtId ? (getShirt(currentLineup.shirtId) ?? null) : null),
    [currentLineup]
  );
  const kitColor = shirt?.base ?? currentLineup?.color ?? '#15803d';
  const isIncomplete = (currentLineup?.players.length ?? 11) < 11;

  const handleNewLineup = async (name: string, formationId: string) => {
    await createNewLineup(name, formationId);
  };

  const doExport = async () => {
    await exportAsPNG();
  };

  const handleExportPNG = () => {
    if (isIncomplete) {
      setShowExportConfirm(true);
    } else {
      void doExport();
    }
  };

  const handleShare = async (): Promise<ShareResult | null> => {
    if (!currentLineup) return null;
    return shareLineup();
  };

  const handleSelectFormation = (formation: Formation) => {
    if (!currentLineup || formation.id === currentLineup.formationId) return;
    if (currentLineup.players.length > 0) {
      setPendingFormation(formation);
    } else {
      void updateLineupDetails(currentLineup.name, formation.id);
    }
  };

  const confirmFormationChange = async () => {
    if (!currentLineup || !pendingFormation) return;
    await updateLineupDetails(currentLineup.name, pendingFormation.id);
    setPendingFormation(null);
  };

  const firstFreePosition = (): string | null => {
    if (!currentLineup) return null;
    if (currentFormation.id === 'custom') {
      const used = new Set(currentLineup.players.map((p) => p.positionId));
      let i = 0;
      while (used.has(`custom-${i}`) || used.has(`custom-pos-${i}`)) i++;
      return `custom-pos-${i}`;
    }
    const occupied = new Set(currentLineup.players.map((p) => p.positionId));
    return currentFormation.positions.find((pos) => !occupied.has(pos.id))?.id ?? null;
  };

  const handleAddPlayer = async (name: string) => {
    if (!currentLineup) return;
    if (currentLineup.players.length >= 11) {
      await addSubstitute(name);
      return;
    }
    const free = firstFreePosition();
    if (!free) {
      await addSubstitute(name);
      return;
    }
    if (currentFormation.id === 'custom') {
      const i = currentLineup.players.length;
      await addPlayer(name, free, 20 + (i % 5) * 15, 30 + Math.floor(i / 5) * 20);
      return;
    }
    await addPlayer(name, free);
  };

  const handlePromote = async (substituteId: string) => {
    if (!currentLineup) return;
    const free = firstFreePosition();
    if (currentFormation.id === 'custom') {
      const i = currentLineup.players.length;
      await promoteSubstitute(substituteId, `custom-${substituteId}`, 20 + (i % 5) * 15, 30 + Math.floor(i / 5) * 20);
      return;
    }
    if (!free) return;
    await promoteSubstitute(substituteId, free);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over || !currentLineup) return;
    const overId = String(over.id);
    const data = active.data.current as
      | { playerId?: string; fromPositionId?: string; substituteId?: string }
      | undefined;
    if (!data) return;

    const container = exportRef.current?.querySelector('[data-pitch-drop]') as HTMLElement | null;
    const rect = container?.getBoundingClientRect();
    const activator = event.activatorEvent as PointerEvent | null;
    const dropPoint = () => {
      let x = 50;
      let y = 50;
      if (rect && activator && 'clientX' in activator) {
        x = ((activator.clientX + delta.x - rect.left) / rect.width) * 100;
        y = ((activator.clientY + delta.y - rect.top) / rect.height) * 100;
      }
      return { x, y };
    };

    // Substitute dragged from the bench
    if (data.substituteId) {
      const subId = data.substituteId;
      if (overId.startsWith('position-')) {
        await promoteSubstitute(subId, overId.replace('position-', ''));
        return;
      }
      if (overId === 'pitch') {
        if (currentFormation.id === 'custom') {
          const { x, y } = dropPoint();
          await promoteSubstitute(
            subId,
            `custom-${subId}`,
            Math.min(95, Math.max(5, x)),
            Math.min(95, Math.max(5, y))
          );
        } else {
          const { x, y } = dropPoint();
          const closest = findClosestPosition(currentFormation.positions, x, y);
          if (closest) await promoteSubstitute(subId, closest.id);
        }
      }
      return;
    }

    // Starter dragged (from pitch slot or pool card)
    if (!data.playerId) return;
    const playerId = data.playerId;

    if (overId === 'bench') {
      await demotePlayer(playerId);
      return;
    }

    if (overId.startsWith('position-')) {
      const targetPositionId = overId.replace('position-', '');
      if (targetPositionId === data.fromPositionId) return;
      await movePlayer(playerId, targetPositionId);
      return;
    }

    if (overId === 'pitch') {
      const isCustom = currentFormation.id === 'custom';
      const { x, y } = dropPoint();
      if (isCustom) {
        await movePlayer(
          playerId,
          `custom-${playerId}`,
          Math.min(95, Math.max(5, x)),
          Math.min(95, Math.max(5, y))
        );
      } else {
        const closest = findClosestPosition(currentFormation.positions, x, y);
        if (closest && closest.id !== data.fromPositionId) {
          await movePlayer(playerId, closest.id);
        }
      }
    }
  };

  const handleLoadLineup = async (lineup: Lineup) => {
    await loadLineup(lineup.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toolbar
        onNewLineup={handleNewLineup}
        onSaveLineup={() => void saveCurrentLineup()}
        onExportPNG={handleExportPNG}
        onShare={handleShare}
        onOpenFormations={() => setIsFormationPanelOpen(true)}
        onOpenLineups={() => setIsLineupListOpen(true)}
        onTogglePlayerPool={() => setIsPlayerPoolOpen(!isPlayerPoolOpen)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        {currentLineup ? (
          <DndContext sensors={sensors} onDragEnd={(e) => void handleDragEnd(e)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8" ref={exportRef}>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex-shrink-0 border border-black/20 overflow-hidden bg-white"
                      style={shirt ? undefined : { backgroundColor: currentLineup.color }}
                    >
                      {shirt && <ShirtSvg shirt={shirt} className="w-full h-full" />}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentLineup.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentFormation.name} • {currentLineup.players.length}/11 {t('app.players')}
                        {substitutes.length > 0 && ` • ${substitutes.length} ${t('subs.title').toLowerCase()}`}
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={11}
                    aria-valuenow={currentLineup.players.length}
                  >
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{ width: `${(currentLineup.players.length / 11) * 100}%` }}
                    />
                  </div>
                </div>
                <Pitch
                  formation={currentFormation}
                  lineup={currentLineup}
                  shirt={shirt}
                  onRemovePlayer={(id) => void removePlayer(id)}
                />
              </div>

              <aside className="lg:col-span-4 space-y-6">
                <PlayerPool
                  starters={starters}
                  substitutes={substitutes}
                  color={kitColor}
                  shirt={shirt}
                  onAddPlayer={(n) => void handleAddPlayer(n)}
                  onAddSubstitute={(n) => void addSubstitute(n)}
                  onPromote={(id) => void handlePromote(id)}
                  onDemote={(id) => void demotePlayer(id)}
                  onRemoveStarter={(id) => void removePlayer(id)}
                  onRemoveSubstitute={(id) => void removeSubstitute(id)}
                  onRenameStarter={(id, newName) => void renamePlayer(id, newName)}
                  onRenameSubstitute={(id, newName) => void renamePlayer(id, newName)}
                />
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('app.formations')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {FORMATION_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleSelectFormation(f)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          currentFormation.id === f.id
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.id}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSelectFormation(CUSTOM_FORMATION)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        currentFormation.id === 'custom'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t('new.custom')}
                    </button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('colors.title')}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {TEAM_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => void updateColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          !shirt && currentLineup.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('kit.shirts')}</h3>
                  <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                    {SHIRTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => void updateShirt(currentLineup.shirtId === s.id ? null : s.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all hover:scale-105 ${
                          currentLineup.shirtId === s.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        title={s.name}
                        aria-label={s.name}
                        aria-pressed={currentLineup.shirtId === s.id}
                      >
                        <ShirtSvg shirt={s} className="w-10 h-10" />
                        <span className="text-[10px] leading-tight text-center text-gray-600 dark:text-gray-400 truncate w-full">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </DndContext>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('app.welcome')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('app.welcome.sub')}
            </p>
            <button
              onClick={() => void handleNewLineup('My Dream Team', '4-4-2')}
              className="px-8 py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('app.welcome.cta')}
            </button>
          </div>
        )}

        <FormationPanel onSelectFormation={handleSelectFormation} />
        <LineupList
          onLoadLineup={(l) => void handleLoadLineup(l)}
          onDeleteLineup={(id) => void deleteLineup(id)}
        />
      </main>

      {pendingFormation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('confirm.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('confirm.body', { formation: pendingFormation.name, count: currentLineup?.players.length ?? 0 })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingFormation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('confirm.cancel')}
              </button>
              <button
                onClick={() => void confirmFormationChange()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('confirm.ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('export.confirm.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('export.confirm.body', { current: currentLineup?.players.length ?? 0 })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('export.confirm.cancel')}
              </button>
              <button
                onClick={() => {
                  setShowExportConfirm(false);
                  void doExport();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('export.confirm.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
