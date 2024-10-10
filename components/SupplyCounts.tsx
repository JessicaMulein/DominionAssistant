import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SuperCapsText from './SuperCapsText';
import { useGameContext } from './GameContext';
import { IBaseKingdom } from '@/game/interfaces/set-kingdom/base';
import { IProsperityKingdom } from '@/game/interfaces/set-kingdom/prosperity';

const SupplyCounts: React.FC = () => {
  const { gameState } = useGameContext();

  const supplyCards: (keyof IBaseKingdom | keyof IProsperityKingdom)[] = [
    'estates',
    'duchies',
    'provinces',
    'coppers',
    'silvers',
    'golds',
    'curses',
    'colonies',
    'platinums',
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      maxWidth: 600, // Set a maximum width for the container
      alignSelf: 'center', // Center the container horizontally
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    cardName: {
      fontSize: 16,
    },
    quantity: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    note: {
      fontSize: 14,
      color: 'gray',
      marginBottom: 8,
    },
  });

  const renderItem = ({ item }: { item: keyof IBaseKingdom | keyof IProsperityKingdom }) => {
    const quantity = gameState.supply[item] ?? 0;
    // Skip rendering if quantity is -1 (NOT_PRESENT)
    if (quantity === -1) return null;
    const cardName = item.charAt(0).toUpperCase() + item.slice(1);

    return (
      <View style={styles.listItem}>
        <Text style={styles.cardName}>{cardName}</Text>
        <Text style={styles.quantity}>{quantity}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SuperCapsText fontSize={28}>Kingdom Supply</SuperCapsText>
      <FlatList data={supplyCards} renderItem={renderItem} keyExtractor={(item) => item} />
      <Text style={styles.note}>Note: Supply counts include trashed cards.</Text>
    </View>
  );
};

export default SupplyCounts;
