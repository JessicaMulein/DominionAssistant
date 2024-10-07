import React from 'react';
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
   * @returns
   */
  const addLogEntry = (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean
  ) => {
    const playerName = playerIndex > -1 ? gameState.players[playerIndex].name : undefined;
    const newLog: ILogEntry = {
      timestamp: new Date(),
      action,
      playerIndex,
      playerName,
      count,
      correction,
    };
    setGameState((prevGame) => {
      if (!prevGame) return prevGame;
      return {
        ...prevGame,
        log: [...prevGame.log, newLog],
      };
    });
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

  switch (gameState.currentStep) {
    case 1:
      return <AddPlayerNames nextStep={nextStep} />;
    case 2:
      return <SelectFirstPlayer nextStep={nextStep} />;
    case 3:
      return <SetGameOptions startGame={startGame} />;
    case 4:
      return <GameScreen nextTurn={nextTurn} endGame={endGame} addLogEntry={addLogEntry} />;
    case 5:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};

export default DominionAssistant;
