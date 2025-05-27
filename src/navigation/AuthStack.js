import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Import from screen folders using index.js
import { OnboardingScreen } from '../screens/onboarding';
import { LoginScreen, RegisterScreen } from '../screens/auth';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
