import { Alert } from 'react-native';
import {
  showError,
  showSuccess,
  showInfo,
  showConfirmation,
  showDeleteConfirmation,
  showValidationError,
  showNetworkError,
  showOperationSuccess,
} from './PopupUtils';

/**
 * This file contains examples of how to replace different Alert.alert patterns
 * with our new popup components.
 */

// BEFORE: Simple error alert
export const beforeSimpleError = () => {
  Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
};

// AFTER: Simple error alert
export const afterSimpleError = () => {
  showError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
};

// BEFORE: Success alert
export const beforeSuccess = () => {
  Alert.alert('Thành công', 'Dữ liệu đã được lưu thành công.');
};

// AFTER: Success alert
export const afterSuccess = () => {
  showSuccess('Dữ liệu đã được lưu thành công.');
};

// BEFORE: Info alert
export const beforeInfo = () => {
  Alert.alert('Thông báo', 'Hệ thống sẽ bảo trì lúc 22:00 hôm nay.');
};

// AFTER: Info alert
export const afterInfo = () => {
  showInfo('Hệ thống sẽ bảo trì lúc 22:00 hôm nay.');
};

// BEFORE: Validation error
export const beforeValidationError = () => {
  Alert.alert('Lỗi', 'Vui lòng nhập tên doanh nghiệp.');
};

// AFTER: Validation error
export const afterValidationError = () => {
  showValidationError('Vui lòng nhập tên doanh nghiệp.');
};

// BEFORE: Network error
export const beforeNetworkError = () => {
  Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
};

// AFTER: Network error
export const afterNetworkError = () => {
  showNetworkError();
};

// BEFORE: Operation success
export const beforeOperationSuccess = () => {
  Alert.alert('Thành công', 'Đã cập nhật thông tin doanh nghiệp.');
};

// AFTER: Operation success
export const afterOperationSuccess = () => {
  showOperationSuccess('Đã cập nhật thông tin doanh nghiệp.');
};

// BEFORE: Confirmation dialog
export const beforeConfirmation = (onConfirm) => {
  Alert.alert(
    'Xác nhận',
    'Bạn có muốn tiếp tục không?',
    [
      {
        text: 'Hủy',
        style: 'cancel'
      },
      {
        text: 'Tiếp tục',
        onPress: onConfirm
      }
    ]
  );
};

// AFTER: Confirmation dialog
export const afterConfirmation = (onConfirm) => {
  showConfirmation({
    title: 'Xác nhận',
    message: 'Bạn có muốn tiếp tục không?',
    onConfirm: onConfirm,
    confirmText: 'Tiếp tục'
  });
};

// BEFORE: Delete confirmation
export const beforeDeleteConfirmation = (onConfirm) => {
  Alert.alert(
    'Xác nhận xóa',
    'Bạn có chắc chắn muốn xóa mục này không?',
    [
      {
        text: 'Hủy',
        style: 'cancel'
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: onConfirm
      }
    ]
  );
};

// AFTER: Delete confirmation
export const afterDeleteConfirmation = (onConfirm) => {
  showDeleteConfirmation('Bạn có chắc chắn muốn xóa mục này không?', onConfirm);
};

// BEFORE: Multi-button alert (not directly supported by our new popups)
export const beforeMultiButtonAlert = (onOption1, onOption2, onOption3) => {
  Alert.alert(
    'Chọn hành động',
    'Vui lòng chọn một trong các tùy chọn sau:',
    [
      {
        text: 'Tùy chọn 1',
        onPress: onOption1
      },
      {
        text: 'Tùy chọn 2',
        onPress: onOption2
      },
      {
        text: 'Tùy chọn 3',
        onPress: onOption3
      },
      {
        text: 'Hủy',
        style: 'cancel'
      }
    ]
  );
};

// For multi-button alerts, you'll need to create a custom component
// or use a different approach, such as a bottom sheet or a modal with buttons

export default {
  // Simple alerts
  beforeSimpleError,
  afterSimpleError,
  beforeSuccess,
  afterSuccess,
  beforeInfo,
  afterInfo,
  
  // Common patterns
  beforeValidationError,
  afterValidationError,
  beforeNetworkError,
  afterNetworkError,
  beforeOperationSuccess,
  afterOperationSuccess,
  
  // Confirmation dialogs
  beforeConfirmation,
  afterConfirmation,
  beforeDeleteConfirmation,
  afterDeleteConfirmation,
  
  // Multi-button alert (requires custom approach)
  beforeMultiButtonAlert,
}; 