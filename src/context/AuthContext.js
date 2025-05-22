import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [userToken, setUserToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    
    const login = async (userNameOrEmailAddress, password, rememberClient = false) => {
        try {
            setIsLoading(true);
            // Minh họa login cho mục đích demo
            // Trong ứng dụng thực tế, cần sử dụng API thực
            // Mock API call
            // setTimeout(() => {
            //     setUserToken("demo_token");
            //     AsyncStorage.setItem('userToken', "demo_token");
            //     setIsAuthenticated(true);
            //     setIsLoading(false);
            // }, 1000);
            
            // API call thực tế
            axios.post(`${API_URL}/api/TokenAuth/Authenticate`, {userNameOrEmailAddress, password, rememberClient})
            .then(response => {
                setUserToken(response.data.result.accessToken);
                AsyncStorage.setItem('userToken', response.data.result.accessToken);
                
                // Set user role - In a real app, this would come from the API response
                // For this example, determine role based on email or username
                // const role = userNameOrEmailAddress.includes('business') ? 'business' : 'citizen';
                const role = 'business';
                setUserRole(role);
                AsyncStorage.setItem('userRole', role);
                
                setIsAuthenticated(true);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Login failed:', error);
                setIsLoading(false);
            });
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserRole(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const storedUserRole = await AsyncStorage.getItem('userRole');
            
            setUserToken(userToken);
            setUserRole(storedUserRole);
            setIsAuthenticated(userToken !== null);
            setIsLoading(false);
        } catch (error) {
            console.error('Error checking login status:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{
            userToken,
            isAuthenticated,
            isLoading,
            userRole,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
