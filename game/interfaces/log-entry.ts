import { GameLogActionWithCount } from '../enumerations/game-log-action-with-count';

export interface ILogEntry {
  id: string;
  timestamp: Date;
  action: GameLogActionWithCount;
  playerIndex: number;
  playerName?: string;
  count?: number;
  correction?: boolean;
  linkedAction?: string;
}
