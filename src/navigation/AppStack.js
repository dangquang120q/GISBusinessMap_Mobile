import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import TabNavigator from './TabNavigator';

// Import from screen folders using index.js
import { SettingsScreen, EditProfileScreen } from '../screens/profile';
import { ReviewHistoryScreen, ReviewDetailScreen } from '../screens/reviews';
import { FeedbackHistoryScreen, FeedbackDetailScreen } from '../screens/feedback';
import { NotificationsScreen, NotificationsListScreen } from '../screens/notifications';
import { 
  PrivacyScreen, 
  PrivacyPolicyScreen, 
  TermOfUseScreen, 
  VersionScreen, 
  RateScreen 
} from '../screens/info';

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
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermOfUseScreen" component={TermOfUseScreen} />
      <Stack.Screen name="VersionScreen" component={VersionScreen} />
      <Stack.Screen name="RateScreen" component={RateScreen} />
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
