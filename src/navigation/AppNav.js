import React, {useContext} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppNavigator from './AppStack';
import TabNavigator from './TabNavigator';

import {AuthContext} from '../context/AuthContext';

const Stack = createNativeStackNavigator();

// Các screens độc lập để tránh inline function
const AuthScreen = () => <AuthStack />;
const AppScreen = () => <AppNavigator />;

const AppNav = () => {
    const {isLoading, isAuthenticated} = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#AD40AF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Main" component={TabNavigator} />
                {!isAuthenticated && (
                    <Stack.Screen name="LoginScreen" component={AuthScreen} />
                )}
                {isAuthenticated && (
                    <Stack.Screen name="AppScreens" component={AppScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNav;
