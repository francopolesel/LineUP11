import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Lineup, Formation, Player } from '../../domain/entities';
import { FORMATION_PRESETS, CUSTOM_FORMATION } from '../../domain/entities/formations';
import { LineupUseCases } from '../../application/use-cases/lineupUseCases';
import { LocalStorageLineupRepository } from '../../infrastructure/persistence/localStorageLineupRepository';
import { CanvasExportService } from '../../infrastructure/export/canvasExportService';
import { LineupService } from '../../domain/services/lineupService';
import { translate, type Language, type Theme, type TranslationKey } from '../i18n/translations';
import type { SharedLineupData } from '../../infrastructure/share/shareService';
import { buildShareUrl } from '../../infrastructure/share/shareService';
import { safeFilename } from '../../infrastructure/export/canvasExportService';
import type { ShareResult } from '../../application/ports';

export function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

const repository = new LocalStorageLineupRepository();
const useCases = new LineupUseCases(repository);
const exportService = new CanvasExportService();

interface LineupState {
  // Current lineup being edited
  currentLineup: Lineup | null;
  currentFormation: Formation;
  
  // All saved lineups
  savedLineups: Lineup[];
  
  // UI state
  isPlayerPoolOpen: boolean;
  isFormationPanelOpen: boolean;
  isLineupListOpen: boolean;
  selectedPlayerId: string | null;
  draggedPlayer: Player | null;
  language: Language;
  theme: Theme;
  
  // Actions
  setCurrentLineup: (lineup: Lineup | null) => void;
  setCurrentFormation: (formation: Formation) => void;
  setIsPlayerPoolOpen: (open: boolean) => void;
  setIsFormationPanelOpen: (open: boolean) => void;
  setIsLineupListOpen: (open: boolean) => void;
  setSelectedPlayerId: (id: string | null) => void;
  setDraggedPlayer: (player: Player | null) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  
  // Lineup operations
  createNewLineup: (name: string, formationId: string) => Promise<Lineup>;
  loadLineup: (id: string) => Promise<void>;
  loadSharedLineup: (data: SharedLineupData) => void;
  loadAllLineups: () => Promise<void>;
  saveCurrentLineup: () => Promise<void>;
  deleteLineup: (id: string) => Promise<void>;
  
  // Player operations
  addPlayer: (name: string, positionId: string, customX?: number, customY?: number) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  renamePlayer: (playerId: string, newName: string) => Promise<void>;
  movePlayer: (playerId: string, positionId: string, customX?: number, customY?: number) => Promise<void>;
  addSubstitute: (name: string) => Promise<void>;
  removeSubstitute: (substituteId: string) => Promise<void>;
  promoteSubstitute: (substituteId: string, positionId: string, customX?: number, customY?: number) => Promise<void>;
  demotePlayer: (playerId: string) => Promise<void>;
  updateColor: (color: string) => Promise<void>;
  updateShirt: (shirtId: string | null) => Promise<void>;
  
  // Update lineup details
  updateLineupDetails: (name: string, formationId: string) => Promise<void>;
  renameLineup: (id: string, name: string) => Promise<void>;
  
  // Export
  exportAsPNG: () => Promise<void>;
  shareLineup: () => Promise<ShareResult>;
  
  // Reset
  resetCurrentLineup: () => void;
}

