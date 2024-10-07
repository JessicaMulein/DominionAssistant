import React, { forwardRef } from 'react';
import { Typography, Box, TypographyProps } from '@mui/material';
import { styled } from '@mui/system';

interface SuperCapsTextProps extends TypographyProps {
  fontSize?: number;
}

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'CharlemagneStdBold',
  display: 'inline-block',
}));

const FirstLetter = styled('span')(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '105%',
}));

const SuperCapsText = forwardRef<HTMLSpanElement, SuperCapsTextProps>(
  ({ children, fontSize = 24, ...props }, ref) => {
    if (typeof children !== 'string') {
      return null;
    }

    const firstLetter = children.charAt(0);
    const restOfText = children.slice(1);

    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline' }} ref={ref}>
        <StyledTypography {...props} sx={{ fontSize, lineHeight: 1, ...props.sx }}>
          <FirstLetter>{firstLetter}</FirstLetter>
          {restOfText}
        </StyledTypography>
      </Box>
    );
  }
);

SuperCapsText.displayName = 'SuperCapsText';

export default SuperCapsText;
