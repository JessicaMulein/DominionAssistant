import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
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
  NO_PLAYER,
  EmptyGameSupply,
  EmptyMatDetails,
  DefaultTurnDetails,
  EmptyVictoryDetails,
  NoPlayerActions,
} from '@/game/constants';
import { computeStartingSupply as computeBaseStartingSupply } from '@/game/interfaces/set-kingdom/base';
import {
  computeStartingSupply as computeProsperityStartingSupply,
  NullSet as ProsperityNullSet,
} from '@/game/interfaces/set-kingdom/prosperity';
import { IPlayer } from '@/game/interfaces/player';
import { PlayerField, PlayerFieldMap, PlayerSubFields } from '@/game/types';
import { CurrentStep } from '@/game/enumerations/current-step';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IVictoryDetails } from '@/game/interfaces/victory-details';
import { IGameOptions } from './interfaces/game-options';

export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SelectFirstPlayer,
  [CurrentStep.SelectFirstPlayer]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.GameScreen,
  [CurrentStep.GameScreen]: CurrentStep.EndGame,
  [CurrentStep.EndGame]: CurrentStep.EndGame,
};

/**
 * Calculate the victory points for a player.
 * @param player - The player
 * @returns The victory points
 */
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

/**
 * Calculate the initial game kingdom card supply based on the number of players and options.
 * @param numPlayers - The number of players
 * @param curses - Whether curses are included
 * @param prosperity - Whether Prosperity cards are included
 * @returns The initial game supply
 */
export function calculateInitialSupply(numPlayers: number, options: IGameOptions): IGameSupply {
  const baseSupply = computeBaseStartingSupply(numPlayers, options.curses);
  const prosperitySupply = options.expansions.prosperity
    ? computeProsperityStartingSupply(numPlayers)
    : ProsperityNullSet;
  return { ...baseSupply, ...prosperitySupply };
}

/**
 * Distribute the initial supply of cards to the players.
 * @param game - The game
 * @returns The updated game
 */
export function distributeInitialSupply(game: IGame): IGame {
  const updatedGame = { ...game };
  const playerCount = updatedGame.players.length;
  updatedGame.players = updatedGame.players.map((player) => ({
    ...player,
    victory: {
      ...EmptyVictoryDetails,
      estates: HAND_STARTING_ESTATES,
    },
  }));
  updatedGame.supply.coppers -= playerCount * HAND_STARTING_COPPERS;
  return updatedGame;
}

/**
 * Map a victory field and subfield to a game log action.
 * @param field - The field being updated
 * @param subfield - The subfield being updated
 * @param increment - The amount to increment the field by
 * @returns The game log action
 */
export function victoryFieldToGameLogAction<T extends keyof PlayerFieldMap>(
  field: T,
  subfield: PlayerFieldMap[T],
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

/**
 * Transform a log entry to a string.
 * @param entry - The log entry
 * @returns The string representation of the log entry
 */
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

/**
 * Get the start date of the game from the log entries.
 * @param logEntries - The log entries
 * @returns The start date
 */
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

/**
 * Get the time span from the start of the game to the given event time.
 * @param startDate - The start date of the game
 * @param eventTime - The event time
 * @returns The time span from the start of the game to the event time
 */
export function getTimeSpanFromStartGame(startDate: Date, eventTime: Date): string {
  const timeSpan = eventTime.getTime() - startDate.getTime();

  // Convert time span from milliseconds to a human-readable format
  const seconds = Math.floor((timeSpan / 1000) % 60);
  const minutes = Math.floor((timeSpan / (1000 * 60)) % 60);
  const hours = Math.floor((timeSpan / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeSpan / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Add a log entry to the game log.
 * @param playerIndex
 * @param action
 * @param count
 * @param correction If true, this log entry is a correction to a previous entry.
 * @param linkedAction If provided, an ID of a linked action. Some actions are part of a chain and should be linked for undo functionality.
 * @returns
 */
export function addLogEntry(
  game: IGame,
  playerIndex: number,
  action: GameLogActionWithCount,
  count?: number,
  correction?: boolean,
  linkedAction?: string,
  playerTurnDetails?: IPlayerGameTurnDetails[]
): ILogEntry {
  const playerName = playerIndex > -1 ? game.players[playerIndex].name : undefined;
  const newLog: ILogEntry = {
    id: uuidv4(),
    timestamp: new Date(),
    action,
    playerIndex,
    playerName,
    count,
    correction,
    linkedAction,
    playerTurnDetails,
  };
  game.log.push(newLog);
  return newLog;
}

/**
 * Save the game state to local storage.
 * @param game - The game state
 * @param saveName - The name of the save
 * @param saveId - The ID of the save (used to overwrite an existing save)
 */
export async function saveGame(game: IGame, saveName: string, saveId?: string) {
  try {
    const id = saveId ?? uuidv4();
    const gameToSave = {
      ...game,
      log: game.log.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      })),
    };
    const jsonValue = JSON.stringify(gameToSave);
    await AsyncStorage.setItem(`@dominion_game_${id}`, jsonValue);

    // Update list of saved games
    const savedGames = await getSavedGamesList();
    const existingGameIndex = savedGames.findIndex((game) => game.id === id);
    const newGameMetadata: SavedGameMetadata = {
      id: id,
      name: saveName,
      savedAt: new Date(),
    };

    if (existingGameIndex !== -1) {
      // Update existing game metadata
      savedGames[existingGameIndex] = newGameMetadata;
    } else {
      // Add new game metadata
      savedGames.push(newGameMetadata);
    }

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
}

/**
 * Get the list of saved games from local storage.
 * @returns The list of saved games
 */
export async function getSavedGamesList(): Promise<SavedGameMetadata[]> {
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
}

/**
 * Load a game from local storage.
 * @param saveId - The ID of the save
 * @returns The loaded game
 */
export async function loadGame(saveId: string): Promise<IGame | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(`@dominion_game_${saveId}`);
    if (jsonValue == null) return null;

    const parsedGame = JSON.parse(jsonValue);

    // Parse the timestamps in the log entries
    parsedGame.log = parsedGame.log.map((entry: ILogEntry) => ({
      ...entry,
      id: entry.id ?? uuidv4(),
      timestamp: new Date(entry.timestamp),
    }));

    // add the load game entry as we return the game
    return loadGameAddLog(parsedGame);
  } catch (e) {
    console.error('Error loading game:', e);
    return null;
  }
}

