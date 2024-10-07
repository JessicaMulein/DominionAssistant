import { GameLogActionWithCount } from '../enumerations/game-log-action-with-count';

export interface ILogEntry {
  timestamp: Date;
  action: GameLogActionWithCount;
  playerIndex: number;
  playerName?: string;
  count?: number;
  correction?: boolean;
}
