import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DominionVictoryIcon from '@/assets/images/Dominion-Victory.png';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dominion-assistant"
        options={{
          title: 'Dominion Assistant',
          tabBarIcon: ({ color, focused }) => (
            <Image source={DominionVictoryIcon} style={{ width: 28, height: 28 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="game-log"
        options={{
          title: 'Game Log',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="load-save-game"
        options={{
          title: 'Load/Save Game',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'save' : 'save-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
