import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/components/GameContext';
import { saveGame, loadGame, getSavedGamesList, deleteSavedGame } from '@/game/dominion-lib';
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

const LoadSaveGame: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { gameState, setGameState } = useGameContext();
  const [savedGames, setSavedGames] = useState<SavedGameMetadata[]>([]);
  const [saveName, setSaveName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedGamesList();
  }, []);

  const loadSavedGamesList = async () => {
    const games = await getSavedGamesList();
    setSavedGames(games);
  };

  const handleSaveGame = async () => {
    if (gameState && saveName) {
      await saveGame(gameState, saveName);
      setSaveName('');
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
              onClick={() => setSelectedGameId(game.id)}
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
    </Box>
  );
};

export default LoadSaveGame;
