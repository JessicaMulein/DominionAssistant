import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import GameLog from '@/components/GameLog';

type GameLogScreenRouteProp = RouteProp<RootStackParamList, 'GameLog'>;
type GameLogScreenNavigationProp = NavigationProp<RootStackParamList, 'GameLog'>;

export default function GameLogScreen() {
  const navigation = useNavigation<GameLogScreenNavigationProp>();
  const route = useRoute<GameLogScreenRouteProp>();

  return (
    <View style={styles.container}>
      <GameLog />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CharlemagneStdBold',
    marginBottom: 16,
  },
});
