import { IBaseVictory } from './set-victory/base';
import { IProsperityVictory } from './set-victory/prosperity';

export interface IVictoryDetails extends IBaseVictory, IProsperityVictory {
  tokens: number;
  other: number;
}
