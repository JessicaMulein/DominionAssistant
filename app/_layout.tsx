import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GameProvider } from '@/components/GameContext';

export default function RootLayout() {
  return (
    <GameProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GameProvider>
  );
}
