import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/components/GameContext';
import { saveGame, loadGame, getSavedGamesList, deleteSavedGame } from '@/game/dominion-lib';
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
  const [savedGames, setSavedGames] = useState<string[]>([]);
  const [saveName, setSaveName] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

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
    if (selectedGame) {
      if (
        gameState.currentStep !== CurrentStep.AddPlayerNames &&
        gameState.currentStep !== CurrentStep.EndGame
      ) {
        setOpenDialog(true);
      } else {
        loadSelectedGame();
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmLoad = () => {
    setOpenDialog(false);
    loadSelectedGame();
  };

  const loadSelectedGame = async () => {
    if (!selectedGame) return;
    const loadedGame = await loadGame(selectedGame);
    if (loadedGame) {
      setGameState(loadedGame);
      setSelectedGame(null);
    }
  };

  const handleDeleteGame = async (name: string) => {
    await deleteSavedGame(name);
    loadSavedGamesList();
    if (selectedGame === name) {
      setSelectedGame(null);
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
            key={game}
            disablePadding
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGame(game)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton selected={selectedGame === game} onClick={() => setSelectedGame(game)}>
              <ListItemText primary={game} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        onClick={handleLoadGame}
        disabled={!selectedGame}
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
