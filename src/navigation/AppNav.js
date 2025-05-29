import React, {useContext, useRef, useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppNavigator from './AppStack';
import TabNavigator from './TabNavigator';

import {AuthContext} from '../context/AuthContext';
import {setNavigationRef} from '../services/api';

const Stack = createNativeStackNavigator();

// Các screens độc lập để tránh inline function
const AuthScreen = () => <AuthStack />;
const AppScreen = () => <AppNavigator />;

const AppNav = () => {
    const {isLoading, isAuthenticated} = useContext(AuthContext);
    const navigationRef = useRef(null);

    useEffect(() => {
        // Set navigation reference for API service to use
        if (navigationRef.current) {
            setNavigationRef(navigationRef.current);
        }
    }, [navigationRef.current]);

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#085924" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
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
