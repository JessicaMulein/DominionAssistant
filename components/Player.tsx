import React, { useState } from 'react';
import { Checkbox, Paper, Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGameContext } from '@/components/GameContext';
import SuperCapsText from '@/components/SuperCapsText';
import IncrementDecrementControl from '@/components/IncrementDecrementControl';
import { TITLE_SIZE } from '@/components/style';
import { IPlayer } from '@/game/interfaces/player';
import { victoryFieldToGameLogAction } from '@/game/dominion-lib';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { PlayerField, PlayerSubField } from '@/game/types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: 5,
  margin: theme.spacing(2),
}));

const ColumnBox = styled(Box)({
  flex: 1,
  minWidth: 200,
  marginBottom: 2,
  display: 'flex',
  flexDirection: 'column',
});

const CenteredTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 2,
});

interface PlayerProps {
  addLogEntry: (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean
  ) => void;
}

const Player: React.FC<PlayerProps> = ({ addLogEntry }) => {
  const { gameState, setGameState } = useGameContext();
  const [showNewTurnSettings, setShowNewTurnSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isCorrection, setIsCorrection] = useState(false);

  if (!gameState) {
    return null;
  }

  const player = gameState.players[gameState.selectedPlayerIndex];
  const isCurrentPlayer = gameState.selectedPlayerIndex === gameState.currentPlayerIndex;

  const updateField = <T extends PlayerField>(
    field: T,
    subfield: PlayerSubField<T>,
    increment: number
  ) => {
    const gameAction = victoryFieldToGameLogAction<T>(field, subfield, increment);
    addLogEntry(gameState.selectedPlayerIndex, gameAction, Math.abs(increment), isCorrection);
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newPlayers = [...prevState.players];
      const player = newPlayers[gameState.selectedPlayerIndex];
      const currentValue = player[field][subfield as keyof IPlayer[T]];

      if (typeof currentValue === 'number') {
        (player[field][subfield as keyof IPlayer[T]] as number) = Math.max(
          0,
          currentValue + increment
        );
      }

      return { ...prevState, players: newPlayers };
    });
  };

  const handleCorrectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCorrection(event.target.checked);
  };

  const showMats =
    gameState.options.mats.coffersVillagers ||
    gameState.options.mats.debt ||
    gameState.options.mats.favors;

  const showGlobalMats = gameState.options.expansions.risingSun && gameState.risingSun;

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

  const handleNewTurnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowNewTurnSettings(true);
  };

  const handleNewTurnClose = () => {
    setAnchorEl(null);
    setShowNewTurnSettings(false);
  };

  return (
    <StyledPaper elevation={3} style={{ border: isCorrection ? '2px solid red' : 'none' }}>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          {isCurrentPlayer && <ArrowRightIcon sx={{ mr: 1 }} />}
          <SuperCapsText fontSize={TITLE_SIZE}>{player.name}</SuperCapsText>
        </Box>
        <IconButton onClick={handleNewTurnClick}>
          <SettingsIcon />
        </IconButton>
      </Box>
      {player && (
        <Box display="flex" flexWrap="wrap">
          <ColumnBox>
            <CenteredTitle>
              <Tooltip title="These values reset every turn">
                <SuperCapsText fontSize={TITLE_SIZE}>Turn</SuperCapsText>
              </Tooltip>
            </CenteredTitle>
            <IncrementDecrementControl
              label="Actions"
              value={player.turn.actions}
              onIncrement={() => updateField('turn', 'actions', 1)}
              onDecrement={() => updateField('turn', 'actions', -1)}
            />
            <IncrementDecrementControl
              label="Buys"
              value={player.turn.buys}
              onIncrement={() => updateField('turn', 'buys', 1)}
              onDecrement={() => updateField('turn', 'buys', -1)}
            />
            <IncrementDecrementControl
              label="Coins"
              value={player.turn.coins}
              onIncrement={() => updateField('turn', 'coins', 1)}
              onDecrement={() => updateField('turn', 'coins', -1)}
            />
          </ColumnBox>
          {(showMats || showGlobalMats) && (
            <ColumnBox>
              <CenteredTitle>
                <Tooltip title="These player mat values persist between turns">
                  <SuperCapsText fontSize={TITLE_SIZE}>Mats</SuperCapsText>
                </Tooltip>
              </CenteredTitle>
              {gameState.options.mats.coffersVillagers && (
                <>
                  <IncrementDecrementControl
                    label="Coffers"
                    value={player.mats.coffers}
                    tooltip="Spending a coffer automatically gives a coin"
                    onIncrement={() => updateField('mats', 'coffers', 1)}
                    onDecrement={() => {
                      // spending a coffer gives a coin
                      updateField('mats', 'coffers', -1);
                      updateField('turn', 'coins', 1);
                    }}
                  />
                  <IncrementDecrementControl
                    label="Villagers"
                    value={player.mats.villagers}
                    tooltip="Spending a villager automatically gives an action"
                    onIncrement={() => updateField('mats', 'villagers', 1)}
                    onDecrement={() => {
                      // spending a villager gives an action
                      updateField('mats', 'villagers', -1);
                      updateField('turn', 'actions', 1);
                    }}
                  />
                </>
              )}
              {gameState.options.mats.debt && (
                <IncrementDecrementControl
                  label="Debt"
                  value={player.mats.debt}
                  onIncrement={() => updateField('mats', 'debt', 1)}
                  onDecrement={() => updateField('mats', 'debt', -1)}
                />
              )}
              {gameState.options.mats.favors && (
                <IncrementDecrementControl
                  label="Favors"
                  value={player.mats.favors}
                  onIncrement={() => updateField('mats', 'favors', 1)}
                  onDecrement={() => updateField('mats', 'favors', -1)}
                />
              )}
              {showGlobalMats && (
                <>
                  <Box sx={{ paddingTop: 2 }}>
                    <CenteredTitle>
                      <Tooltip title="Global Mats affect all players and persist between turns">
                        <SuperCapsText fontSize={TITLE_SIZE}>Global Mats</SuperCapsText>
                      </Tooltip>
                    </CenteredTitle>
                  </Box>
                  {gameState.options.expansions.risingSun && gameState.risingSun && (
                    <IncrementDecrementControl
                      label="Prophecy"
                      value={gameState.risingSun.prophecy}
                      tooltip="Rising Sun Prophecy affects all players and persists between turns"
                      onIncrement={handleProphecyIncrease}
                      onDecrement={handleProphecyDecrease}
                    />
                  )}
                </>
              )}
            </ColumnBox>
          )}
          <ColumnBox>
            <CenteredTitle>
              <Tooltip title="Victory points" arrow>
                <SuperCapsText fontSize={TITLE_SIZE}>Victory</SuperCapsText>
              </Tooltip>
            </CenteredTitle>
            <IncrementDecrementControl
              label="Estates"
              value={player.victory.estates}
              onIncrement={() => updateField('victory', 'estates', 1)}
              onDecrement={() => updateField('victory', 'estates', -1)}
            />
            <IncrementDecrementControl
              label="Duchies"
              value={player.victory.duchies}
              onIncrement={() => updateField('victory', 'duchies', 1)}
              onDecrement={() => updateField('victory', 'duchies', -1)}
            />
            <IncrementDecrementControl
              label="Provinces"
              value={player.victory.provinces}
              onIncrement={() => updateField('victory', 'provinces', 1)}
              onDecrement={() => updateField('victory', 'provinces', -1)}
            />
            {gameState.options.expansions.prosperity && (
              <IncrementDecrementControl
                label="Colonies"
                value={player.victory.colonies}
                onIncrement={() => updateField('victory', 'colonies', 1)}
                onDecrement={() => updateField('victory', 'colonies', -1)}
              />
            )}
            <IncrementDecrementControl
              label="Tokens"
              value={player.victory.tokens}
              onIncrement={() => updateField('victory', 'tokens', 1)}
              onDecrement={() => updateField('victory', 'tokens', -1)}
            />
            <IncrementDecrementControl
              label="Other"
              value={player.victory.other}
              onIncrement={() => updateField('victory', 'other', 1)}
              onDecrement={() => updateField('victory', 'other', -1)}
            />
            {gameState.options.curses && (
              <IncrementDecrementControl
                label="Curses"
                value={player.victory.curses}
                onIncrement={() => updateField('victory', 'curses', 1)}
                onDecrement={() => updateField('victory', 'curses', -1)}
              />
            )}
          </ColumnBox>
        </Box>
      )}
      <Popover
        open={showNewTurnSettings}
        anchorEl={anchorEl}
        onClose={handleNewTurnClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2}>
          <CenteredTitle>
            <SuperCapsText fontSize={TITLE_SIZE}>Next Turn</SuperCapsText>
          </CenteredTitle>
          <IncrementDecrementControl
            label="Actions"
            value={player.newTurn.actions}
            onIncrement={() => updateField('newTurn', 'actions', 1)}
            onDecrement={() => updateField('newTurn', 'actions', -1)}
          />
          <IncrementDecrementControl
            label="Buys"
            value={player.newTurn.buys}
            onIncrement={() => updateField('newTurn', 'buys', 1)}
            onDecrement={() => updateField('newTurn', 'buys', -1)}
          />
          <IncrementDecrementControl
            label="Coins"
            value={player.newTurn.coins}
            onIncrement={() => updateField('newTurn', 'coins', 1)}
            onDecrement={() => updateField('newTurn', 'coins', -1)}
          />
        </Box>
      </Popover>
      <Box position="absolute" bottom={10} left={30} display="flex" alignItems="center">
        <Checkbox
          checked={isCorrection}
          onChange={handleCorrectionChange}
          inputProps={{ 'aria-label': 'Correction Checkbox' }}
        />
        <Typography variant="body2">Correction</Typography>
      </Box>
    </StyledPaper>
  );
};

export default Player;