/**
 * Delete a saved game from local storage.
 * @param saveId - The ID of the save
 */
export async function deleteSavedGame(saveId: string) {
  try {
    await AsyncStorage.removeItem(`@dominion_game_${saveId}`);

    // Update list of saved games
    let savedGames = await getSavedGamesList();
    savedGames = savedGames.filter((game) => game.id !== saveId);
    await AsyncStorage.setItem('@dominion_saved_games', JSON.stringify(savedGames));
  } catch (e) {
    console.error('Error deleting saved game:', e);
  }
}

/**
 * Create a new player object with default values
 * @param playerName - The name of the player
 * @returns The new player object
 */
export function newPlayer(playerName: string): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    startActionsPerTurn: 1,
    mats: EmptyMatDetails,
    turn: DefaultTurnDetails,
    newTurn: DefaultTurnDetails,
    victory: EmptyVictoryDetails,
  };
  return newPlayer;
}

/**
 * A basic game state with no players or options.
 */
export const EmptyGameState: IGame = {
  currentStep: 1,
  players: [],
  setsRequired: 1,
  supply: EmptyGameSupply,
  options: {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false },
    mats: {
      coffersVillagers: false,
      debt: false,
      favors: false,
    },
  },
  currentTurn: 1,
  risingSun: {
    prophecy: 0,
    greatLeaderProphecy: false,
  },
  currentPlayerIndex: NO_PLAYER,
  firstPlayerIndex: NO_PLAYER,
  selectedPlayerIndex: NO_PLAYER,
  log: [
    {
      id: uuidv4(),
      timestamp: new Date(),
      action: GameLogActionWithCount.START_GAME,
      playerIndex: NO_PLAYER,
    },
  ],
};

/**
 * Initialize the game state with the given number of players and options.
 * @param gameStateWithOptions - The game state with players and selected options
 * @returns The updated game state
 */
export const NewGameState = (gameStateWithOptions: IGame): IGame => {
  // Calculate initial supply
  const initialSupply = calculateInitialSupply(
    gameStateWithOptions.players.length,
    gameStateWithOptions.options
  );

  // Create a new game state with the initial supply
  let newGameState: IGame = {
    ...gameStateWithOptions,
    supply: initialSupply,
    currentStep: CurrentStep.GameScreen,
  };

  // Distribute initial supply to players
  newGameState = distributeInitialSupply(newGameState);

  // Initialize Rising Sun tokens if the expansion is enabled
  if (newGameState.options.expansions.risingSun) {
    newGameState.risingSun = {
      ...newGameState.risingSun,
      prophecy: newGameState.options.expansions.risingSun
        ? calculateInitialSunTokens(newGameState.players.length).suns
        : 0,
      greatLeaderProphecy: newGameState.risingSun.greatLeaderProphecy,
    };
  }

  return newGameState;
};

