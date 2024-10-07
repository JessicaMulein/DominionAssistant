import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { styled } from '@mui/system';
import { SUBTITLE_SIZE } from '@/components/style';

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: SUBTITLE_SIZE,
}));

const StyledLargeNumber = styled(Typography)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: SUBTITLE_SIZE,
  fontWeight: 'bold',
}));

const StyledBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '100%',
});

interface IncrementDecrementControlProps {
  label: string;
  value: number;
  tooltip?: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const IncrementDecrementControl: React.FC<IncrementDecrementControlProps> = ({
  label,
  value,
  tooltip,
  onIncrement,
  onDecrement,
}) => {
  return (
    <StyledBox>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <StyledTypography variant="body1" sx={{ marginRight: 1 }}>
            {label}:
          </StyledTypography>
        </Tooltip>
      ) : (
        <StyledTypography variant="body1" sx={{ marginRight: 1 }}>
          {label}:
        </StyledTypography>
      )}
      <IconButton onClick={onDecrement} size="small">
        <RemoveIcon fontSize="small" />
      </IconButton>
      <StyledLargeNumber variant="body1" sx={{ minWidth: 20, textAlign: 'center' }}>
        {value}
      </StyledLargeNumber>
      <IconButton onClick={onIncrement} size="small">
        <AddIcon fontSize="small" />
      </IconButton>
    </StyledBox>
  );
};

export default IncrementDecrementControl;
