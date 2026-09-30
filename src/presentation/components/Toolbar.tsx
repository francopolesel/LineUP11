import { useState } from 'react';
import { useLineupStore, useT } from '../store/lineupStore';
import type { ShareResult } from '../../application/ports';

interface ToolbarProps {
  onNewLineup: (name: string, formationId: string) => void;
  onSaveLineup: () => void;
  onExportPNG: () => void;
  onShare: () => Promise<ShareResult | null>;
  onOpenFormations: () => void;
  onOpenLineups: () => void;
  onTogglePlayerPool: () => void;
}

export function Toolbar({
  onNewLineup,
  onSaveLineup,
  onExportPNG,
  onShare,
  onOpenFormations,
  onOpenLineups,
  onTogglePlayerPool
}: ToolbarProps) {
  const { currentLineup, currentFormation, isPlayerPoolOpen } = useLineupStore();
  const language = useLineupStore((s) => s.language);
  const theme = useLineupStore((s) => s.theme);
  const setLanguage = useLineupStore((s) => s.setLanguage);
  const toggleTheme = useLineupStore((s) => s.toggleTheme);
  const t = useT();
  const [showNewLineupModal, setShowNewLineupModal] = useState(false);
  const [newLineupName, setNewLineupName] = useState('');
  const [selectedFormationId, setSelectedFormationId] = useState('4-4-2');
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const flash = (fn: (v: boolean) => void) => {
    fn(true);
    window.setTimeout(() => fn(false), 2000);
  };

  const handleShare = async () => {
    const result = await onShare();
    if (result === 'shared') flash(setShared);
    else if (result === 'copied') flash(setCopied);
  };

  const handleSave = () => {
    onSaveLineup();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateLineup = () => {
    if (newLineupName.trim()) {
      onNewLineup(newLineupName.trim(), selectedFormationId);
      setShowNewLineupModal(false);
      setNewLineupName('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{t('brand')}</h1>
          </div>

          {currentLineup && (
            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 min-w-0">
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">{currentLineup.name}</span>
                <span className="text-green-600">•</span>
                <span className="text-sm text-green-700 dark:text-green-300">{currentFormation.name}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewLineupModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors hidden sm:flex"
            >
              {t('toolbar.new')}
            </button>

            <button
              onClick={handleSave}
              disabled={!currentLineup}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:flex"
            >
              {saved ? t('toolbar.save.ok') : t('toolbar.save')}
            </button>

            <button
              onClick={onExportPNG}
              disabled={!currentLineup}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:flex"
            >
              {t('toolbar.export')}
            </button>

            <button
              onClick={() => void handleShare()}
              disabled={!currentLineup}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hidden sm:flex"
              title={t('share.btn')}
            >
              {shared ? t('share.shared') : copied ? t('share.copied') : t('share.btn')}
            </button>

            <button
              onClick={onOpenFormations}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('toolbar.formations')}
              title={t('toolbar.formations')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            <button
              onClick={onOpenLineups}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('toolbar.saved')}
              title={t('toolbar.saved')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>

            <button
              onClick={onTogglePlayerPool}
              className={`p-2 rounded-lg transition-colors ${
                isPlayerPoolOpen
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={isPlayerPoolOpen ? t('toolbar.pool.close') : t('toolbar.pool.open')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="px-2 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('toolbar.lang')}
              title={t('toolbar.lang')}
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={theme === 'dark' ? t('toolbar.theme.light') : t('toolbar.theme.dark')}
              title={theme === 'dark' ? t('toolbar.theme.light') : t('toolbar.theme.dark')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {showNewLineupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNewLineupModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('new.title')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new.name')}</label>
                <input
                  type="text"
                  value={newLineupName}
                  onChange={(e) => setNewLineupName(e.target.value)}
                  placeholder={t('new.name.ph')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('new.formation')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1', 'custom'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedFormationId(id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFormationId === id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {id === 'custom' ? t('new.custom') : id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewLineupModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('new.cancel')}
              </button>
              <button
                onClick={handleCreateLineup}
                disabled={!newLineupName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('new.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
