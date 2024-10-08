import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGame } from '@/game/interfaces/game';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { SavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import {
  COPPER_VALUE,
  CURSE_VP,
  DUCHY_VP,
  ESTATE_VP,
  GOLD_VALUE,
  HAND_STARTING_COPPERS,
  HAND_STARTING_ESTATES,
  PROVINCE_VP,
  SILVER_VALUE,
  COLONY_VP,
  PLATINUM_VALUE,
} from '@/game/constants';
import { computeStartingSupply as computeBaseStartingSupply } from '@/game/interfaces/set-kingdom/base';
import {
  computeStartingSupply as computeProsperityStartingSupply,
  NullSet as ProsperityNullSet,
} from '@/game/interfaces/set-kingdom/prosperity';
import { IPlayer } from '@/game/interfaces/player';
import { PlayerField, PlayerSubField } from '@/game/types';

export function calculateVictoryPoints(player: IPlayer): number {
  // Add null checks and default values
  const estatePoints = (player.victory.estates || 0) * ESTATE_VP;
  const duchyPoints = (player.victory.duchies || 0) * DUCHY_VP;
  const provincePoints = (player.victory.provinces || 0) * PROVINCE_VP;
  const colonyPoints = (player.victory.colonies || 0) * COLONY_VP;
  const tokenPoints = player.victory.tokens || 0;
  const otherPoints = player.victory.other || 0;
  const cursePoints = (player.victory.curses || 0) * CURSE_VP;

  return (
    estatePoints +
    duchyPoints +
    provincePoints +
    colonyPoints +
    tokenPoints +
    otherPoints +
    cursePoints
  );
}

export function calculateRawFunds(player: IPlayer): number {
  const copperValue = (player.supply.copper || 0) * COPPER_VALUE;
  const silverValue = (player.supply.silver || 0) * SILVER_VALUE;
  const goldValue = (player.supply.gold || 0) * GOLD_VALUE;
  const platinumValue = (player.supply.platinum || 0) * PLATINUM_VALUE;
  return copperValue + silverValue + goldValue + platinumValue;
}

export function calculateInitialSupply(
  numPlayers: number,
  curses: boolean,
  prosperity: boolean
): IGameSupply {
  const baseSupply = computeBaseStartingSupply(numPlayers, curses);
  const prosperitySupply = prosperity
    ? computeProsperityStartingSupply(numPlayers)
    : ProsperityNullSet;
  return { ...baseSupply, ...prosperitySupply };
}

export function distributeInitialSupply(game: IGame): IGame {
  const updatedGame = { ...game };
  updatedGame.players = updatedGame.players.map((player) => {
    const updatedPlayer = { ...player };
    updatedPlayer.supply.copper += HAND_STARTING_COPPERS;
    updatedGame.supply.copper -= HAND_STARTING_COPPERS;
    if (updatedGame.players.length >= 5) {
      // insufficient estates for 5+ players, distribute 2 estates and 1 additional copper
      updatedPlayer.supply.estate += HAND_STARTING_ESTATES - 1;
      updatedPlayer.supply.copper += 1;
      updatedGame.supply.copper -= 1;
      updatedPlayer.victory.estates += HAND_STARTING_ESTATES - 1;
    } else {
      updatedPlayer.supply.estate += HAND_STARTING_ESTATES;
      updatedPlayer.victory.estates += HAND_STARTING_ESTATES;
    }
    return updatedPlayer;
  });
  return updatedGame;
}

export function victoryFieldToGameLogAction<T extends PlayerField>(
  field: PlayerField,
  subfield: PlayerSubField<T>,
  increment: number
): GameLogActionWithCount {
  switch (field) {
    case 'turn':
      switch (subfield) {
        case 'actions':
          return increment > 0
            ? GameLogActionWithCount.ADD_ACTIONS
            : GameLogActionWithCount.REMOVE_ACTIONS;
        case 'buys':
          return increment > 0
            ? GameLogActionWithCount.ADD_BUYS
            : GameLogActionWithCount.REMOVE_BUYS;
        case 'coins':
          return increment > 0
            ? GameLogActionWithCount.ADD_COINS
            : GameLogActionWithCount.REMOVE_COINS;
        default:
          throw new Error(`Invalid turn subfield: ${subfield as string}`);
      }
    case 'mats':
      switch (subfield) {
        case 'coffers':
          return increment > 0
            ? GameLogActionWithCount.ADD_COFFERS
            : GameLogActionWithCount.REMOVE_COFFERS;
        case 'villagers':
          return increment > 0
            ? GameLogActionWithCount.ADD_VILLAGERS
            : GameLogActionWithCount.REMOVE_VILLAGERS;
        case 'debt':
          return increment > 0
            ? GameLogActionWithCount.ADD_DEBT
            : GameLogActionWithCount.REMOVE_DEBT;
        case 'favors':
          return increment > 0
            ? GameLogActionWithCount.ADD_FAVORS
            : GameLogActionWithCount.REMOVE_FAVORS;
        case 'prophecy':
          return increment > 0
            ? GameLogActionWithCount.ADD_PROPHECY
            : GameLogActionWithCount.REMOVE_PROPHECY;
        default:
          throw new Error(`Invalid mats subfield: ${subfield as string}`);
      }
    case 'victory':
      switch (subfield) {
        case 'curses':
          return increment > 0
            ? GameLogActionWithCount.ADD_CURSES
            : GameLogActionWithCount.REMOVE_CURSES;
        case 'estates':
          return increment > 0
            ? GameLogActionWithCount.ADD_ESTATES
            : GameLogActionWithCount.REMOVE_ESTATES;
        case 'duchies':
          return increment > 0
            ? GameLogActionWithCount.ADD_DUCHIES
            : GameLogActionWithCount.REMOVE_DUCHIES;
        case 'provinces':
          return increment > 0
            ? GameLogActionWithCount.ADD_PROVINCES
            : GameLogActionWithCount.REMOVE_PROVINCES;
        case 'colonies':
          return increment > 0
            ? GameLogActionWithCount.ADD_COLONIES
            : GameLogActionWithCount.REMOVE_COLONIES;
        case 'tokens':
          return increment > 0
            ? GameLogActionWithCount.ADD_VP_TOKENS
            : GameLogActionWithCount.REMOVE_VP_TOKENS;
        case 'other':
          return increment > 0
            ? GameLogActionWithCount.ADD_OTHER_VP
            : GameLogActionWithCount.REMOVE_OTHER_VP;
        default:
          throw new Error(`Invalid victory subfield: ${subfield as string}`);
      }
    case 'newTurn':
      switch (subfield) {
        case 'actions':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS;
        case 'buys':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_BUYS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS;
        case 'coins':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_COINS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_COINS;
        default:
          throw new Error(`Invalid newTurn subfield: ${subfield as string}`);
      }
    default:
      throw new Error(`Invalid field: ${field as string}`);
  }
}

export function logEntryToString(entry: ILogEntry): string {
  const playerName = entry.playerName ? `<${entry.playerName}> ` : '';
  let actionString = entry.action as string;

  if (entry.count !== undefined) {
    actionString = actionString.replace('{COUNT}', entry.count.toString());
  } else {
    // Remove {COUNT} if no count is provided
    actionString = actionString.replace('{COUNT}', '');
  }

  return `${playerName}${actionString}`;
}

export function getStartDateFromLog(logEntries: ILogEntry[]): Date {
  if (logEntries.length === 0) {
    throw new Error('Log entries are empty.');
  }

  const startGameEntry = logEntries[0];

  if (startGameEntry.action !== GameLogActionWithCount.START_GAME) {
    throw new Error('The first log entry is not a START_GAME event.');
  }

  return new Date(startGameEntry.timestamp);
}

export function getTimeSpanFromStartGame(startDate: Date, eventTime: Date): string {
  const timeSpan = eventTime.getTime() - startDate.getTime();

  // Convert time span from milliseconds to a human-readable format
  const seconds = Math.floor((timeSpan / 1000) % 60);
  const minutes = Math.floor((timeSpan / (1000 * 60)) % 60);
  const hours = Math.floor((timeSpan / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeSpan / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function verifyEnumKeysMatch(enum1: object, enum2: object): boolean {
  const keys1 = Object.keys(enum1);
  const keys2 = Object.keys(enum2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
  }

  return true;
}

export const saveGame = async (game: IGame, saveName: string) => {
  try {
    const saveId = `${saveName}_${Date.now()}`;
    const gameToSave = {
      ...game,
      log: game.log.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      })),
    };
    const jsonValue = JSON.stringify(gameToSave);
    await AsyncStorage.setItem(`@dominion_game_${saveId}`, jsonValue);

    // Update list of saved games
    const savedGames = await getSavedGamesList();
    const newGameMetadata: SavedGameMetadata = {
      id: saveId,
      name: saveName,
      savedAt: new Date(),
    };
    savedGames.push(newGameMetadata);
    await AsyncStorage.setItem(
      '@dominion_saved_games',
      JSON.stringify(
        savedGames.map((game) => ({
          ...game,
          savedAt: game.savedAt.toISOString(),
        }))
      )
    );
  } catch (e) {
    console.error('Error saving game:', e);
  }
};

export const getSavedGamesList = async (): Promise<SavedGameMetadata[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem('@dominion_saved_games');
    if (jsonValue != null) {
      const parsedGames = JSON.parse(jsonValue);
      return parsedGames.map((game: any) => ({
        ...game,
        savedAt: new Date(game.savedAt),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error getting saved games list:', e);
    return [];
  }
};

export const loadGame = async (saveId: string): Promise<IGame | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@dominion_game_${saveId}`);
    if (jsonValue == null) return null;

    const parsedGame = JSON.parse(jsonValue);

    // Parse the timestamps in the log entries
    parsedGame.log = parsedGame.log.map((entry: ILogEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));

    return parsedGame;
  } catch (e) {
    console.error('Error loading game:', e);
    return null;
  }
};

export const deleteSavedGame = async (saveId: string) => {
  try {
    await AsyncStorage.removeItem(`@dominion_game_${saveId}`);

    // Update list of saved games
    let savedGames = await getSavedGamesList();
    savedGames = savedGames.filter((game) => game.id !== saveId);
    await AsyncStorage.setItem('@dominion_saved_games', JSON.stringify(savedGames));
  } catch (e) {
    console.error('Error deleting saved game:', e);
  }
};

export function newPlayer(playerName: string): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    startActionsPerTurn: 1,
    supply: {
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      estate: 0,
      duchy: 0,
      province: 0,
      colony: 0,
      curses: 0,
    },
    mats: {
      villagers: 0,
      coffers: 0,
      debt: 0,
      favors: 0,
    },
    turn: {
      actions: 1,
      buys: 1,
      coins: 0,
    },
    newTurn: {
      actions: 1,
      buys: 1,
      coins: 0,
    },
    victory: {
      tokens: 0,
      estates: 0,
      duchies: 0,
      provinces: 0,
      colonies: 0,
      other: 0,
      curses: 0,
    },
  };
  return newPlayer;
}
