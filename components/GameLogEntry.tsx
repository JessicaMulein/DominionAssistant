import React from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { getTimeSpanFromStartGame, logEntryToString } from '@/game/dominion-lib';
import { ILogEntry } from '@/game/interfaces/log-entry';

interface GameLogEntryProps {
  gameStart: Date;
  entry: ILogEntry;
}

const GameLogEntry: React.FC<GameLogEntryProps> = ({ gameStart, entry }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <TableRow style={{ backgroundColor: entry.correction ? '#ffeb3b' : 'inherit' }}>
      <TableCell style={{ width: '15%' }}>
        <Typography variant="body2">{formatDate(entry.timestamp)}</Typography>
      </TableCell>
      <TableCell style={{ width: '15%' }}>
        <Typography variant="body2">
          {getTimeSpanFromStartGame(gameStart, entry.timestamp)}
        </Typography>
      </TableCell>
      <TableCell style={{ width: '70%' }}>
        <Typography variant="body1">{logEntryToString(entry)}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default GameLogEntry;
