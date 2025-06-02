import React, { createContext, useState, useContext, useEffect } from 'react';
import ConfigurationService from '../services/ConfigurationService';
import { api } from '../services/api';

// Create the Configuration Context
const ConfigurationContext = createContext();

// Custom hook for easy access to configuration data
export const useConfiguration = () => {
  return useContext(ConfigurationContext);
};

// Provider component to wrap the app and provide configuration data
export const ConfigurationProvider = ({ children }) => {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch configuration data
  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API using the ConfigurationService
      const response = await ConfigurationService.getAll();
      
      // Store the configuration data
      setConfiguration(response);
      
      // Log success
      console.log('Configuration loaded successfully');
      
      return response;
    } catch (err) {
      setError('Failed to load configuration data');
      console.error('Error loading configuration:', err);
      api.showError('Failed to load application configuration. Please restart the app.');
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load configuration when the app starts
  useEffect(() => {
    fetchConfiguration();
  }, []);

  // Reload configuration manually if needed
  const reloadConfiguration = () => {
    return fetchConfiguration();
  };

  // Value to be provided to consumers
  const value = {
    configuration,
    loading,
    error,
    reloadConfiguration,
    // Helper getters for common configuration values
    getCurrentLanguage: () => configuration?.localization?.currentLanguage,
    getMultiTenancy: () => configuration?.multiTenancy,
    getSession: () => configuration?.session,
    getPermissions: () => configuration?.auth?.grantedPermissions,
    getSettings: () => configuration?.setting?.values,
    // Add more helper methods as needed
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationContext; 