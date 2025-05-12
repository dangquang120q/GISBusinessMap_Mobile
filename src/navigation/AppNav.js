import React, {useContext} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppNavigator from './AppStack';

import {AuthContext} from '../context/AuthContext';

const AppNav = () => {
    const {isLoading, userToken} = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? <AppNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNav;
