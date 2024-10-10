import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useGameContext } from '@/components/GameContext';
import {
  saveGame,
  loadGame,
  getSavedGamesList,
  deleteSavedGame,
  loadGameAddLog,
  addLogEntry,
} from '@/game/dominion-lib';
import { SavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ArrowRight as ArrowRightIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { NO_PLAYER } from '@/game/constants';
import { FailedAddLogEntryError } from '@/game/errors/failed-add-log';

const LoadSaveGame: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState(false);
  const { gameState, setGameState } = useGameContext();
  const [savedGames, setSavedGames] = useState<SavedGameMetadata[]>([]);
  const [saveName, setSaveName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  /**
   * Add a log entry to the game log.
   * @param playerIndex
   * @param action
   * @param count
   * @param correction If true, this log entry is a correction to a previous entry.
   * @param linkedAction If provided, an ID of a linked action. Some actions are part of a chain and should be linked for undo functionality.
   * @returns
   */
  const addLogEntrySetGameState = (): ILogEntry => {
    let newLog: ILogEntry | undefined;
    setGameState((prevGame) => {
      newLog = addLogEntry(prevGame, NO_PLAYER, GameLogActionWithCount.LOAD_GAME);
      return prevGame;
    });
    if (!newLog) {
      throw new FailedAddLogEntryError();
    }
    return newLog;
  };

  useEffect(() => {
    loadSavedGamesList();
  }, []);

  const loadSavedGamesList = async () => {
    const games = await getSavedGamesList();
    setSavedGames(games);
  };

  const handleSaveGame = async () => {
    if (gameState && saveName) {
      if (selectedGameId) {
        // If a game is selected, prompt for overwrite
        setOpenOverwriteDialog(true);
      } else {
        // If no game is selected, save as a new game
        await saveGame(gameState, saveName);
        addLogEntrySetGameState();
        setSaveName('');
        loadSavedGamesList();
      }
    }
  };

  const handleOverwriteConfirm = async () => {
    if (gameState && saveName && selectedGameId) {
      await saveGame(gameState, saveName, selectedGameId);
      setOpenOverwriteDialog(false);
      setSaveName('');
      setSelectedGameId(null);
      loadSavedGamesList();
    }
  };

  const handleLoadGame = () => {
    if (selectedGameId) {
      if (gameState.currentStep === CurrentStep.GameScreen) {
        setOpenDialog(true);
      } else {
        loadGameById(selectedGameId);
      }
    }
  };

  const loadGameById = async (id: string) => {
    const loadedGame = await loadGame(id);
    if (loadedGame) {
      setGameState(loadedGame);
      setSelectedGameId(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmLoad = () => {
    setOpenDialog(false);
    if (selectedGameId) {
      loadGameById(selectedGameId);
    }
  };

  const handleDeleteGame = async (id: string) => {
    await deleteSavedGame(id);
    loadSavedGamesList();
    if (selectedGameId === id) {
      setSelectedGameId(null);
    }
  };

  const handleSelectGame = (game: SavedGameMetadata) => {
    setSelectedGameId(game.id);
    setSaveName(game.name);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Save Current Game
      </Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Enter save name"
          fullWidth
          sx={{ mr: 1 }}
        />
        <Button variant="contained" onClick={handleSaveGame} disabled={!gameState || !saveName}>
          Save Game
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Saved Games
      </Typography>
      <List>
        {savedGames.map((game) => (
          <ListItem
            key={game.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGame(game.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              selected={selectedGameId === game.id}
              onClick={() => handleSelectGame(game)}
            >
              <ListItemText
                primary={game.name}
                secondary={new Date(game.savedAt).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        onClick={handleLoadGame}
        disabled={!selectedGameId}
        startIcon={<ArrowRightIcon />}
        sx={{ mt: 2 }}
      >
        Load Selected Game
      </Button>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Game in Progress'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to load a new game? Your current game progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmLoad} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOverwriteDialog} onClose={() => setOpenOverwriteDialog(false)}>
        <DialogTitle>Confirm Overwrite</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A game with this name already exists. Do you want to overwrite it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOverwriteDialog(false)}>Cancel</Button>
          <Button onClick={handleOverwriteConfirm} autoFocus>
            Overwrite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoadSaveGame;