/**
 * Load a game from local storage and add a log entry for the load event.
 * @param gameState - The game state
 * @returns The updated game state
 */
export function loadGameAddLog(gameState: IGame): IGame {
  /* when loading a game, the most recent entry should be a save game event.
   * we're going to use that id and create a linked entry for new log entry.
   */
  if (gameState.log.length === 0) {
    throw new Error('No log entries found.');
  }
  const lastLog = gameState.log[gameState.log.length - 1];
  if (lastLog.action !== GameLogActionWithCount.SAVE_GAME) {
    throw new Error('Last log entry is not a SAVE_GAME event.');
  }
  addLogEntry(gameState, NO_PLAYER, GameLogActionWithCount.LOAD_GAME, undefined, false, lastLog.id);
  return gameState;
}

/**
 * Returns the linked actions for the given log entry.
 * @param log - The log entries
 * @param index - The index of the log entry
 * @returns The linked actions
 */
export function getLinkedActions(log: ILogEntry[], index: number): ILogEntry[] {
  // do not recurse if the log entry is a linked action itself
  if (log[index].linkedAction !== undefined) {
    return [];
  }
  // get all linked actions
  const linkedActions = log.filter((logEntry) => logEntry.linkedAction === log[index].id);
  return [log[index], ...linkedActions];
}

/**
 * Checks if an action can be undone without causing negative counters.
 * @param game - The current game state
 * @param logIndex - The index of the action to undo in the game log
 * @returns Whether the action can be undone
 */
export function canUndoAction(game: IGame, logIndex: number): boolean {
  if (logIndex < 0 || logIndex >= game.log.length) {
    return false;
  }

  const actionToUndo = game.log[logIndex];

  // Check if it's a NEXT_TURN action that's not the last action
  if (actionToUndo.action === GameLogActionWithCount.NEXT_TURN && logIndex < game.log.length - 1) {
    return false;
  }

  // Create a temporary game state to simulate undoing
  let tempGame = JSON.parse(JSON.stringify(game)) as IGame;

  // Remove the action and its linked actions
  tempGame = removeTargetAndLinkedActions(tempGame, logIndex);

  // Try to reconstruct the game state
  try {
    reconstructGameState(tempGame);
    return true;
  } catch (error) {
    // If an error is thrown, it means we encountered negative counters or other issues
    return false;
  }
}

/**
 * Update the player field with the given increment.
 * @param game - The game state
 * @param playerIndex - The index of the player
 * @param field - The field to update
 * @param subfield - The subfield to update
 * @param increment - The amount to increment the field by
 * @returns The updated game state
 */
export function updatePlayerField<T extends keyof PlayerFieldMap>(
  game: IGame,
  playerIndex: number,
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number
): IGame {
  const updatedGame = { ...game };
  const player = { ...updatedGame.players[playerIndex] };

  if (field === 'victory' || field === 'turn' || field === 'mats' || field === 'newTurn') {
    (player[field] as any)[subfield] = Math.max(
      ((player[field] as any)[subfield] || 0) + increment,
      0
    );
  } else {
    throw new Error(`Invalid field: ${field}`);
  }

  updatedGame.players[playerIndex] = player;
  return updatedGame;
}

export function removeTargetAndLinkedActions(game: IGame, logIndex: number): IGame {
  const updatedGame = { ...game };
  const actionsToRemove = new Set([logIndex]);
  let currentIndex = logIndex;

  while (updatedGame.log[currentIndex].linkedAction) {
    const linkedIndex = updatedGame.log.findIndex(
      (entry) => entry.id === updatedGame.log[currentIndex].linkedAction
    );
    if (linkedIndex !== -1) {
      actionsToRemove.add(linkedIndex);
      currentIndex = linkedIndex;
    } else {
      break;
    }
  }

  const sortedIndicesToRemove = Array.from(actionsToRemove).sort((a, b) => b - a);
  for (const index of sortedIndicesToRemove) {
    updatedGame.log.splice(index, 1);
  }

  return updatedGame;
}

export function findLastNextTurnIndex(log: ILogEntry[]): number {
  return log.findLastIndex((entry) => entry.action === GameLogActionWithCount.NEXT_TURN);
}

export function findStartGameIndex(log: ILogEntry[]): number {
  return log.findIndex((entry) => entry.action === GameLogActionWithCount.START_GAME);
}

/**
 * Undoes a specific action in the game log.
 * @param game - The current game state
 * @param logIndex - The index of the action to undo in the game log
 * @returns The updated game state after undoing the action
 */
