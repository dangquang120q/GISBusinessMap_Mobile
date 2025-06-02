import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useConfiguration } from '../context/ConfigurationContext';

/**
 * Component that handles configuration loading states
 * Can be used as a wrapper or conditionally in components that rely on configuration data
 */
const ConfigurationLoader = ({ children, fallback, showRetry = true }) => {
  const { loading, error, reloadConfiguration } = useConfiguration();

  // Show loading indicator while fetching configuration
  if (loading) {
    return fallback || (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.text}>Loading application configuration...</Text>
      </View>
    );
  }

  // Show error state if configuration failed to load
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        {showRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={reloadConfiguration}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // If configuration loaded successfully, render children
  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ConfigurationLoader; 