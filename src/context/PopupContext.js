import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popups, setPopups] = useState({
    error: {
      visible: false,
      message: '',
    },
    success: {
      visible: false,
      message: '',
    },
    info: {
      visible: false,
      message: '',
    },
    confirmation: {
      visible: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
      isDestructive: false,
    },
  });

  const showError = (message) => {
    setPopups({
      ...popups,
      error: {
        visible: true,
        message,
      },
    });
  };

  const hideError = () => {
    setPopups({
      ...popups,
      error: {
        visible: false,
        message: '',
      },
    });
  };

  const showSuccess = (message) => {
    setPopups({
      ...popups,
      success: {
        visible: true,
        message,
      },
    });
  };

  const hideSuccess = () => {
    setPopups({
      ...popups,
      success: {
        visible: false,
        message: '',
      },
    });
  };

  const showInfo = (message) => {
    setPopups({
      ...popups,
      info: {
        visible: true,
        message,
      },
    });
  };

  const hideInfo = () => {
    setPopups({
      ...popups,
      info: {
        visible: false,
        message: '',
      },
    });
  };

  const showConfirmation = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isDestructive = false,
  }) => {
    setPopups({
      ...popups,
      confirmation: {
        visible: true,
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        isDestructive,
      },
    });
  };

  const hideConfirmation = () => {
    setPopups({
      ...popups,
      confirmation: {
        ...popups.confirmation,
        visible: false,
      },
    });
  };

  const handleConfirm = () => {
    if (popups.confirmation.onConfirm) {
      popups.confirmation.onConfirm();
    }
    hideConfirmation();
  };

  const handleCancel = () => {
    if (popups.confirmation.onCancel) {
      popups.confirmation.onCancel();
    }
    hideConfirmation();
  };

  return (
    <PopupContext.Provider
      value={{
        popups,
        showError,
        hideError,
        showSuccess,
        hideSuccess,
        showInfo,
        hideInfo,
        showConfirmation,
        hideConfirmation,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContext; 