export const useLineupStore = create<LineupState>()(
  persist(
    (set, get) => ({
      currentLineup: null,
      currentFormation: FORMATION_PRESETS[0],
      savedLineups: [],
      isPlayerPoolOpen: true,
      isFormationPanelOpen: false,
      isLineupListOpen: false,
      selectedPlayerId: null,
      draggedPlayer: null,
      language: 'en',
      theme: 'light',

      setCurrentLineup: (lineup) => set({ currentLineup: lineup }),
      setCurrentFormation: (formation) => set({ currentFormation: formation }),
      setIsPlayerPoolOpen: (open) => set({ isPlayerPoolOpen: open }),
      setIsFormationPanelOpen: (open) => set({ isFormationPanelOpen: open }),
      setIsLineupListOpen: (open) => set({ isLineupListOpen: open }),
      setSelectedPlayerId: (id) => set({ selectedPlayerId: id }),
      setDraggedPlayer: (player) => set({ draggedPlayer: player }),
      setLanguage: (language) => set({ language }),
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },

      createNewLineup: async (name, formationId) => {
        const lineup = await useCases.createLineup(name, formationId);
        const formation = FORMATION_PRESETS.find(f => f.id === formationId) || CUSTOM_FORMATION;
        set({ currentLineup: lineup, currentFormation: formation });
        await get().loadAllLineups();
        return lineup;
      },

      loadLineup: async (id) => {
        const lineup = await useCases.getLineup(id);
        if (lineup) {
          const formation = FORMATION_PRESETS.find(f => f.id === lineup.formationId) || CUSTOM_FORMATION;
          set({ currentLineup: lineup, currentFormation: formation });
        }
      },

      loadSharedLineup: (data) => {
        const now = new Date().toISOString();
        const lineup: Lineup = {
          id: uuidv4(),
          name: data.name,
          formationId: data.formationId,
          color: data.color,
          shirtId: data.shirtId,
          players: data.players,
          substitutes: data.substitutes,
          createdAt: now,
          updatedAt: now,
        };
        const formation = FORMATION_PRESETS.find(f => f.id === lineup.formationId) || CUSTOM_FORMATION;
        set({ currentLineup: lineup, currentFormation: formation });
      },

      loadAllLineups: async () => {
        const lineups = await useCases.getAllLineups();
        set({ savedLineups: lineups });
      },

      saveCurrentLineup: async () => {
        const { currentLineup } = get();
        if (currentLineup) {
          await useCases.saveLineup(currentLineup);
          await get().loadAllLineups();
        }
      },

      deleteLineup: async (id) => {
        await useCases.deleteLineup(id);
        const { currentLineup } = get();
        if (currentLineup?.id === id) {
          set({ currentLineup: null });
        }
        await get().loadAllLineups();
      },

      addPlayer: async (name, positionId, customX, customY) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        if (!name.trim()) return;

        try {
          const updated = await useCases.addPlayer(currentLineup.id, name, positionId, customX, customY);
          if (updated) {
            set({ currentLineup: updated });
          }
        } catch {
          // Roster full or invalid name - UI already guards, ignore
        }
      },

      removePlayer: async (playerId) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        
        const updated = await useCases.removePlayer(currentLineup.id, playerId);
        if (updated) {
          set({ currentLineup: updated });
        }
      },

      renamePlayer: async (playerId, newName) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        const trimmed = newName.trim();
        if (!trimmed) return;

        try {
          const updated = await useCases.renamePlayer(currentLineup.id, playerId, trimmed);
          if (updated) {
            set({ currentLineup: updated });
          }
        } catch {
          // Unknown player or invalid name - ignore
        }
      },

      movePlayer: async (playerId, positionId, customX, customY) => {
        const { currentLineup } = get();
        if (!currentLineup) return;

        const updated = await useCases.movePlayer(currentLineup.id, playerId, positionId, customX, customY);
        if (updated) {
          set({ currentLineup: updated });
        }
      },

      addSubstitute: async (name) => {
        const { currentLineup } = get();
        if (!currentLineup || !name.trim()) return;
        try {
          const updated = await useCases.addSubstitute(currentLineup.id, name);
          if (updated) set({ currentLineup: updated });
        } catch {
          // Bench full - UI already guards, ignore
        }
      },

      removeSubstitute: async (substituteId) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        const updated = await useCases.removeSubstitute(currentLineup.id, substituteId);
        if (updated) set({ currentLineup: updated });
      },

      promoteSubstitute: async (substituteId, positionId, customX, customY) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        try {
          const updated = await useCases.promoteSubstitute(currentLineup.id, substituteId, positionId, customX, customY);
          if (updated) set({ currentLineup: updated });
        } catch {
          // No room - UI already guards, ignore
        }
      },

      demotePlayer: async (playerId) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        try {
          const updated = await useCases.demotePlayer(currentLineup.id, playerId);
          if (updated) set({ currentLineup: updated });
        } catch {
          // Bench full - UI already guards, ignore
        }
      },

      updateColor: async (color) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        try {
          const updated = await useCases.updateLineupColor(currentLineup.id, color);
          if (!updated) return;
          // A plain color replaces any preset shirt
          const cleared = await useCases.updateLineupShirt(currentLineup.id, null);
          set({ currentLineup: cleared ?? updated });
        } catch {
          // Invalid color, ignore
        }
      },

      updateShirt: async (shirtId) => {
        const { currentLineup } = get();
        if (!currentLineup) return;
        try {
          const updated = await useCases.updateLineupShirt(currentLineup.id, shirtId);
          if (updated) set({ currentLineup: updated });
        } catch (e) {
          console.error('updateShirt failed', e);
        }
      },

      updateLineupDetails: async (name, formationId) => {
        const { currentLineup } = get();
        if (!currentLineup) return;

        let updated = await useCases.updateLineupDetails(currentLineup.id, name, formationId);
        if (updated && updated.formationId !== currentLineup.formationId) {
          updated = LineupService.changeFormation(updated, formationId);
          await useCases.saveLineup(updated);
        }
        if (updated) {
          const formation = FORMATION_PRESETS.find(f => f.id === formationId) || CUSTOM_FORMATION;
          set({ currentLineup: updated, currentFormation: formation });
          await get().loadAllLineups();
        }
      },

      exportAsPNG: async () => {
        const { currentLineup, currentFormation } = get();
        if (!currentLineup) return;
        await exportService.exportLineup(currentLineup, currentFormation, currentLineup.name);
      },

      shareLineup: async () => {
        const { currentLineup, currentFormation } = get();
        if (!currentLineup) return 'failed';
        const url = buildShareUrl(currentLineup);

        // 1. Native share with the PNG file (mobile: WhatsApp, Instagram, ...)
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try {
            const blob = await exportService.renderLineupBlob(currentLineup, currentFormation);
            const file = new File([blob], `${safeFilename(currentLineup.name)}.png`, { type: 'image/png' });
            if (!navigator.canShare || navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: currentLineup.name });
              return 'shared';
            }
          } catch (e) {
            if ((e as DOMException)?.name === 'AbortError') return 'dismissed';
            // fall through to link share
          }
          // 2. Native share with the link (when files are not supported)
          try {
            await navigator.share({ title: currentLineup.name, url });
            return 'shared';
          } catch (e) {
            if ((e as DOMException)?.name === 'AbortError') return 'dismissed';
            // fall through to clipboard
          }
        }

        // 3. Copy link fallback
        try {
          await navigator.clipboard.writeText(url);
          return 'copied';
        } catch {
          window.prompt('Copy this link:', url);
          return 'copied';
        }
      },

      renameLineup: async (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const lineup = await useCases.getLineup(id);
        if (!lineup) return;
        const updated = await useCases.updateLineupDetails(id, trimmed, lineup.formationId);
        if (updated) {
          const { currentLineup } = get();
          if (currentLineup?.id === id) {
            set({ currentLineup: updated });
          }
          await get().loadAllLineups();
        }
      },

      resetCurrentLineup: () => set({ currentLineup: null, currentFormation: FORMATION_PRESETS[0] }),
    }),
    {
      name: 'lineup11-ui-state',
      partialize: (state) => ({
        isPlayerPoolOpen: state.isPlayerPoolOpen,
        isFormationPanelOpen: state.isFormationPanelOpen,
        isLineupListOpen: state.isLineupListOpen,
        language: state.language,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

export function useT() {
  const language = useLineupStore((s) => s.language);
  return (key: TranslationKey, vars?: Record<string, string | number>) => translate(language, key, vars);
}