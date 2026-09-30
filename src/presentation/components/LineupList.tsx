import { useState } from 'react';
import { Lineup } from '../../domain/entities';
import { useLineupStore, useT } from '../store/lineupStore';

interface LineupListProps {
  onLoadLineup: (lineup: Lineup) => void;
  onDeleteLineup: (id: string) => void;
}

export function LineupList({ onLoadLineup, onDeleteLineup }: LineupListProps) {
  const { savedLineups, isLineupListOpen, setIsLineupListOpen, currentLineup } = useLineupStore();
  const t = useT();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isLineupListOpen) {
    return (
      <button
        onClick={() => setIsLineupListOpen(true)}
        className="fixed top-20 left-4 z-40 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors lg:hidden"
        aria-label={t('lineups.open')}
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>
    );
  }

  const handleEdit = (lineup: Lineup) => {
    setEditingId(lineup.id);
    setEditName(lineup.name);
  };

  const handleSaveEdit = async (lineup: Lineup) => {
    if (editName.trim()) {
      const { renameLineup } = useLineupStore.getState();
      await renameLineup(lineup.id, editName.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('lineups.confirm'))) {
      onDeleteLineup(id);
    }
  };

  const close = () => setIsLineupListOpen(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <aside className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lineups.title')}</h2>
          <button
            onClick={close}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t('lineups.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {savedLineups.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('lineups.empty')}</p>
          ) : (
            savedLineups.map((lineup) => (
              <div
                key={lineup.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  currentLineup?.id === lineup.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {editingId === lineup.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(lineup)}
                    />
                    <button
                      onClick={() => handleSaveEdit(lineup)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {t('lineups.save')}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      {t('lineups.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoadLineup(lineup)}>
                      <div className="font-medium text-gray-900 dark:text-white truncate">{lineup.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{lineup.formationId === 'custom' ? t('lineups.custom') : lineup.formationId}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span>{lineup.players.length} {t('lineups.players')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(lineup)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        aria-label={t('lineups.rename')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(lineup.id)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                        aria-label={t('lineups.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
