import React from 'react';
import Toast from 'react-native-toast-message';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import RegionScreen from './screens/RegionScreen';
import HomeScreen from './screens/HomeScreen';
import BookmakerScreen from './screens/BookmakerScreen';
import CompetitionsScreen from './screens/CompetitionsScreen';
import MarketsScreen from './screens/MarketsScreen';
import EventOddsScreen from './screens/EventOddsScreen';
import MonitorOddsScreen from './screens/MonitorOddsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegionScreen" component={RegionScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="BookmakerScreen" component={BookmakerScreen} />
        <Stack.Screen name="CompetitionsScreen" component={CompetitionsScreen} />
        <Stack.Screen name="MarketsScreen" component={MarketsScreen} />
        <Stack.Screen name="EventOddsScreen" component={EventOddsScreen} />
        <Stack.Screen name="MonitorOddsScreen" component={MonitorOddsScreen} />
      </Stack.Navigator>
      <Toast /> 
    </NavigationContainer>
  );
}
