import { calculateInitialSupply } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { NO_PLAYER, MIN_PLAYERS } from '@/game/constants';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

// Define the shape of the context
interface GameContextProps {
  gameState: IGame;
  setGameState: React.Dispatch<React.SetStateAction<IGame>>;
}

export const EmptyGameState: IGame = {
  currentStep: 1,
  players: [],
  supply: calculateInitialSupply(MIN_PLAYERS, false, false),
  options: {
    curses: false,
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
      timestamp: new Date(),
      action: GameLogActionWithCount.START_GAME,
      playerIndex: NO_PLAYER,
    },
  ],
};

// Create the context
const GameContext = createContext<GameContextProps | undefined>(undefined);

// Custom hook to use the GameContext
export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Custom provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<IGame>(EmptyGameState);

  // Stabilize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({ gameState, setGameState }), [gameState]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};
