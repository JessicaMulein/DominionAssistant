import { MAX_PLAYERS, MIN_PLAYERS, NOT_PRESENT } from '@/game/constants';
import { IBaseKingdomSet } from '@/game/interfaces/set-kingdom/_base_set';

export interface IBaseKingdom extends IBaseKingdomSet {
  estates: number;
  duchies: number;
  provinces: number;
  coppers: number;
  silvers: number;
  golds: number;
  curses: number;
}

export function computeStartingSupply(numPlayers: number, curses: boolean): IBaseKingdom {
  if (numPlayers < MIN_PLAYERS) {
    throw new Error(`At least ${MIN_PLAYERS} players are required`);
  }
  if (numPlayers > MAX_PLAYERS) {
    throw new Error(`Maximum ${MAX_PLAYERS} players are allowed`);
  }
  return {
    estates: numPlayers <= 2 ? 8 : 12,
    duchies: 12,
    provinces: numPlayers <= 4 ? 12 : numPlayers === 5 ? 15 : 18,
    coppers: 60,
    silvers: 40,
    golds: 30,
    curses: curses ? 10 * (numPlayers - 1) : NOT_PRESENT,
  };
}
