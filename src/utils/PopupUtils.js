import { api } from '../services/api';
import { usePopup } from '../context/PopupContext';

// Create a hook to get the popup context
let popupContext = null;

export const initializePopupUtils = () => {
  popupContext = usePopup();
};

// Convenience functions to replace Alert.alert
export const showError = (message) => {
  if (popupContext) {
    popupContext.showError(message);
  } else {
    api.showError(message);
  }
};

export const showSuccess = (message) => {
  if (popupContext) {
    popupContext.showSuccess(message);
  } else {
    api.showSuccess(message);
  }
};

export const showInfo = (message) => {
  if (popupContext) {
    popupContext.showInfo(message);
  } else {
    api.showInfo(message);
  }
};

// Confirmation dialog (replacement for Alert.alert with buttons)
export const showConfirmation = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDestructive = false,
}) => {
  if (popupContext) {
    popupContext.showConfirmation({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      isDestructive,
    });
  } else {
    console.warn('PopupContext not initialized. Call initializePopupUtils first.');
  }
};

// Common confirmation patterns
export const showDeleteConfirmation = (message, onConfirm) => {
  showConfirmation({
    title: 'Xác nhận xóa',
    message: message || 'Bạn có chắc chắn muốn xóa mục này?',
    onConfirm,
    confirmText: 'Xóa',
    isDestructive: true,
  });
};

// Helper functions for common patterns
export const showValidationError = (message) => {
  showError(message || 'Vui lòng kiểm tra lại thông tin');
};

export const showNetworkError = () => {
  showError('Có vấn đề về kết nối. Vui lòng thoát ứng dụng và mở lại.');
};

export const showOperationSuccess = (message) => {
  showSuccess(message || 'Thao tác thành công');
};

// Component to initialize popup utils
export const PopupUtilsInitializer = () => {
  popupContext = usePopup();
  return null;
};

export default {
  showError,
  showSuccess,
  showInfo,
  showConfirmation,
  showDeleteConfirmation,
  showValidationError,
  showNetworkError,
  showOperationSuccess,
  initializePopupUtils,
  PopupUtilsInitializer,
}; 