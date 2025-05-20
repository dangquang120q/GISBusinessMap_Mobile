import React, { useContext } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import GuestHomeScreen from '../screens/GuestHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewHistoryScreen from '../screens/ReviewHistoryScreen';
import FeedbackHistoryScreen from '../screens/FeedbackHistoryScreen';
import NotificationsListScreen from '../screens/NotificationsListScreen';
import LoginButton from '../components/LoginButton';
import ReviewDetailScreen from '../screens/ReviewDetailScreen';
import FeedbackDetailScreen from '../screens/FeedbackDetailScreen';

import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrivacyScreen from '../screens/PrivacyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ReviewStack = createNativeStackNavigator();
const FeedbackStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Wrapper components to avoid inline functions
const AuthenticatedHomeScreen = () => <HomeScreen />;
const GuestHomeScreenWrapper = () => <GuestHomeScreen />;

// Review Stack Navigator
const ReviewStackScreen = () => {
  return (
    <ReviewStack.Navigator screenOptions={{headerShown: false}}>
      <ReviewStack.Screen name="ReviewHistory" component={ReviewHistoryScreen} />
      <ReviewStack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
    </ReviewStack.Navigator>
  );
};

// Feedback Stack Navigator
const FeedbackStackScreen = () => {
  return (
    <FeedbackStack.Navigator screenOptions={{headerShown: false}}>
      <FeedbackStack.Screen name="FeedbackHistory" component={FeedbackHistoryScreen} />
      <FeedbackStack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
    </FeedbackStack.Navigator>
  );
};

// Profile Stack Navigator
const SettingsStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{headerShown: false}}>
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <ProfileStack.Screen name="PrivacyScreen" component={PrivacyScreen} />
    </ProfileStack.Navigator>
  );
};

// Wrapper component to avoid inline function
const HomeStackScreen = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Stack.Navigator>
        <>
          <Stack.Screen
            name="Home"
            component={AuthenticatedHomeScreen}
            options={{headerShown: false}}
          />
        </>
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
        tabBarStyle: {backgroundColor: '#085924'},
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
            backgroundColor: '#085924',
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
            component={ReviewStackScreen}
            options={{
              tabBarBadge: 3,
              tabBarBadgeStyle: {backgroundColor: 'yellow'},
              tabBarIcon: ({color, size}) => (
                <Ionicons name="time-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Messages"
            component={FeedbackStackScreen}
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
          {/* <Tab.Screen
            name="ProfileTab"
            component={ProfileStackScreen}
            options={{
              tabBarIcon: ({color, size}) => (
                <Ionicons name="person-outline" color={color} size={size} />
              ),
            }}
          /> */}
          <Tab.Screen
            name="SettingsTab"
            component={SettingsStackScreen}
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
