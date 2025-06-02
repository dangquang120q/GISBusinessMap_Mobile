import React from 'react';

import AppNav from './src/navigation/AppNav';
import {AuthProvider} from './src/context/AuthContext';
import {PopupProvider, usePopup} from './src/context/PopupContext';
import {ConfigurationProvider} from './src/context/ConfigurationContext';
import ErrorPopup from './src/components/ErrorPopup';
import SuccessPopup from './src/components/SuccessPopup';
import InfoPopup from './src/components/InfoPopup';
import ConfirmationPopup from './src/components/ConfirmationPopup';
import {setErrorHandler} from './src/services/api';
import {PopupUtilsInitializer} from './src/utils/PopupUtils';

// Wrapper component to connect Popups with PopupContext
const PopupHandler = () => {
  const {
    popups,
    hideError,
    hideSuccess,
    hideInfo,
    showError,
    handleConfirm,
    handleCancel,
  } = usePopup();
  
  // Set error handler for API service
  React.useEffect(() => {
    setErrorHandler({
      showError: showError
    });
  }, [showError]);
  
  return (
    <>
      {/* Initialize PopupUtils with the current context */}
      <PopupUtilsInitializer />
      
      <ErrorPopup 
        visible={popups.error.visible} 
        message={popups.error.message} 
        onClose={hideError} 
      />
      <SuccessPopup 
        visible={popups.success.visible} 
        message={popups.success.message} 
        onClose={hideSuccess} 
      />
      <InfoPopup 
        visible={popups.info.visible} 
        message={popups.info.message} 
        onClose={hideInfo} 
      />
      <ConfirmationPopup
        visible={popups.confirmation.visible}
        title={popups.confirmation.title}
        message={popups.confirmation.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={popups.confirmation.confirmText}
        cancelText={popups.confirmation.cancelText}
        isDestructive={popups.confirmation.isDestructive}
      />
    </>
  );
};

function App() {
  return (
    <PopupProvider>
      <ConfigurationProvider>
        <AuthProvider>
          <AppNav />
          <PopupHandler />
        </AuthProvider>
      </ConfigurationProvider>
    </PopupProvider>
  );
}

export default App;
