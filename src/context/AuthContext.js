import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config';
import { api } from '../services/api';
import { AppConsts } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [userToken, setUserToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(undefined);
    
    const login = async (userNameOrEmailAddress, password, rememberClient = false) => {
        try {
            setIsLoading(true);
            
            // Use the API service instead of direct axios call for consistent error handling
            const response = await axios.post(`${API_URL}/api/TokenAuth/Authenticate`, {
                userNameOrEmailAddress, 
                password, 
                rememberClient
            });
            
            // Save tokens
            setUserToken(response.data.result.accessToken);
            await AsyncStorage.setItem('userToken', response.data.result.accessToken);
            await AsyncStorage.setItem('enc_auth_token', response.data.result.encryptedAccessToken);
            
            // Set user role
            const role = response.data.result.userType ?? 1;
            setUserRole(role);
            await AsyncStorage.setItem('userRole', role.toString());
            
            setIsAuthenticated(true);
            
            return {
                success: true,
                data: response.data.result
            };
        } catch (error) {
            console.error('Login failed:', error);
            
            // Return detailed error information
            return {
                success: false,
                error: error,
                message: error.response?.data?.error?.message || 'Đăng nhập thất bại'
            };
        } finally {
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
            setUserRole(storedUserRole ? parseInt(storedUserRole, 10) : null);
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
