import { faker } from '@faker-js/faker';
import {
  calculateVictoryPoints,
  logEntryToString,
  newPlayer,
  victoryFieldToGameLogAction,
} from '@/game/dominion-lib';
import { IPlayer } from '@/game/interfaces/player';
import {
  ESTATE_VP,
  DUCHY_VP,
  PROVINCE_VP,
  COLONY_VP,
  CURSE_VP,
  NOT_PRESENT,
} from '@/game/constants';
import { calculateInitialSupply } from '@/game/dominion-lib';
import { IGameOptions } from '@/game/interfaces/game-options';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { distributeInitialSupply } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { HAND_STARTING_ESTATES, HAND_STARTING_COPPERS } from '@/game/constants';
import { IMatsEnabled } from './interfaces/mats-enabled';
import { IExpansionsEnabled } from './interfaces/expansions-enabled';
import { CurrentStep } from './enumerations/current-step';
import { InvalidFieldError } from './errors/invalid-field';
import { GameLogActionWithCount } from './enumerations/game-log-action-with-count';
import { ILogEntry } from './interfaces/log-entry';

describe('calculateVictoryPoints', () => {
  const createMockPlayer = (victory: Partial<IPlayer['victory']>): IPlayer => ({
    name: 'Test Player',
    startActionsPerTurn: 1,
    mats: { coffers: 0, villagers: 0, debt: 0, favors: 0 },
    turn: { actions: 0, buys: 0, coins: 0 },
    newTurn: { actions: 0, buys: 0, coins: 0 },
    victory: {
      estates: 0,
      duchies: 0,
      provinces: 0,
      colonies: 0,
      tokens: 0,
      other: 0,
      curses: 0,
      ...victory,
    },
  });

  it('should calculate points correctly with only estates', () => {
    const player = createMockPlayer({ estates: 3 });
    expect(calculateVictoryPoints(player)).toBe(3 * ESTATE_VP);
  });

  it('should calculate points correctly with only duchies', () => {
    const player = createMockPlayer({ duchies: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * DUCHY_VP);
  });

  it('should calculate points correctly with only provinces', () => {
    const player = createMockPlayer({ provinces: 4 });
    expect(calculateVictoryPoints(player)).toBe(4 * PROVINCE_VP);
  });

  it('should calculate points correctly with only colonies', () => {
    const player = createMockPlayer({ colonies: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * COLONY_VP);
  });

  it('should calculate points correctly with only tokens', () => {
    const player = createMockPlayer({ tokens: 5 });
    expect(calculateVictoryPoints(player)).toBe(5);
  });

  it('should calculate points correctly with only other points', () => {
    const player = createMockPlayer({ other: 3 });
    expect(calculateVictoryPoints(player)).toBe(3);
  });

  it('should calculate points correctly with only curses', () => {
    const player = createMockPlayer({ curses: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * CURSE_VP);
  });

  it('should calculate points correctly with a mix of victory cards', () => {
    const player = createMockPlayer({
      estates: 1,
      duchies: 2,
      provinces: 3,
      colonies: 1,
      tokens: 2,
      other: 1,
      curses: 1,
    });
    const expectedPoints =
      1 * ESTATE_VP + 2 * DUCHY_VP + 3 * PROVINCE_VP + 1 * COLONY_VP + 2 + 1 + 1 * CURSE_VP;
    expect(calculateVictoryPoints(player)).toBe(expectedPoints);
  });

  it('should return 0 for a player with no victory points', () => {
    const player = createMockPlayer({});
    expect(calculateVictoryPoints(player)).toBe(0);
  });

  it('should handle undefined values correctly', () => {
    const player = createMockPlayer({ estates: undefined, duchies: undefined });
    expect(calculateVictoryPoints(player)).toBe(0);
  });
});

describe('calculateInitialSupply', () => {
  const defaultOptions: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false },
    mats: { coffersVillagers: false, debt: false, favors: false },
  };

  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => calculateInitialSupply(1, defaultOptions)).toThrow(MinPlayersError);
  });

  it('should throw MaxPlayersError when players are more than maximum', () => {
    expect(() => calculateInitialSupply(7, defaultOptions)).toThrow(MaxPlayersError);
  });

  it('should return correct supply for 2 players without Prosperity', () => {
    const supply = calculateInitialSupply(2, defaultOptions);
    expect(supply).toEqual({
      estates: 8,
      duchies: 8,
      provinces: 8,
      coppers: 46,
      silvers: 40,
      golds: 30,
      curses: 10,
      colonies: NOT_PRESENT,
      platinums: NOT_PRESENT,
    });
  });

  it('should return correct supply for 4 players without Prosperity', () => {
    const supply = calculateInitialSupply(4, defaultOptions);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: NOT_PRESENT,
      platinums: NOT_PRESENT,
    });
  });

  it('should return correct supply for 4 players with Prosperity', () => {
    const prosperityOptions = {
      ...defaultOptions,
      expansions: { ...defaultOptions.expansions, prosperity: true },
    };
    const supply = calculateInitialSupply(4, prosperityOptions);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: 12,
      platinums: 12,
    });
  });

  it('should return correct supply when curses are disabled', () => {
    const noCursesOptions = { ...defaultOptions, curses: false };
    const supply = calculateInitialSupply(3, noCursesOptions);
    expect(supply.curses).toBe(-1); // Assuming NOT_PRESENT is -1
  });
});

