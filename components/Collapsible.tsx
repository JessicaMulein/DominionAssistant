import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(!collapsed);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleCollapsed} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <MaterialIcons name={collapsed ? 'expand-more' : 'expand-less'} size={24} color="black" />
      </TouchableOpacity>
      {!collapsed && <View style={[styles.content, { pointerEvents: 'auto' }]}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
    backgroundColor: '#fff',
  },
  playerNumber: {
    width: 50, // Set a fixed width for player number boxes
    textAlign: 'center',
  },
});

export default Collapsible;
