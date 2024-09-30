import { IGameSupply } from './game-supply';
import { IMatDetails } from './mat-details';
import { IPlayerGameTurnDetails } from './player-game-turn-details';
import { IVictoryDetails } from './victory-details';

export interface IPlayerGameDetails {
  supply: IGameSupply;
  victory: IVictoryDetails;
  mats: IMatDetails;
  startActionsPerTurn: number;
  turn: IPlayerGameTurnDetails;
  newTurn: IPlayerGameTurnDetails;
}
