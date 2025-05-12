import React, { useContext } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import GuestHomeScreen from '../screens/GuestHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewHistoryScreen from '../screens/ReviewHistoryScreen';
import FeedbackHistoryScreen from '../screens/FeedbackHistoryScreen';
import NotificationsListScreen from '../screens/NotificationsListScreen';
import LoginButton from '../components/LoginButton';

import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Wrapper components to avoid inline functions
const AuthenticatedHomeScreen = () => <HomeScreen />;
const GuestHomeScreenWrapper = () => <GuestHomeScreen />;

// Wrapper component to avoid inline function
const HomeStackScreen = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen
          name="Home"
          component={AuthenticatedHomeScreen}
          options={{headerShown: false}}
        />
      ) : (
        <Stack.Screen
          name="GuestHome"
          component={GuestHomeScreenWrapper}
          options={{headerShown: false}}
        />
      )}
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {backgroundColor: '#AD40AF'},
        tabBarInactiveTintColor: '#fff',
        tabBarActiveTintColor: 'yellow',
      }}>
      <Tab.Screen
        name="Home2"
        component={HomeStackScreen}
        options={({route}) => {
          // Ẩn bottom tab khi đang ở GuestHomeScreen
          let tabBarStyle = {
            display: getTabBarVisibility(route),
            backgroundColor: '#AD40AF',
          };
          
          if (!isAuthenticated) {
            tabBarStyle = { display: 'none' };
          }
          
          return {
            tabBarStyle,
            tabBarIcon: ({color, size}) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          };
        }}
      />
      {isAuthenticated ? (
        <>
          <Tab.Screen
            name="Review"
            component={ReviewHistoryScreen}
            options={{
              tabBarBadge: 3,
              tabBarBadgeStyle: {backgroundColor: 'yellow'},
              tabBarIcon: ({color, size}) => (
                <Ionicons name="pencil-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Messages"
            component={FeedbackHistoryScreen}
            options={{
              tabBarBadge: 3,
              tabBarBadgeStyle: {backgroundColor: 'yellow'},
              tabBarIcon: ({color, size}) => (
                <Ionicons name="warning-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Notifications"
            component={NotificationsListScreen}
            options={{
              tabBarIcon: ({color, size}) => (
                <Ionicons name="notifications-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({color, size}) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
          />
        </>
      ) : null}
    </Tab.Navigator>
  );
};

const getTabBarVisibility = route => {
  return 'flex';
};

export default TabNavigator;
