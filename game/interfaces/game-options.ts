import { IMatsEnabled } from '@/game/interfaces/mats-enabled';

export interface IGameOptions {
  curses: boolean;
  expansions: {
    prosperity: boolean;
    renaissance: boolean;
    risingSun: boolean;
  };
  mats: IMatsEnabled;
}
