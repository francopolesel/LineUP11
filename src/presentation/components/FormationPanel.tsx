import { Formation } from '../../domain/entities';
import { FORMATION_PRESETS, CUSTOM_FORMATION } from '../../domain/entities/formations';
import { useLineupStore, useT } from '../store/lineupStore';

interface FormationPanelProps {
  onSelectFormation: (formation: Formation) => void;
}

export function FormationPanel({ onSelectFormation }: FormationPanelProps) {
  const { currentFormation, isFormationPanelOpen, setIsFormationPanelOpen } = useLineupStore();
  const t = useT();

  if (!isFormationPanelOpen) {
    return (
      <button
        onClick={() => setIsFormationPanelOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors lg:hidden"
        aria-label={t('formations.open')}
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    );
  }

  const allFormations = [...FORMATION_PRESETS, CUSTOM_FORMATION];
  const close = () => setIsFormationPanelOpen(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <aside className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('formations.title')}</h2>
          <button
            onClick={close}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t('formations.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {allFormations.map((formation) => (
            <button
              key={formation.id}
              onClick={() => {
                onSelectFormation(formation);
                close();
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                currentFormation.id === formation.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">{formation.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formation.id === 'custom'
                  ? t('formations.free')
                  : `${formation.positions.length} ${t('formations.players')}`}
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
