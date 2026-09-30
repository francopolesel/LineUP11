import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Player } from '../../domain/entities';
import type { Shirt } from '../../domain/entities/shirts';
import { useLineupStore, useT } from '../store/lineupStore';
import { ShirtSvg } from './ShirtSvg';

interface PlayerPoolProps {
  starters: Player[];
  substitutes: Player[];
  color: string;
  shirt: Shirt | null;
  onAddPlayer: (name: string) => void;
  onAddSubstitute: (name: string) => void;
  onPromote: (substituteId: string) => void;
  onDemote: (playerId: string) => void;
  onRemoveStarter: (playerId: string) => void;
  onRemoveSubstitute: (substituteId: string) => void;
  onRenameStarter: (playerId: string, newName: string) => void;
  onRenameSubstitute: (substituteId: string, newName: string) => void;
}

const MAX_PLAYERS = 11;
const MAX_SUBS = 7;

export function PlayerPool({
  starters,
  substitutes,
  color,
  shirt,
  onAddPlayer,
  onAddSubstitute,
  onPromote,
  onDemote,
  onRemoveStarter,
  onRemoveSubstitute,
  onRenameStarter,
  onRenameSubstitute,
}: PlayerPoolProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const { isPlayerPoolOpen, setIsPlayerPoolOpen } = useLineupStore();
  const t = useT();
  const isFull = starters.length >= MAX_PLAYERS;
  const isBenchFull = substitutes.length >= MAX_SUBS;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      if (isFull) {
        onAddSubstitute(newPlayerName.trim());
      } else {
        onAddPlayer(newPlayerName.trim());
      }
      setNewPlayerName('');
    }
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubName.trim() && !isBenchFull) {
      onAddSubstitute(newSubName.trim());
      setNewSubName('');
    }
  };

  if (!isPlayerPoolOpen) {
    return (
      <button
        onClick={() => setIsPlayerPoolOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
        aria-label={t('pool.open')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('pool.title')} ({starters.length}/{MAX_PLAYERS})
        </h2>
        <button
          onClick={() => setIsPlayerPoolOpen(false)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
          aria-label={t('pool.close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleAddPlayer} className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder={isFull ? t('subs.add.ph') : t('pool.name.ph')}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim() || (isFull && isBenchFull)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('pool.add')}
          </button>
        </div>
      </form>

      <div className="overflow-y-auto p-4 space-y-2 max-h-[40vh]">
        {starters.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('pool.empty')}</p>
        ) : (
          starters.map((player) => (
            <StarterCard
              key={player.id}
              player={player}
              color={color}
              shirt={shirt}
              onDemote={() => onDemote(player.id)}
              onRemove={() => onRemoveStarter(player.id)}
              onRename={(newName) => onRenameStarter(player.id, newName)}
            />
          ))
        )}
      </div>

      <BenchSection
        substitutes={substitutes}
        color={color}
        shirt={shirt}
        newSubName={newSubName}
        setNewSubName={setNewSubName}
        onAddSub={handleAddSub}
        onPromote={onPromote}
        onRemove={onRemoveSubstitute}
        onRename={onRenameSubstitute}
      />
    </div>
  );
}

function StarterCard({ player, color, shirt, onDemote, onRemove, onRename }: { player: Player; color: string; shirt: Shirt | null; onDemote: () => void; onRemove: () => void; onRename: (newName: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { playerId: player.id, playerName: player.name },
  });
  const t = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== player.name) onRename(trimmed);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 touch-none"
      {...listeners}
      {...attributes}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={shirt ? { backgroundColor: '#f8fafc' } : { backgroundColor: `${color}1A` }}
      >
        {shirt ? (
          <ShirtSvg shirt={shirt} className="w-8 h-8" />
        ) : (
          <span className="font-bold text-sm" style={{ color }}>{player.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(player.name);
              setIsEditing(false);
            }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 px-2 py-1 text-sm border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          aria-label={t('pool.rename')}
        />
      ) : (
        <span
          className="font-medium text-gray-900 dark:text-white truncate"
          onDoubleClick={() => {
            setDraft(player.name);
            setIsEditing(true);
          }}
          title={t('pool.rename')}
        >
          {player.name}
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={commit}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
              aria-label={t('pool.save')}
              title={t('pool.save')}
            >
              ✓
            </button>
            <button
              onClick={() => {
                setDraft(player.name);
                setIsEditing(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label={t('pool.cancel')}
              title={t('pool.cancel')}
            >
              ×
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setDraft(player.name);
                setIsEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
              aria-label={t('pool.rename')}
              title={t('pool.rename')}
            >
              ✎
            </button>
            <button
              onClick={onDemote}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
              aria-label={t('subs.demote')}
              title={t('subs.demote')}
            >
              ↓
            </button>
            <button
              onClick={onRemove}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
              aria-label={t('pool.remove')}
              title={t('pool.remove')}
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BenchSection({
  substitutes,
  color,
  shirt,
  newSubName,
  setNewSubName,
  onAddSub,
  onPromote,
  onRemove,
  onRename,
}: {
  substitutes: Player[];
  color: string;
  shirt: Shirt | null;
  newSubName: string;
  setNewSubName: (v: string) => void;
  onAddSub: (e: React.FormEvent) => void;
  onPromote: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench' });
  const t = useT();
  const isBenchFull = substitutes.length >= MAX_SUBS;

  return (
    <div
      ref={setNodeRef}
      className={`border-t border-gray-200 dark:border-gray-800 p-4 transition-colors ${
        isOver ? 'bg-green-50 dark:bg-green-950' : ''
      }`}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {t('subs.title')} ({substitutes.length}/{MAX_SUBS})
      </h3>
      <form onSubmit={onAddSub} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSubName}
          onChange={(e) => setNewSubName(e.target.value)}
          placeholder={isBenchFull ? t('subs.full') : t('subs.add.ph')}
          disabled={isBenchFull}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
        <button
          type="submit"
          disabled={!newSubName.trim() || isBenchFull}
          className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('subs.add')}
        </button>
      </form>
      <div className="space-y-2 max-h-[30vh] overflow-y-auto">
        {substitutes.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">{t('subs.empty')}</p>
        ) : (
          substitutes.map((sub) => (
            <SubCard key={sub.id} sub={sub} color={color} shirt={shirt} onPromote={() => onPromote(sub.id)} onRemove={() => onRemove(sub.id)} onRename={(newName) => onRename(sub.id, newName)} />
          ))
        )}
      </div>
    </div>
  );
}

function SubCard({ sub, color, shirt, onPromote, onRemove, onRename }: { sub: Player; color: string; shirt: Shirt | null; onPromote: () => void; onRemove: () => void; onRename: (newName: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sub-${sub.id}`,
    data: { substituteId: sub.id, substituteName: sub.name },
  });
  const t = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(sub.name);

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== sub.name) onRename(trimmed);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2.5 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 touch-none"
      {...listeners}
      {...attributes}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={shirt ? { backgroundColor: '#f8fafc' } : { backgroundColor: `${color}1A` }}
      >
        {shirt ? (
          <ShirtSvg shirt={shirt} className="w-6 h-6" />
        ) : (
          <span className="font-bold text-xs" style={{ color }}>{sub.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(sub.name);
              setIsEditing(false);
            }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 px-2 py-1 text-sm border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          aria-label={t('pool.rename')}
        />
      ) : (
        <span
          className="text-sm font-medium text-gray-900 dark:text-white truncate"
          onDoubleClick={() => {
            setDraft(sub.name);
            setIsEditing(true);
          }}
          title={t('pool.rename')}
        >
          {sub.name}
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">
        {isEditing ? (
          <button
            onClick={commit}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
            aria-label={t('pool.save')}
            title={t('pool.save')}
          >
            ✓
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setDraft(sub.name);
                setIsEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
              aria-label={t('pool.rename')}
              title={t('pool.rename')}
            >
              ✎
            </button>
            <button
              onClick={onPromote}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
              aria-label={t('subs.promote')}
              title={t('subs.promote')}
            >
              ↑
            </button>
            <button
              onClick={onRemove}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2.5 py-1 text-base leading-none text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
              aria-label={t('subs.remove')}
              title={t('subs.remove')}
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}
