import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Position, PlacedPlayer } from '../../domain/entities';
import type { Shirt } from '../../domain/entities/shirts';
import { useT } from '../store/lineupStore';
import { ShirtSvg } from './ShirtSvg';

interface PlayerSlotProps {
  position: Position;
  placedPlayer: PlacedPlayer | null;
  color: string;
  shirt: Shirt | null;
  onRemovePlayer: (playerId: string) => void;
}

export function PlayerSlot({ position, placedPlayer, color, shirt, onRemovePlayer }: PlayerSlotProps) {
  const t = useT();
  const draggableId = placedPlayer ? `placed-${placedPlayer.playerId}` : `empty-${position.id}`;
  const droppableId = `position-${position.id}`;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: placedPlayer
      ? { playerId: placedPlayer.playerId, playerName: placedPlayer.playerName, fromPositionId: position.id }
      : undefined,
    disabled: !placedPlayer,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: droppableId });

  const setRefs = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const style = {
    position: 'absolute' as const,
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: transform
      ? `${CSS.Translate.toString(transform)} translate(-50%, -50%)`
      : 'translate(-50%, -50%)',
    zIndex: isDragging ? 100 : 10,
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (placedPlayer) {
      onRemovePlayer(placedPlayer.playerId);
    }
  };

  return (
    <div ref={setRefs} style={style} className="flex flex-col items-center touch-none">
      {placedPlayer ? (
        <div className="relative group w-16 h-16 sm:w-20 sm:h-20" {...listeners} {...attributes}>
          {shirt ? (
            <>
              <div
                className={`w-full h-full bg-white/95 rounded-full border-2 border-black/20 shadow-lg flex items-center justify-center p-1.5 transition-all duration-200 hover:scale-110 hover:shadow-xl ${
                  isOver ? 'scale-110' : ''
                }`}
              >
                <ShirtSvg shirt={shirt} className="w-full h-full" />
              </div>
              <div className={`absolute left-1/2 -translate-x-1/2 max-w-[6rem] truncate text-[10px] sm:text-xs font-semibold text-white bg-black/60 rounded px-1.5 py-0.5 whitespace-nowrap ${
                position.y > 80 ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}>
                {placedPlayer.playerName}
              </div>
            </>
          ) : (
            <div
              className={`w-full h-full backdrop-blur-sm rounded-full border-2 shadow-lg flex items-center justify-center text-center p-1 transition-all duration-200 hover:scale-110 hover:shadow-xl ${
                isOver ? 'scale-110' : ''
              }`}
              style={{
                backgroundColor: color,
                borderColor: 'rgba(0,0,0,0.25)',
              }}
            >
              <span className="text-xs sm:text-sm font-bold text-white leading-tight break-words">
                {placedPlayer.playerName}
              </span>
            </div>
          )}

          {position.label && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] font-bold tracking-wide text-white bg-green-900/95 border border-white/80 rounded-full px-1.5 py-px shadow whitespace-nowrap pointer-events-none">
              {position.label}
            </div>
          )}

          <button
            onClick={handleRemoveClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
            aria-label={t('slot.remove', { name: placedPlayer.playerName })}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
            isOver
              ? 'bg-white/40 border-white scale-110'
              : 'bg-white/10 border-white/50 hover:bg-white/20 hover:border-white'
          }`}
          aria-label={t('slot.empty', { label: position.label || t('slot.position') })}
        >
          <span className="text-white/70 text-xs font-semibold">{position.label}</span>
        </div>
      )}
    </div>
  );
}
