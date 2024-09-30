import React from 'react';
import { Box, Typography } from '@mui/material';
import { Image, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 400,
          height: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('@/assets/images/Dominion-tx.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Typography
          variant="h4"
          sx={{
            position: 'absolute',
            bottom: 20,
            fontFamily: 'CharlemagneStdBold',
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            px: 2,
          }}
        >
          Unofficial Dominion Assistant
        </Typography>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: '100%',
  },
});