function createMockGame(playerCount: number): IGame {
  const options: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false } as IExpansionsEnabled,
    mats: {
      coffersVillagers: false,
      debt: false,
      favors: false,
    } as IMatsEnabled,
  };
  const supply = calculateInitialSupply(playerCount, options);
  return {
    players: Array(playerCount)
      .fill(null)
      .map(() => newPlayer(faker.person.firstName())),
    supply,
    options,
    risingSun: {
      prophecy: NOT_PRESENT,
      greatLeaderProphecy: false,
    },
    currentTurn: 1,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    selectedPlayerIndex: 0,
    log: [],
    currentStep: CurrentStep.GameScreen,
    setsRequired: 1,
  };
}

describe('distributeInitialSupply', () => {
  it('should distribute initial supply correctly for 2 players', () => {
    const options: IGameOptions = {
      curses: true,
      expansions: {
        prosperity: false,
        renaissance: false,
        risingSun: false,
      } as IExpansionsEnabled,
      mats: {
        coffersVillagers: false,
        debt: false,
        favors: false,
      } as IMatsEnabled,
    };
    const initialSupply = calculateInitialSupply(2, options);
    const mockGame: IGame = {
      players: [{}, {}] as IPlayer[],
      supply: initialSupply,
      options: options,
      risingSun: {
        prophecy: NOT_PRESENT,
        greatLeaderProphecy: false,
      },
      currentTurn: 1,
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [],
      currentStep: CurrentStep.GameScreen,
      setsRequired: 1,
    };

    const updatedGame = distributeInitialSupply(mockGame);

    updatedGame.players.forEach((player) => {
      expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
    });
    expect(updatedGame.supply.coppers).toBe(initialSupply.coppers - 2 * HAND_STARTING_COPPERS);
  });

  it('should throw MinPlayersError when calculating initial supply for less than 2 players', () => {
    expect(() =>
      calculateInitialSupply(1, {
        curses: true,
        expansions: {
          prosperity: false,
          renaissance: false,
          risingSun: false,
        } as IExpansionsEnabled,
        mats: {
          coffersVillagers: false,
          debt: false,
          favors: false,
        } as IMatsEnabled,
      })
    ).toThrow(MinPlayersError);
  });

  it('should distribute the correct number of estates to each player', () => {
    const game = createMockGame(3);
    const updatedGame = distributeInitialSupply(game);

    updatedGame.players.forEach((player) => {
      expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
    });
  });

  it('should reduce the copper supply by the correct amount', () => {
    const game = createMockGame(3);
    const initialCopperSupply = game.supply.coppers;
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.coppers).toBe(initialCopperSupply - 3 * HAND_STARTING_COPPERS);
  });

  it('should work correctly with different numbers of players', () => {
    [2, 3, 4, 5, 6].forEach((playerCount) => {
      const game = createMockGame(playerCount);
      const initialCopperSupply = game.supply.coppers;
      const updatedGame = distributeInitialSupply(game);

      expect(updatedGame.supply.coppers).toBe(
        initialCopperSupply - playerCount * HAND_STARTING_COPPERS
      );
      updatedGame.players.forEach((player) => {
        expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
      });
    });
  });

  it('should not modify other victory card counts', () => {
    const game = createMockGame(3);
    const initialSupply = { ...game.supply };
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.duchies).toBe(initialSupply.duchies);
    expect(updatedGame.supply.provinces).toBe(initialSupply.provinces);
    expect(updatedGame.supply.curses).toBe(initialSupply.curses);
  });

  it('should not modify other supply counts', () => {
    const game = createMockGame(3);
    const initialSupply = { ...game.supply };
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.silvers).toBe(initialSupply.silvers);
    expect(updatedGame.supply.golds).toBe(initialSupply.golds);
  });
});

