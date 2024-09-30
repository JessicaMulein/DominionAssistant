import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LoadSaveGame from '@/components/LoadSaveGame';

type LoadSaveGameScreenRouteProp = RouteProp<RootStackParamList, 'LoadSaveGame'>;
type LoadSaveGameScreenNavigationProp = NavigationProp<RootStackParamList, 'LoadSaveGame'>;

export default function LoadSaveGameScreen() {
  const navigation = useNavigation<LoadSaveGameScreenNavigationProp>();
  const route = useRoute<LoadSaveGameScreenRouteProp>();

  return (
    <View style={styles.container}>
      <LoadSaveGame />
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
