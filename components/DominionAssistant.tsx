import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddPlayerNames from '@/components/AddPlayerNames';
import SelectFirstPlayer from '@/components/SelectFirstPlayer';
import SetGameOptions from '@/components/SetGameOptions';
import GameScreen from '@/components/GameScreen';
import EndGame from '@/components/EndGame';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { EmptyGameState, useGameContext } from '@/components/GameContext';
import { CurrentStep } from '@/game/enumerations/current-step';
import { NO_PLAYER } from '@/game/constants';

interface DominionAssistantProps {
  route: unknown;
  navigation: unknown;
}

const DominionAssistant: React.FC<DominionAssistantProps> = ({ route, navigation }) => {
  const { gameState, setGameState } = useGameContext();

  const nextStep = () => {
    setGameState((prevState) => {
      let nextStep: CurrentStep;

      switch (prevState.currentStep) {
        case CurrentStep.AddPlayerNames:
          nextStep = CurrentStep.SelectFirstPlayer;
          break;
        case CurrentStep.SelectFirstPlayer:
          nextStep = CurrentStep.SetGameOptions;
          break;
        case CurrentStep.SetGameOptions:
          nextStep = CurrentStep.GameScreen;
          break;
        case CurrentStep.GameScreen:
          nextStep = CurrentStep.EndGame;
          break;
        case CurrentStep.EndGame:
        default:
          nextStep = prevState.currentStep; // No change if we're already at the end
      }

      return {
        ...prevState,
        currentStep: nextStep,
      };
    });
  };

  /**
   * Add a log entry to the game log.
   * @param playerIndex
   * @param action
   * @param count
   * @param correction If true, this log entry is a correction to a previous entry.
   * @param linkedAction If provided, an ID of a linked action. Some actions are part of a chain and should be linked for undo functionality.
   * @returns
   */
  const addLogEntry = (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean,
    linkedAction?: string
  ): ILogEntry => {
    const playerName = playerIndex > -1 ? gameState.players[playerIndex].name : undefined;
    const newLog: ILogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      action,
      playerIndex,
      playerName,
      count,
      correction,
      linkedAction,
    };
    setGameState((prevGame) => {
      if (!prevGame) return prevGame;
      return {
        ...prevGame,
        log: [...prevGame.log, newLog],
      };
    });
    return newLog;
  };

  /**
   * Start the game with the selected players and options.
   */
  const startGame = () => {
    // The game initialization is now handled in SetGameOptions
    setGameState((prevState) => ({
      ...prevState,
      currentStep: CurrentStep.GameScreen,
    }));
  };

  const nextTurn = () => {
    addLogEntry(NO_PLAYER, GameLogActionWithCount.NEXT_TURN);
    setGameState((prevGame) => {
      const nextPlayerIndex = (prevGame.currentPlayerIndex + 1) % prevGame.players.length;
      const updatedPlayers = prevGame.players.map((player, index) => {
        if (index === nextPlayerIndex || index === prevGame.currentPlayerIndex) {
          return {
            ...player,
            turn: { ...player.newTurn },
          };
        }
        return player;
      });

      return {
        ...prevGame,
        currentPlayerIndex: nextPlayerIndex,
        selectedPlayerIndex: nextPlayerIndex,
        currentTurn: (prevGame.currentTurn || 0) + 1,
        players: updatedPlayers,
      };
    });
  };

  const endGame = () => {
    setGameState((prevState) => {
      addLogEntry(NO_PLAYER, GameLogActionWithCount.END_GAME);

      return {
        ...prevState,
        currentStep: CurrentStep.EndGame,
      };
    });
  };

  const resetGame = () => {
    setGameState({
      ...EmptyGameState,
      currentStep: CurrentStep.AddPlayerNames,
    });
  };

  /**
   * A list of action that can be undone.
   */
  const canUndo = Object.values(GameLogActionWithCount).filter((action) =>
    [
      GameLogActionWithCount.START_GAME,
      GameLogActionWithCount.END_GAME,
      GameLogActionWithCount.NEXT_TURN,
    ].includes(action)
  );

  const undoLastAction = () => {
    setGameState((prevGame) => {
      if (!prevGame || prevGame.log.length === 0) return prevGame;

      const lastLog = prevGame.log[prevGame.log.length - 1];
      const linkedLogs = prevGame.log.filter((log) => log.linkedAction === lastLog.id);
      const logs = [lastLog, ...linkedLogs];
      logs.map((log) => {
        if (!canUndo.includes(log.action)) {
          throw new Error(`Cannot undo action ${log.action}`);
        }
      });

      const newPlayers = [...prevGame.players];

      logs.forEach((log) => {
        const player = newPlayers[log.playerIndex];
        // Reverse the action
        if (log.count && player) {
          switch (lastLog.action) {
            case GameLogActionWithCount.ADD_ACTIONS:
              player.turn.actions -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_ACTIONS:
              player.turn.actions += log.count;
              break;
            case GameLogActionWithCount.ADD_BUYS:
              player.turn.buys -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_BUYS:
              player.turn.buys += log.count;
              break;
            case GameLogActionWithCount.ADD_COINS:
              player.turn.coins -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_COINS:
              player.turn.coins += log.count;
              break;
            case GameLogActionWithCount.ADD_COFFERS:
              player.mats.coffers -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_COFFERS:
              player.mats.coffers += log.count;
              break;
            case GameLogActionWithCount.ADD_VILLAGERS:
              player.mats.villagers -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_VILLAGERS:
              player.mats.villagers += log.count;
              break;
            case GameLogActionWithCount.ADD_DEBT:
              player.mats.debt -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_DEBT:
              player.mats.debt += log.count;
              break;
            case GameLogActionWithCount.ADD_FAVORS:
              player.mats.favors -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_FAVORS:
              player.mats.favors += log.count;
              break;
            case GameLogActionWithCount.ADD_ESTATES:
              player.victory.estates -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_ESTATES:
              player.victory.estates += log.count;
              break;
            case GameLogActionWithCount.ADD_DUCHIES:
              player.victory.duchies -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_DUCHIES:
              player.victory.duchies += log.count;
              break;
            case GameLogActionWithCount.ADD_PROVINCES:
              player.victory.provinces -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_PROVINCES:
              player.victory.provinces += log.count;
              break;
            case GameLogActionWithCount.ADD_COLONIES:
              player.victory.colonies -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_COLONIES:
              player.victory.colonies += log.count;
              break;
            case GameLogActionWithCount.ADD_CURSES:
              player.victory.curses -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_CURSES:
              player.victory.curses += log.count;
              break;
            case GameLogActionWithCount.ADD_VP_TOKENS:
              player.victory.tokens -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_VP_TOKENS:
              player.victory.tokens += log.count;
              break;
            case GameLogActionWithCount.ADD_OTHER_VP:
              player.victory.other -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_OTHER_VP:
              player.victory.other += log.count;
              break;
            case GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS:
              player.newTurn.actions -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS:
              player.newTurn.actions += log.count;
              break;
            case GameLogActionWithCount.ADD_NEXT_TURN_BUYS:
              player.newTurn.buys -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS:
              player.newTurn.buys += log.count;
              break;
            case GameLogActionWithCount.ADD_NEXT_TURN_COINS:
              player.newTurn.coins -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_NEXT_TURN_COINS:
              player.newTurn.coins += log.count;
              break;
            case GameLogActionWithCount.ADD_PROPHECY:
              prevGame.risingSun.prophecy -= log.count;
              break;
            case GameLogActionWithCount.REMOVE_PROPHECY:
              prevGame.risingSun.prophecy += log.count;
              break;
            default:
              throw new Error(`Can't undo log action: ${lastLog.action}`);
          }
        }
      });

      // Remove the last log entry and any linked entries
      const newLog = prevGame.log.filter(
        (log) => log.id !== lastLog.id && log.linkedAction !== lastLog.id
      );

      return {
        ...prevGame,
        players: newPlayers,
        log: newLog,
      };
    });
  };

  switch (gameState.currentStep) {
    case 1:
      return <AddPlayerNames nextStep={nextStep} />;
    case 2:
      return <SelectFirstPlayer nextStep={nextStep} />;
    case 3:
      return <SetGameOptions startGame={startGame} />;
    case 4:
      return (
        <GameScreen
          nextTurn={nextTurn}
          endGame={endGame}
          addLogEntry={addLogEntry}
          undoLastAction={undoLastAction}
        />
      );
    case 5:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};

export default DominionAssistant;
