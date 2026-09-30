import { useDroppable } from '@dnd-kit/core';
import { Formation, Position, Lineup } from '../../domain/entities';
import type { Shirt } from '../../domain/entities/shirts';
import { LineupService } from '../../domain/services/lineupService';
import { PlayerSlot } from './PlayerSlot';

interface PitchProps {
  formation: Formation;
  lineup: Lineup;
  shirt: Shirt | null;
  onRemovePlayer: (playerId: string) => void;
}export function findClosestPosition(positions: Position[], x: number, y: number): Position | null {
  if (positions.length === 0) return null;
  let closest = positions[0];
  let minDist = Math.hypot(positions[0].x - x, positions[0].y - y);
  for (const pos of positions) {
    const dist = Math.hypot(pos.x - x, pos.y - y);
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  }
  return closest;
}

function PitchBackground({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: 'pitch' });
  return (
    <div
      ref={setNodeRef}
      data-pitch-drop
      className="relative w-full aspect-[3/4] sm:aspect-[1.5/1] rounded-lg overflow-visible touch-none"
      style={{ backgroundImage: 'linear-gradient(to bottom, #1a5c1a 0%, #2d7d2d 50%, #1a5c1a 100%)' }}
    >
      <div className="absolute inset-0 border-4 border-white/30 pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-white/30 -translate-x-1/2 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-2/5 h-1/4 border-2 border-white/30 border-b-0 rounded-t-lg -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-0 left-1/2 w-2/5 h-1/4 border-2 border-white/30 border-t-0 rounded-b-lg -translate-x-1/2 pointer-events-none" />
      {children}
    </div>
  );
}

export function Pitch({ formation, lineup, shirt, onRemovePlayer }: PitchProps) {
  const positionMap = LineupService.getFormationPositions(formation, lineup);

  return (
    <PitchBackground>
      {Array.from(positionMap.entries()).map(([positionId, position]) => {
        const placedPlayer = lineup.players.find((p) => p.positionId === positionId) ?? null;
        return (
          <PlayerSlot
            key={positionId}
            position={position}
            placedPlayer={placedPlayer}
            color={lineup.color}
            shirt={shirt}
            onRemovePlayer={onRemovePlayer}
          />
        );
      })}
    </PitchBackground>
  );
}