export function undoAction(game: IGame, logIndex: number): { game: IGame; success: boolean } {
  if (!canUndoAction(game, logIndex)) {
    return { game, success: false };
  }

  try {
    const gameWithRemovedActions = removeTargetAndLinkedActions(game, logIndex);
    const reconstructedGame = reconstructGameState(gameWithRemovedActions);

    return { game: reconstructedGame, success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Negative counters encountered during reconstruction'
    ) {
      console.error('Cannot undo action: it would result in negative counters');
    } else {
      console.error('Error undoing action:', error);
    }
    return { game, success: false };
  }
}

/**
 * Reconstructs the game state up to a specific log entry.
 * @param game - The current game state
 * @param targetLogIndex - The index of the log entry to reconstruct up to
 * @returns The reconstructed game state
 */
export function reconstructGameState(game: IGame): IGame {
  let reconstructedGame = NewGameState({
    ...EmptyGameState,
    players: game.players.map((player) => ({
      ...player,
      turn: DefaultTurnDetails,
      newTurn: DefaultTurnDetails,
    })),
    options: { ...game.options },
    firstPlayerIndex: game.firstPlayerIndex,
    currentPlayerIndex: game.firstPlayerIndex,
    selectedPlayerIndex: game.firstPlayerIndex,
  });

  const lastNextTurnIndex = findLastNextTurnIndex(game.log);
  const startGameIndex = findStartGameIndex(game.log);

  const replayUpToIndex = lastNextTurnIndex === -1 ? startGameIndex : lastNextTurnIndex;

  for (let i = 0; i <= replayUpToIndex; i++) {
    reconstructedGame = applyLogAction(reconstructedGame, game.log[i]);
    if (hasNegativeCounters(reconstructedGame)) {
      throw new Error('Negative counters encountered during reconstruction');
    }
  }

  for (let i = replayUpToIndex + 1; i < game.log.length; i++) {
    reconstructedGame = applyLogAction(reconstructedGame, game.log[i]);
    if (hasNegativeCounters(reconstructedGame)) {
      throw new Error('Negative counters encountered during reconstruction');
    }
  }

  if (lastNextTurnIndex === -1) {
    reconstructedGame.currentPlayerIndex = reconstructedGame.firstPlayerIndex;
    reconstructedGame.selectedPlayerIndex = reconstructedGame.firstPlayerIndex;
    reconstructedGame.currentTurn = 1;
  } else {
    reconstructedGame.currentPlayerIndex =
      (reconstructedGame.currentPlayerIndex + 1) % reconstructedGame.players.length;
    reconstructedGame.selectedPlayerIndex = reconstructedGame.currentPlayerIndex;
    reconstructedGame.currentTurn =
      Math.floor(lastNextTurnIndex / reconstructedGame.players.length) + 1;
  }

  return reconstructedGame;
}

/**
 * Applies a single log action to the game state.
 * @param game - The current game state
 * @param logEntry - The log entry to apply
 * @returns The updated game state after applying the action
 */
export function applyLogAction(game: IGame, logEntry: ILogEntry): IGame {
  let updatedGame = { ...game };

  if (logEntry.action === GameLogActionWithCount.NEXT_TURN) {
    updatedGame.currentPlayerIndex =
      (updatedGame.currentPlayerIndex + 1 + updatedGame.players.length) %
      updatedGame.players.length;
    updatedGame.currentTurn++;
    // Reset the current player's turn details
    updatedGame.players[updatedGame.currentPlayerIndex].turn = { ...DefaultTurnDetails };
  } else if (logEntry.playerIndex !== NO_PLAYER) {
    const { field, subfield } = getFieldAndSubfieldFromAction(logEntry.action);
    if (field && subfield && logEntry.count) {
      const increment = getActionIncrementMultiplier(logEntry.action) * (logEntry.count || 0);
      updatedGame = updatePlayerField(
        updatedGame,
        logEntry.playerIndex,
        field as keyof PlayerFieldMap,
        subfield,
        increment
      );
    }
  }

  // Handle game-wide counters
  if (
    logEntry.action === GameLogActionWithCount.ADD_PROPHECY ||
    logEntry.action === GameLogActionWithCount.REMOVE_PROPHECY
  ) {
    const increment =
      logEntry.action === GameLogActionWithCount.ADD_PROPHECY
        ? logEntry.count || 1
        : -(logEntry.count || 1);
    if (updatedGame.risingSun) {
      updatedGame.risingSun.prophecy = Math.max(0, updatedGame.risingSun.prophecy + increment);
    }
  }

  // Add handling for any future game-wide counters here

  return updatedGame;
}

