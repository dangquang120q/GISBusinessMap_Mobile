import React, { useContext } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewHistoryScreen from '../screens/ReviewHistoryScreen';
import FeedbackHistoryScreen from '../screens/FeedbackHistoryScreen';
import NotificationsListScreen from '../screens/NotificationsListScreen';
import ReviewDetailScreen from '../screens/ReviewDetailScreen';
import FeedbackDetailScreen from '../screens/FeedbackDetailScreen';
import BusinessFacilityScreen from '../screens/BusinessFacilityScreen';
import ForeignerManagementScreen from '../screens/ForeignerManagementScreen';
import ForeignerDetailScreen from '../screens/ForeignerDetailScreen';
import AddForeignerScreen from '../screens/AddForeignerScreen';
import EditForeignerScreen from '../screens/EditForeignerScreen';
import BusinessFacilityDetailScreen from '../screens/BusinessFacilityDetailScreen';
import AddBusinessFacilityScreen from '../screens/AddBusinessFacilityScreen';
import EditBusinessFacilityScreen from '../screens/EditBusinessFacilityScreen';

import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrivacyScreen from '../screens/PrivacyScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermOfUseScreen from '../screens/TermOfUseScreen';
import VersionScreen from '../screens/VersionScreen';
import RateScreen from '../screens/RateScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ReviewStack = createNativeStackNavigator();
const FeedbackStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const BusinessFacilityStack = createNativeStackNavigator();
const ForeignerManagementStack = createNativeStackNavigator();

// Wrapper components to avoid inline functions
const AuthenticatedHomeScreen = () => <HomeScreen />;

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

// Business Facility Stack Navigator
const BusinessFacilityStackScreen = () => {
  return (
    <BusinessFacilityStack.Navigator screenOptions={{headerShown: false}}>
      <BusinessFacilityStack.Screen name="BusinessFacility" component={BusinessFacilityScreen} />
      <BusinessFacilityStack.Screen name="BusinessFacilityDetail" component={BusinessFacilityDetailScreen} />
      <BusinessFacilityStack.Screen name="AddBusinessFacility" component={AddBusinessFacilityScreen} />
      <BusinessFacilityStack.Screen name="EditBusinessFacility" component={EditBusinessFacilityScreen} />
    </BusinessFacilityStack.Navigator>
  );
};

// Foreigner Management Stack Navigator
const ForeignerManagementStackScreen = () => {
  return (
    <ForeignerManagementStack.Navigator screenOptions={{headerShown: false}}>
      <ForeignerManagementStack.Screen name="ForeignerManagement" component={ForeignerManagementScreen} />
      <ForeignerManagementStack.Screen name="ForeignerDetail" component={ForeignerDetailScreen} />
      <ForeignerManagementStack.Screen name="AddForeigner" component={AddForeignerScreen} />
      <ForeignerManagementStack.Screen name="EditForeigner" component={EditForeignerScreen} />
    </ForeignerManagementStack.Navigator>
  );
};

// Profile Stack Navigator
const SettingsStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{headerShown: false}}>
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <ProfileStack.Screen name="PrivacyScreen" component={PrivacyScreen} />
      <ProfileStack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="TermOfUseScreen" component={TermOfUseScreen} />
      <ProfileStack.Screen name="VersionScreen" component={VersionScreen} />
      <ProfileStack.Screen name="RateScreen" component={RateScreen} />
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
  const { isAuthenticated, userRole } = useContext(AuthContext);

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
          {userRole === 'business' ? (
            // Business Role Tabs
            <>
              <Tab.Screen
                name="BusinessFacilities"
                component={BusinessFacilityStackScreen}
                options={{
                  tabBarBadge: 2,
                  tabBarBadgeStyle: {backgroundColor: 'yellow'},
                  tabBarIcon: ({color, size}) => (
                    <Ionicons name="business-outline" color={color} size={size} />
                  ),
                }}
              />
              <Tab.Screen
                name="ForeignerManagement"
                component={ForeignerManagementStackScreen}
                options={{
                  tabBarBadge: 3,
                  tabBarBadgeStyle: {backgroundColor: 'yellow'},
                  tabBarIcon: ({color, size}) => (
                    <Ionicons name="people-outline" color={color} size={size} />
                  ),
                }}
              />
            </>
          ) : (
            // Citizen Role Tabs
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
            </>
          )}
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
