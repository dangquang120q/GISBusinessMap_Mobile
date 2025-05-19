import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewHistoryScreen from '../screens/ReviewHistoryScreen';
import ReviewDetailScreen from '../screens/ReviewDetailScreen';
import FeedbackHistoryScreen from '../screens/FeedbackHistoryScreen';
import FeedbackDetailScreen from '../screens/FeedbackDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationsListScreen from '../screens/NotificationsListScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

import TabNavigator from './TabNavigator';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Main App navigator - combines drawer and stack navigation
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DrawerScreens" component={DrawerScreens} />
      <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="NotificationsListScreen" component={NotificationsListScreen} />
      <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
    </Stack.Navigator>
  );
};

// Drawer navigation
const DrawerScreens = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#aa18ea',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: 'Roboto-Medium',
          fontSize: 15,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="NotificationsList"
        component={NotificationsListScreen}
        options={{
          title: "Danh sách thông báo",
          drawerIcon: ({color}) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ReviewHistory"
        component={ReviewHistoryScreen}
        options={{
          title: "Lịch sử đánh giá",
          drawerIcon: ({color}) => (
            <Ionicons name="time-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="FeedbackHistory"
        component={FeedbackHistoryScreen}
        options={{
          title: "Phản hồi từ cơ quan chức năng",
          drawerIcon: ({color}) => (
            <Ionicons name="chatbubbles-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AppNavigator;