/**
 * Checks if the game state has any negative counters (player-specific or game-wide).
 * @param game - The game state to check
 * @returns Whether the game state has any negative counters
 */
function hasNegativeCounters(game: IGame): boolean {
  // Check player-specific counters
  for (const player of game.players) {
    if (
      Object.values(player.turn).some((value) => value < 0) ||
      Object.values(player.mats).some((value) => value < 0) ||
      Object.values(player.victory).some((value) => value < 0) ||
      Object.values(player.newTurn).some((value) => value < 0)
    ) {
      return true;
    }
  }

  // Check game-wide counters
  if (game.risingSun && game.risingSun.prophecy < 0) {
    return true;
  }

  // Add checks for any future game-wide counters here
  // For example:
  // if (game.someExpansion && game.someExpansion.someCounter < 0) {
  //   return true;
  // }

  return false;
}

/**
 * Get the field and subfield from a game log action.
 * @param action - The game log action
 * @returns The field and subfield
 */
export function getFieldAndSubfieldFromAction(action: GameLogActionWithCount): {
  field: PlayerField | null;
  subfield: PlayerSubFields | null;
} {
  switch (action) {
    case GameLogActionWithCount.ADD_ACTIONS:
    case GameLogActionWithCount.REMOVE_ACTIONS:
      return { field: 'turn', subfield: 'actions' };
    case GameLogActionWithCount.ADD_BUYS:
    case GameLogActionWithCount.REMOVE_BUYS:
      return { field: 'turn', subfield: 'buys' };
    case GameLogActionWithCount.ADD_COINS:
    case GameLogActionWithCount.REMOVE_COINS:
      return { field: 'turn', subfield: 'coins' };
    case GameLogActionWithCount.ADD_COFFERS:
    case GameLogActionWithCount.REMOVE_COFFERS:
      return { field: 'mats', subfield: 'coffers' };
    case GameLogActionWithCount.ADD_VILLAGERS:
    case GameLogActionWithCount.REMOVE_VILLAGERS:
      return { field: 'mats', subfield: 'villagers' };
    case GameLogActionWithCount.ADD_DEBT:
    case GameLogActionWithCount.REMOVE_DEBT:
      return { field: 'mats', subfield: 'debt' };
    case GameLogActionWithCount.ADD_FAVORS:
    case GameLogActionWithCount.REMOVE_FAVORS:
      return { field: 'mats', subfield: 'favors' };
    case GameLogActionWithCount.ADD_CURSES:
    case GameLogActionWithCount.REMOVE_CURSES:
      return { field: 'victory', subfield: 'curses' };
    case GameLogActionWithCount.ADD_ESTATES:
    case GameLogActionWithCount.REMOVE_ESTATES:
      return { field: 'victory', subfield: 'estates' };
    case GameLogActionWithCount.ADD_DUCHIES:
    case GameLogActionWithCount.REMOVE_DUCHIES:
      return { field: 'victory', subfield: 'duchies' };
    case GameLogActionWithCount.ADD_PROVINCES:
    case GameLogActionWithCount.REMOVE_PROVINCES:
      return { field: 'victory', subfield: 'provinces' };
    case GameLogActionWithCount.ADD_COLONIES:
    case GameLogActionWithCount.REMOVE_COLONIES:
      return { field: 'victory', subfield: 'colonies' };
    case GameLogActionWithCount.ADD_VP_TOKENS:
    case GameLogActionWithCount.REMOVE_VP_TOKENS:
      return { field: 'victory', subfield: 'tokens' };
    case GameLogActionWithCount.ADD_OTHER_VP:
    case GameLogActionWithCount.REMOVE_OTHER_VP:
      return { field: 'victory', subfield: 'other' };
    case GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS:
      return { field: 'newTurn', subfield: 'actions' };
    case GameLogActionWithCount.ADD_NEXT_TURN_BUYS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS:
      return { field: 'newTurn', subfield: 'buys' };
    case GameLogActionWithCount.ADD_NEXT_TURN_COINS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_COINS:
      return { field: 'newTurn', subfield: 'coins' };
    default:
      return { field: null, subfield: null };
  }
}

/**
 * Get the increment for the given action.
 * @param action - The game log action
 * @returns The increment multiplier (positive or negative)
 */
export function getActionIncrementMultiplier(action: GameLogActionWithCount): number {
  if (NoPlayerActions.includes(action)) {
    return 0;
  }

  return action.startsWith('Add') ? 1 : -1;
}
