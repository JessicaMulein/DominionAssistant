import React, { useEffect, useState } from 'react';
import AddPlayerNames from '@/components/AddPlayerNames';
import SelectFirstPlayer from '@/components/SelectFirstPlayer';
import SetGameOptions from '@/components/SetGameOptions';
import GameScreen from '@/components/GameScreen';
import EndGame from '@/components/EndGame';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { useGameContext } from '@/components/GameContext';
import { CurrentStep } from '@/game/enumerations/current-step';
import { NO_PLAYER } from '@/game/constants';
import {
  addLogEntry,
  canUndoAction,
  EmptyGameState,
  StepTransitions,
  undoAction,
} from '@/game/dominion-lib';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { AlertProvider, useAlert } from '@/components/AlertContext';
import AlertDialog from '@/components/AlertDialog';

interface DominionAssistantProps {
  route: unknown;
  navigation: unknown;
}

const DominionAssistant: React.FC<DominionAssistantProps> = ({ route, navigation }) => {
  const { gameState, setGameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState.log]);

  const undoLastAction = () => {
    setGameState((prevGame) => {
      const { game, success } = undoAction(prevGame, prevGame.log.length - 1);
      if (!success) {
        showAlert('Undo Failed', 'Unable to undo the last action.');
        return prevGame;
      }
      return game;
    });
  };

  const nextStep = () => {
    setGameState((prevState) => ({
      ...prevState,
      currentStep: StepTransitions[prevState.currentStep] || prevState.currentStep,
    }));
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
  const addLogEntrySetGameState = (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean,
    linkedAction?: string,
    playerTurnDetails?: IPlayerGameTurnDetails[]
  ): ILogEntry => {
    let newLog: ILogEntry | undefined;
    setGameState((prevGame) => {
      newLog = addLogEntry(
        prevGame,
        playerIndex,
        action,
        count,
        correction,
        linkedAction,
        playerTurnDetails
      );
      return prevGame;
    });
    if (!newLog) {
      throw new Error('Failed to add log entry');
    }
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
    addLogEntrySetGameState(
      NO_PLAYER,
      GameLogActionWithCount.NEXT_TURN,
      undefined,
      undefined,
      undefined,
      gameState.players.map((player) => player.turn)
    );
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
      addLogEntrySetGameState(NO_PLAYER, GameLogActionWithCount.END_GAME);

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

  switch (gameState.currentStep) {
    case CurrentStep.AddPlayerNames:
      return <AddPlayerNames nextStep={nextStep} />;
    case CurrentStep.SelectFirstPlayer:
      return <SelectFirstPlayer nextStep={nextStep} />;
    case CurrentStep.SetGameOptions:
      return <SetGameOptions startGame={startGame} />;
    case CurrentStep.GameScreen:
      return (
        <GameScreen
          nextTurn={nextTurn}
          endGame={endGame}
          addLogEntry={addLogEntrySetGameState}
          undoLastAction={undoLastAction}
        />
      );
    case CurrentStep.EndGame:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};
const DominionAssistantWithAlert: React.FC<DominionAssistantProps> = (props) => (
  <AlertProvider>
    <DominionAssistant {...props} />
    <AlertDialog />
  </AlertProvider>
);

export default DominionAssistantWithAlert;
