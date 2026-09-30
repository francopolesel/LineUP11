import { Player, Formation, Lineup, PlacedPlayer, Position } from '../entities';
import { getShirt } from '../entities/shirts';
import { v4 as uuidv4 } from 'uuid';

export class LineupService {
  static readonly MAX_PLAYERS = 11;
  static readonly MAX_SUBSTITUTES = 7;
  static readonly DEFAULT_COLOR = '#15803d';

  static createPlayer(name: string): Player {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Player name must not be empty');
    }
    return {
      id: uuidv4(),
      name: trimmed,
    };
  }

  static createLineup(name: string, formationId: string, color: string = LineupService.DEFAULT_COLOR): Lineup {
    if (!name.trim()) {
      throw new Error('Lineup name must not be empty');
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error('Color must be a hex string like #15803d');
    }
    const now = new Date().toISOString();
    return {
      id: uuidv4(),
      name: name.trim(),
      formationId,
      color,
      shirtId: null,
      players: [],
      substitutes: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  static addPlayerToLineup(
    lineup: Lineup,
    player: Player,
    positionId: string,
    customX?: number,
    customY?: number
  ): Lineup {
    if (lineup.players.length >= LineupService.MAX_PLAYERS) {
      throw new Error('Lineup already has 11 players');
    }
    const placedPlayer: PlacedPlayer = {
      playerId: player.id,
      playerName: player.name,
      positionId,
      customX,
      customY,
    };

    return {
      ...lineup,
      players: [...lineup.players, placedPlayer],
      updatedAt: new Date().toISOString(),
    };
  }

  static removePlayerFromLineup(lineup: Lineup, playerId: string): Lineup {
    return {
      ...lineup,
      players: lineup.players.filter((p) => p.playerId !== playerId),
      updatedAt: new Date().toISOString(),
    };
  }

  static movePlayerInLineup(
    lineup: Lineup,
    playerId: string,
    newPositionId: string,
    customX?: number,
    customY?: number
  ): Lineup {
    const occupant = lineup.players.find(
      (p) => p.positionId === newPositionId && p.playerId !== playerId
    );
    return {
      ...lineup,
      players: lineup.players.map((p) => {
        if (p.playerId === playerId) {
          return { ...p, positionId: newPositionId, customX, customY };
        }
        if (occupant && p.playerId === occupant.playerId) {
          const current = lineup.players.find((x) => x.playerId === playerId);
          return {
            ...p,
            positionId: current?.positionId ?? p.positionId,
            customX: undefined,
            customY: undefined,
          };
        }
        return p;
      }),
      updatedAt: new Date().toISOString(),
    };
  }

  static getPlayerAtPosition(lineup: Lineup, positionId: string): PlacedPlayer | undefined {
    return lineup.players.find((p) => p.positionId === positionId);
  }

  static renamePlayerInLineup(lineup: Lineup, playerId: string, newName: string): Lineup {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new Error('Player name must not be empty');
    }
    const isStarter = lineup.players.some((p) => p.playerId === playerId);
    const isSub = lineup.substitutes.some((s) => s.id === playerId);
    if (!isStarter && !isSub) {
      throw new Error('Player not found');
    }
    return {
      ...lineup,
      players: lineup.players.map((p) =>
        p.playerId === playerId ? { ...p, playerName: trimmed } : p
      ),
      substitutes: lineup.substitutes.map((s) =>
        s.id === playerId ? { ...s, name: trimmed } : s
      ),
      updatedAt: new Date().toISOString(),
    };
  }

  static getPlacedPlayer(lineup: Lineup, playerId: string): PlacedPlayer | undefined {
    return lineup.players.find((p) => p.playerId === playerId);
  }

  static changeFormation(lineup: Lineup, formationId: string): Lineup {
    return {
      ...lineup,
      formationId,
      players: [],
      updatedAt: new Date().toISOString(),
    };
  }

  static addSubstituteToLineup(lineup: Lineup, player: Player): Lineup {
    if (lineup.substitutes.length >= LineupService.MAX_SUBSTITUTES) {
      throw new Error('Bench already has 7 substitutes');
    }
    return {
      ...lineup,
      substitutes: [...lineup.substitutes, { id: player.id, name: player.name }],
      updatedAt: new Date().toISOString(),
    };
  }

  static removeSubstituteFromLineup(lineup: Lineup, substituteId: string): Lineup {
    return {
      ...lineup,
      substitutes: lineup.substitutes.filter((s) => s.id !== substituteId),
      updatedAt: new Date().toISOString(),
    };
  }

  static promoteSubstitute(
    lineup: Lineup,
    substituteId: string,
    positionId: string,
    customX?: number,
    customY?: number
  ): Lineup {
    const sub = lineup.substitutes.find((s) => s.id === substituteId);
    if (!sub) {
      throw new Error('Substitute not found');
    }
    const occupant = lineup.players.find((p) => p.positionId === positionId);
    if (!occupant && lineup.players.length >= LineupService.MAX_PLAYERS) {
      throw new Error('Lineup already has 11 players');
    }

    const nextPlayers: PlacedPlayer[] = lineup.players
      .filter((p) => !occupant || p.playerId !== occupant.playerId)
      .concat([{ playerId: sub.id, playerName: sub.name, positionId, customX, customY }]);

    const nextSubstitutes = lineup.substitutes.filter((s) => s.id !== substituteId);
    if (occupant) {
      nextSubstitutes.push({ id: occupant.playerId, name: occupant.playerName });
    }

    return {
      ...lineup,
      players: nextPlayers,
      substitutes: nextSubstitutes,
      updatedAt: new Date().toISOString(),
    };
  }

  static demotePlayerToBench(lineup: Lineup, playerId: string): Lineup {
    const starter = lineup.players.find((p) => p.playerId === playerId);
    if (!starter) {
      throw new Error('Starter not found');
    }
    if (lineup.substitutes.length >= LineupService.MAX_SUBSTITUTES) {
      throw new Error('Bench already has 7 substitutes');
    }
    return {
      ...lineup,
      players: lineup.players.filter((p) => p.playerId !== playerId),
      substitutes: [...lineup.substitutes, { id: starter.playerId, name: starter.playerName }],
      updatedAt: new Date().toISOString(),
    };
  }

  static setTeamColor(lineup: Lineup, color: string): Lineup {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error('Color must be a hex string like #15803d');
    }
    return {
      ...lineup,
      color,
      updatedAt: new Date().toISOString(),
    };
  }

  static setTeamShirt(lineup: Lineup, shirtId: string | null): Lineup {
    if (shirtId !== null && !getShirt(shirtId)) {
      throw new Error(`Unknown shirt: ${shirtId}`);
    }
    return {
      ...lineup,
      shirtId,
      updatedAt: new Date().toISOString(),
    };
  }

  static getFormationPositions(formation: Formation, lineup: Lineup): Map<string, Position> {
    const positionMap = new Map<string, Position>();
    
    formation.positions.forEach((pos) => {
      const placed = lineup.players.find((p) => p.positionId === pos.id);
      if (placed && placed.customX !== undefined && placed.customY !== undefined) {
        positionMap.set(pos.id, { ...pos, x: placed.customX, y: placed.customY });
      } else {
        positionMap.set(pos.id, pos);
      }
    });

    // Add custom positions (players not in formation positions)
    lineup.players.forEach((placed) => {
      if (!positionMap.has(placed.positionId)) {
        positionMap.set(placed.positionId, {
          id: placed.positionId,
          x: placed.customX ?? 50,
          y: placed.customY ?? 50,
          label: '',
        });
      }
    });

    return positionMap;
  }
}