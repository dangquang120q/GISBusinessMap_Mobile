import React, { useContext, useState } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Modal, View, TouchableWithoutFeedback } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import from screen folders using index.js
import { HomeScreen } from '../screens/home';
import { EditProfileScreen, SettingsScreen } from '../screens/profile';
import { ReviewHistoryScreen, ReviewDetailScreen, EditReviewScreen } from '../screens/reviews';
import { FeedbackHistoryScreen, FeedbackDetailScreen } from '../screens/feedback';
import { NotificationsListScreen } from '../screens/notifications';
import { 
  BusinessFacilityScreen, 
  BusinessFacilityDetailScreen, 
  AddBusinessFacilityScreen, 
  EditBusinessFacilityScreen 
} from '../screens/business';
import { 
  ForeignerManagementScreen, 
  ForeignerDetailScreen, 
  AddForeignerScreen, 
  EditForeignerScreen 
} from '../screens/foreigners';
import { 
  PrivacyScreen, 
  PrivacyPolicyScreen, 
  TermOfUseScreen, 
  VersionScreen, 
  RateScreen 
} from '../screens/info';
import EmergencyScreen from '../components/EmergencyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ReviewStack = createNativeStackNavigator();
const FeedbackStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const BusinessFacilityStack = createNativeStackNavigator();
const ForeignerManagementStack = createNativeStackNavigator();
const EmergencyStack = createNativeStackNavigator();

// Wrapper components to avoid inline functions
const AuthenticatedHomeScreen = () => <HomeScreen />;

// Review Stack Navigator
const ReviewStackScreen = () => {
  return (
    <ReviewStack.Navigator screenOptions={{headerShown: false}}>
      <ReviewStack.Screen name="ReviewHistory" component={ReviewHistoryScreen} />
      <ReviewStack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
      <ReviewStack.Screen name="EditReviewScreen" component={EditReviewScreen} />
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

// Emergency Stack Navigator
const EmergencyStackScreen = () => {
  return (
    <EmergencyStack.Navigator screenOptions={{headerShown: false}}>
      <EmergencyStack.Screen name="Emergency" component={EmergencyScreen} />
    </EmergencyStack.Navigator>
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

// Creating a dummy component for the Emergency tab
const EmergencyTab = ({ showEmergencyModal }) => {
  // This is a dummy component that doesn't render anything visible
  // It's just a placeholder for the tab
  return null;
};

const TabNavigator = () => {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  return (
    <>
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
            {userRole === 2 ? (
              // Business Role Tabs
              <>
                <Tab.Screen
                  name="BusinessFacilities"
                  component={BusinessFacilityStackScreen}
                  options={{
                    tabBarBadgeStyle: {backgroundColor: 'yellow'},
                    tabBarIcon: ({color, size}) => (
                      <Ionicons name="business-outline" color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="ForeignerManagementTab"
                  component={ForeignerManagementStackScreen}
                  options={{
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
                    tabBarBadgeStyle: {backgroundColor: 'yellow'},
                    tabBarIcon: ({color, size}) => (
                      <Ionicons name="warning-outline" color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Emergency"
                  component={EmergencyTab}
                  listeners={{
                    tabPress: (e) => {
                      // Prevent default navigation
                      e.preventDefault();
                      // Show emergency modal instead
                      setEmergencyModalVisible(true);
                    },
                  }}
                  options={{
                    tabBarIcon: ({color, size}) => (
                      <Ionicons name="call-outline" color="#FF3B30" size={size} />
                    ),
                  }}
                />
              </>
            )}
            <Tab.Screen
              name="Notifications"
              component={NotificationsListScreen}
              options={{
                tabBarBadge: 2,
                tabBarBadgeStyle: {backgroundColor: 'yellow'},
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

      {/* Emergency Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={emergencyModalVisible}
        onRequestClose={() => {
          setEmergencyModalVisible(false);
        }}
      >
        <EmergencyScreen onClose={() => setEmergencyModalVisible(false)} />
      </Modal>
    </>
  );
};

const getTabBarVisibility = route => {
  return 'flex';
};

export default TabNavigator;
