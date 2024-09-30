import React, { useState } from 'react';
import { Paper, Box, IconButton, Popover } from '@mui/material';
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
  addLogEntry: (playerIndex: number, action: GameLogActionWithCount, count?: number) => void;
}

const Player: React.FC<PlayerProps> = ({ addLogEntry }) => {
  const { gameState, setGameState } = useGameContext();
  const [showNewTurnSettings, setShowNewTurnSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

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
    addLogEntry(gameState.selectedPlayerIndex, gameAction, Math.abs(increment));
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

  const showMats =
    gameState.options.mats.coffersVillagers ||
    gameState.options.mats.debt ||
    gameState.options.mats.favors;

  const handleNewTurnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowNewTurnSettings(true);
  };

  const handleNewTurnClose = () => {
    setAnchorEl(null);
    setShowNewTurnSettings(false);
  };

  return (
    <StyledPaper elevation={3}>
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
              <SuperCapsText fontSize={TITLE_SIZE}>Turn</SuperCapsText>
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
          {showMats && (
            <ColumnBox>
              <CenteredTitle>
                <SuperCapsText fontSize={TITLE_SIZE}>Mats</SuperCapsText>
              </CenteredTitle>
              {gameState.options.mats.coffersVillagers && (
                <>
                  <IncrementDecrementControl
                    label="Coffers"
                    value={player.mats.coffers}
                    onIncrement={() => updateField('mats', 'coffers', 1)}
                    onDecrement={() => updateField('mats', 'coffers', -1)}
                  />
                  <IncrementDecrementControl
                    label="Villagers"
                    value={player.mats.villagers}
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
            </ColumnBox>
          )}
          <ColumnBox>
            <CenteredTitle>
              <SuperCapsText fontSize={TITLE_SIZE}>Victory Points</SuperCapsText>
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
    </StyledPaper>
  );
};

export default Player;
