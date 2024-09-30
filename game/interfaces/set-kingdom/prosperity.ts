import {
  COLONY_TOTAL_COUNT,
  MAX_PLAYERS,
  MIN_PLAYERS,
  NOT_PRESENT,
  PLATINUM_TOTAL_COUNT,
} from '@/game/constants';
import { IBaseKingdomSet } from '@/game/interfaces/set-kingdom/_base_set';

export interface IProsperityKingdom extends IBaseKingdomSet {
  colony: number;
  platinum: number;
}

export function computeStartingSupply(numPlayers: number): IProsperityKingdom {
  if (numPlayers < MIN_PLAYERS) {
    throw new Error(`At least ${MIN_PLAYERS} players are required`);
  } else if (numPlayers === 2) {
    return {
      colony: 8,
      platinum: PLATINUM_TOTAL_COUNT,
    };
  } else if (numPlayers <= MAX_PLAYERS) {
    return {
      colony: COLONY_TOTAL_COUNT,
      platinum: PLATINUM_TOTAL_COUNT,
    };
  } else {
    throw new Error('Invalid number of players');
  }
}

export const NullSet: IProsperityKingdom = {
  colony: NOT_PRESENT,
  platinum: NOT_PRESENT,
};
