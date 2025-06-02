import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({
    visible: false,
    message: '',
  });

  const showError = (message) => {
    setError({
      visible: true,
      message,
    });
  };

  const hideError = () => {
    setError({
      visible: false,
      message: '',
    });
  };

  return (
    <ErrorContext.Provider
      value={{
        error,
        showError,
        hideError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext; 