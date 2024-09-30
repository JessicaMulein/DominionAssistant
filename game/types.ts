import { IGameOptions } from './interfaces/game-options';
import { IPlayer } from './interfaces/player';

export type PlayerField = 'turn' | 'mats' | 'victory' | 'newTurn';
export type PlayerSubField<T extends PlayerField> = keyof IPlayer[T];

export type OptionField = keyof IGameOptions;
export type OptionSubField<T extends OptionField> = T extends 'curses'
  ? boolean
  : keyof IGameOptions[T];
