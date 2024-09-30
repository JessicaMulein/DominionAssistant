import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from './player';
import { IRenaissanceFeatures } from './set-features/renaissance';
import { IRisingSunFeatures } from './set-features/rising-sun';
import { ILogEntry } from './log-entry';
import { IGameOptions } from './game-options';
import { CurrentStep } from '../enumerations/current-step';

export interface IGame {
  players: IPlayer[];
  options: IGameOptions;
  supply: IGameSupply;
  renaissance?: IRenaissanceFeatures;
  risingSun: IRisingSunFeatures;
  currentTurn: number;
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  selectedPlayerIndex: number;
  log: ILogEntry[];
  currentStep: CurrentStep;
}
