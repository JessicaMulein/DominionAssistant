import React from 'react';
import { View, StyleSheet } from 'react-native';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { Box, Button } from '@mui/material';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

interface GameScreenProps {
  nextTurn: () => void;
  endGame: () => void;
  addLogEntry: (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean
  ) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ nextTurn, endGame, addLogEntry }) => {
  return (
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
