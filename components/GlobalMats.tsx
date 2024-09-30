import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import IncrementDecrementControl from '@/components/IncrementDecrementControl';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

interface GlobalMatsProps {
  addLogEntry: (playerIndex: number, action: GameLogActionWithCount, count?: number) => void;
}

const GlobalMats: React.FC<GlobalMatsProps> = ({ addLogEntry }) => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null;
  }

  const handleProphecyIncrease = () => {
    addLogEntry(gameState.selectedPlayerIndex, GameLogActionWithCount.ADD_PROPHECY, 1);
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newGameState = { ...prevState };
      if (newGameState.risingSun && newGameState.options.expansions.risingSun) {
        newGameState.risingSun.prophecy += 1;
      }
      return newGameState;
    });
  };

  const handleProphecyDecrease = () => {
    addLogEntry(gameState.selectedPlayerIndex, GameLogActionWithCount.REMOVE_PROPHECY, 1);
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newGameState = { ...prevState };
      if (newGameState.risingSun && newGameState.options.expansions.risingSun) {
        newGameState.risingSun.prophecy = Math.max(0, newGameState.risingSun.prophecy - 1);
      }
      return newGameState;
    });
  };

  const anyExpansionsEnabled = gameState.options.expansions.risingSun;

  if (!anyExpansionsEnabled) {
    return null;
  }

  return (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Global Mats
      </Typography>
      {gameState.options.expansions.risingSun && gameState.risingSun && (
        <IncrementDecrementControl
          label="Prophecy"
          value={gameState.risingSun.prophecy}
          onIncrement={handleProphecyIncrease}
          onDecrement={handleProphecyDecrease}
        />
      )}
    </Paper>
  );
};

export default GlobalMats;
