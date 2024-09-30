import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import DominionAssistant from '@/components/DominionAssistant';

type DominionAssistantScreenRouteProp = RouteProp<RootStackParamList, 'DominionAssistant'>;
type DominionAssistantScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'DominionAssistant'
>;

export default function DominionAssistantScreen() {
  const navigation = useNavigation<DominionAssistantScreenNavigationProp>();
  const route = useRoute<DominionAssistantScreenRouteProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unofficial Dominion Assistant</Text>
      <DominionAssistant route={route} navigation={navigation} />
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
