import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Fab } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { Box, Button } from '@mui/material';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { ILogEntry } from '@/game/interfaces/log-entry';

interface GameScreenProps {
  nextTurn: () => void;
  endGame: () => void;
  addLogEntry: (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean,
    linkedAction?: string
  ) => ILogEntry;
  undoLastAction: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  nextTurn,
  endGame,
  addLogEntry,
  undoLastAction,
}) => {
  return (
    <>
      <View style={styles.container}>
        <Scoreboard />
        <Player addLogEntry={addLogEntry} />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={nextTurn}>
            Next Turn
          </Button>
          <Button variant="contained" color="secondary" onClick={endGame}>
            End Game
          </Button>
        </Box>
      </View>
      <Fab
        color="secondary"
        aria-label="undo"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={undoLastAction}
      >
        <UndoIcon />
      </Fab>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default GameScreen;
