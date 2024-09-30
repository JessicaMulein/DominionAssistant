import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/app/(tabs)/index';
import DominionAssistantScreen from '@/app/(tabs)/dominion-assistant';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from '@react-navigation/native';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootStackParamList } from '@/navigation/types';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import theme from '@/components/theme';
import GameLogScreen from '@/app/(tabs)/game-log';
import LoadSaveGameScreen from '@/app/(tabs)/load-save-game';
import SpaceMono from './assets/fonts/SpaceMono-Regular.ttf';
import CharlemagneStdBold from './assets/fonts/CharlemagneStd-Bold.ttf';
import TrajanProBold from './assets/fonts/TrajanPro-Bold.otf';
import TrajanProRegular from './assets/fonts/TrajanPro-Regular.ttf';
import MinionProBold from './assets/fonts/Minion Pro/Minion Pro Bold.ttf';

const Stack = createStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono,
    CharlemagneStdBold,
    TrajanProBold,
    TrajanProRegular,
    MinionProBold,
  });

  React.useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <RNThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationContainer onReady={onLayoutRootView}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DominionAssistant" component={DominionAssistantScreen} />
            <Stack.Screen name="GameLog" component={GameLogScreen} />
            <Stack.Screen name="LoadSaveGame" component={LoadSaveGameScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </RNThemeProvider>
    </MuiThemeProvider>
  );
}
