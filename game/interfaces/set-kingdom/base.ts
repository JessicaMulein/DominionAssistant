import { MIN_PLAYERS, NOT_PRESENT } from '@/game/constants';
import { IBaseKingdomSet } from '@/game/interfaces/set-kingdom/_base_set';

export interface IBaseKingdom extends IBaseKingdomSet {
  estate: number;
  duchy: number;
  province: number;
  copper: number;
  silver: number;
  gold: number;
  curses: number;
}

export function computeStartingSupply(numPlayers: number, curses: boolean): IBaseKingdom {
  if (numPlayers < MIN_PLAYERS) {
    throw new Error(`At least ${MIN_PLAYERS} players are required`);
  }
  if (numPlayers === 2) {
    return {
      estate: 8,
      duchy: 8,
      province: 8,
      copper: 60,
      silver: 40,
      gold: 30,
      curses: curses ? 10 : NOT_PRESENT,
    };
  } else if (numPlayers === 3) {
    return {
      estate: 12,
      duchy: 12,
      province: 12,
      copper: 60,
      silver: 40,
      gold: 30,
      curses: curses ? 20 : NOT_PRESENT,
    };
  } else if (numPlayers === 4) {
    return {
      estate: 12,
      duchy: 12,
      province: 12,
      copper: 60,
      silver: 40,
      gold: 30,
      curses: curses ? 30 : NOT_PRESENT,
    };
  } else if (numPlayers === 5) {
    return {
      estate: 12,
      duchy: 12,
      province: 15,
      copper: 120,
      silver: 80,
      gold: 60,
      curses: curses ? 40 : NOT_PRESENT,
    };
  } else if (numPlayers === 6) {
    return {
      estate: 12,
      duchy: 12,
      province: 18,
      copper: 120,
      silver: 80,
      gold: 60,
      curses: curses ? 50 : NOT_PRESENT,
    };
  } else {
    throw new Error('Invalid number of players');
  }
}
