import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegionScreen from './screens/RegionScreen';
import HomeScreen from './screens/HomeScreen';
import BookmakerScreen from './screens/BookmakerScreen';
import CompetitionsScreen from './screens/CompetitionsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="RegionScreen" component={RegionScreen} options={{ title: 'Select Region' }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Select Sport' }} />
        <Stack.Screen name="BookmakerScreen" component={BookmakerScreen} options={{ title: 'Select Bookmaker' }} />
        <Stack.Screen
          name="CompetitionsScreen"
          component={CompetitionsScreen}
          options={{ title: 'Competitions' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
