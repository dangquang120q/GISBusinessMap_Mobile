import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ConfigurationProvider } from './context/ConfigurationContext';
import AppNav from './navigation/AppNav';
import SignalRService from './services/SignalRService';
import { PopupProvider } from './context/PopupContext';

// Component to handle SignalR connection
const SignalRInitializer = () => {
  React.useEffect(() => {
    const initSignalR = async () => {
      try {
        await SignalRService.initializeConnection();
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
      }
    };

    initSignalR();
    return () => {
      SignalRService.disconnect();
    };
  }, []);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <ConfigurationProvider>
        <PopupProvider>
          <SignalRInitializer />
          <AppNav />
        </PopupProvider>
      </ConfigurationProvider>
    </AuthProvider>
  );
};

export default App; 