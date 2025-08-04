import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PhotoChatScreen from './src/screens/PhotoChatScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import AppHeader from './src/components/AppHeader';
import { ThemeProvider } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account-outline';
            } else if (route.name === 'Discover') {
              iconName = focused ? 'compass' : 'compass-outline';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 25,
            paddingTop: 12,
            height: 85,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ tabBarLabel: 'Ana Sayfa' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Profil' }}
        />
        <Tab.Screen 
          name="Discover" 
          component={DiscoverScreen} 
          options={{ tabBarLabel: 'Keşfet' }}
        />
      </Tab.Navigator>
      <AppHeader navigation={navigation} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PhotoChat" component={PhotoChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