describe('victoryFieldToGameLogAction', () => {
  it('should return ADD_ACTIONS for turn actions increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'actions', 1)).toBe(
      GameLogActionWithCount.ADD_ACTIONS
    );
  });

  it('should return REMOVE_ACTIONS for turn actions decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'actions', -1)).toBe(
      GameLogActionWithCount.REMOVE_ACTIONS
    );
  });

  it('should return ADD_BUYS for turn buys increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'buys', 1)).toBe(GameLogActionWithCount.ADD_BUYS);
  });

  it('should return REMOVE_BUYS for turn buys decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'buys', -1)).toBe(
      GameLogActionWithCount.REMOVE_BUYS
    );
  });

  it('should return ADD_COINS for turn coins increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'coins', 1)).toBe(GameLogActionWithCount.ADD_COINS);
  });

  it('should return REMOVE_COINS for turn coins decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'coins', -1)).toBe(
      GameLogActionWithCount.REMOVE_COINS
    );
  });

  it('should return ADD_COFFERS for mats coffers increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'coffers', 1)).toBe(
      GameLogActionWithCount.ADD_COFFERS
    );
  });

  it('should return REMOVE_COFFERS for mats coffers decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'coffers', -1)).toBe(
      GameLogActionWithCount.REMOVE_COFFERS
    );
  });

  it('should return ADD_VILLAGERS for mats villagers increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'villagers', 1)).toBe(
      GameLogActionWithCount.ADD_VILLAGERS
    );
  });

  it('should return REMOVE_VILLAGERS for mats villagers decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'villagers', -1)).toBe(
      GameLogActionWithCount.REMOVE_VILLAGERS
    );
  });

  it('should return ADD_DEBT for mats debt increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'debt', 1)).toBe(GameLogActionWithCount.ADD_DEBT);
  });

  it('should return REMOVE_DEBT for mats debt decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'debt', -1)).toBe(
      GameLogActionWithCount.REMOVE_DEBT
    );
  });

  it('should return ADD_FAVORS for mats favors increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'favors', 1)).toBe(
      GameLogActionWithCount.ADD_FAVORS
    );
  });

  it('should return REMOVE_FAVORS for mats favors decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'favors', -1)).toBe(
      GameLogActionWithCount.REMOVE_FAVORS
    );
  });

  it('should return ADD_CURSES for victory curses increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'curses', 1)).toBe(
      GameLogActionWithCount.ADD_CURSES
    );
  });

  it('should return REMOVE_CURSES for victory curses decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'curses', -1)).toBe(
      GameLogActionWithCount.REMOVE_CURSES
    );
  });

  it('should return ADD_ESTATES for victory estates increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'estates', 1)).toBe(
      GameLogActionWithCount.ADD_ESTATES
    );
  });

  it('should return REMOVE_ESTATES for victory estates decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'estates', -1)).toBe(
      GameLogActionWithCount.REMOVE_ESTATES
    );
  });

  it('should return ADD_DUCHIES for victory duchies increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'duchies', 1)).toBe(
      GameLogActionWithCount.ADD_DUCHIES
    );
  });

  it('should return REMOVE_DUCHIES for victory duchies decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'duchies', -1)).toBe(
      GameLogActionWithCount.REMOVE_DUCHIES
    );
  });

  it('should return ADD_PROVINCES for victory provinces increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'provinces', 1)).toBe(
      GameLogActionWithCount.ADD_PROVINCES
    );
  });

  it('should return REMOVE_PROVINCES for victory provinces decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'provinces', -1)).toBe(
      GameLogActionWithCount.REMOVE_PROVINCES
    );
  });

  it('should return ADD_COLONIES for victory colonies increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'colonies', 1)).toBe(
      GameLogActionWithCount.ADD_COLONIES
    );
  });

  it('should return REMOVE_COLONIES for victory colonies decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'colonies', -1)).toBe(
      GameLogActionWithCount.REMOVE_COLONIES
    );
  });

  it('should return ADD_VP_TOKENS for victory tokens increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'tokens', 1)).toBe(
      GameLogActionWithCount.ADD_VP_TOKENS
    );
  });

  it('should return REMOVE_VP_TOKENS for victory tokens decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'tokens', -1)).toBe(
      GameLogActionWithCount.REMOVE_VP_TOKENS
    );
  });

  it('should return ADD_OTHER_VP for victory other increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'other', 1)).toBe(
      GameLogActionWithCount.ADD_OTHER_VP
    );
  });

  it('should return REMOVE_OTHER_VP for victory other decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'other', -1)).toBe(
      GameLogActionWithCount.REMOVE_OTHER_VP
    );
  });

  it('should throw InvalidFieldError for invalid field', () => {
    expect(() => victoryFieldToGameLogAction('invalidField' as any, 'actions', 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should throw InvalidFieldError for invalid subfield', () => {
    expect(() => victoryFieldToGameLogAction('turn', 'invalidSubfield' as any, 1)).toThrow(
      InvalidFieldError
    );
  });
});
describe('logEntryToString', () => {
  it('should return correct string with player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Alice',
      action: GameLogActionWithCount.ADD_COINS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('<Alice> Added 5 Coins');
  });

  it('should return correct string without player name but with count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: undefined,
      action: GameLogActionWithCount.ADD_COINS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('Added 5 Coins');
  });

  it('should return correct string with player name but without count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Bob',
      action: GameLogActionWithCount.ADD_COINS,
      count: undefined,
    };
    expect(logEntryToString(logEntry)).toBe('<Bob> Added Coins');
  });

  it('should return correct string without player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: undefined,
      action: GameLogActionWithCount.ADD_COINS,
      count: undefined,
    };
    expect(logEntryToString(logEntry)).toBe('Added Coins');
  });

  it('should return correct string with special characters in player name', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Alice & Bob',
      action: GameLogActionWithCount.ADD_COINS,
      count: 3,
    };
    expect(logEntryToString(logEntry)).toBe('<Alice & Bob> Added 3 Coins');
  });

  it('should handle undefined count correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Charlie',
      action: GameLogActionWithCount.ADD_COINS,
      count: undefined,
    };
    expect(logEntryToString(logEntry)).toBe('<Charlie> Added Coins');
  });

  it('should handle correction log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Dave',
      action: GameLogActionWithCount.ADD_COINS,
      count: 2,
      correction: true,
    };
    expect(logEntryToString(logEntry)).toBe('<Dave> Added 2 Coins (Correction)');
  });

  it('should handle linked action log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Eve',
      action: GameLogActionWithCount.ADD_COINS,
      count: 4,
      linkedAction: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('<Eve> Added 4 Coins');
  });

  it('should handle log entry with all fields correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Frank',
      action: GameLogActionWithCount.ADD_COINS,
      count: 6,
      correction: true,
      linkedAction: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('<Frank> Added 6 Coins (Correction)');
  });
});
