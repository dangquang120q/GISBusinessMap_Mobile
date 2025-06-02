import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

// Popup handlers
let popupHandler = null;

// Function to set popup handler from PopupContext
export const setErrorHandler = (handler) => {
  popupHandler = handler;
};

// Navigation reference to use outside of React components
let navigationRef = null;

// Function to set navigation reference from App.js or navigation container
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Function to navigate when token expires
const navigateToAuth = () => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'Main',
          },
          {
            name: 'LoginScreen',
          }
        ],
      })
    );
  }
};

// Tạo instance của axios với URL gốc
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 giây timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor thêm token vào mỗi request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      // Nếu có token, thêm vào header Authorization
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
apiClient.interceptors.response.use(
  (response) => {
    // Trong trường hợp response thành công, chỉ trả về data
    return response;
  },
  async (error) => {
    // Xử lý các trường hợp lỗi phổ biến
    if (error.response) {
      // Lỗi từ server với mã trạng thái
      const { status } = error.response;
      
      // Xử lý token hết hạn (401)
      if (status === 401) {
        console.log('Token expired or invalid');
        
        // Xóa token và thông tin người dùng
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        
        // Redirect đến màn hình login
        navigateToAuth();
      }
      // Xử lý lỗi không có quyền (403)
      else if (status === 403) {
        console.log('Forbidden: No permission to access this resource');
        if (popupHandler) {
          popupHandler.showError('Có vấn đề về kết nối. Vui lòng thoát ứng dụng và mở lại.');
        }
      }
      // Lỗi server (500)
      else if (status >= 500) {
        console.log('Server error occurred');
        if (popupHandler) {
          popupHandler.showError('Có vấn đề về kết nối. Vui lòng thoát ứng dụng và mở lại.');
        }
      }
      // Các lỗi khác
      else {
        if (popupHandler) {
          popupHandler.showError('Có vấn đề về kết nối. Vui lòng thoát ứng dụng và mở lại.');
        }
      }
    } else if (error.request) {
      // Request gửi đi nhưng không nhận được response
      console.log('Network error or server not responding');
      if (popupHandler) {
        popupHandler.showError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
    } else {
      // Lỗi khi thiết lập request
      console.log('Error setting up request:', error.message);
      if (popupHandler) {
        popupHandler.showError('Đã có lỗi xảy ra khi thiết lập yêu cầu.');
      }
    }
    
    return Promise.reject(error);
  }
);

// Các hàm helper để sử dụng trong các service
export const api = {
  get: async (url, params = {}) => {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`GET Error for ${url}:`, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST Error for ${url}:`, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT Error for ${url}:`, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE Error for ${url}:`, error);
      throw error;
    }
  },
  
  // Hàm để thực hiện DELETE với body data (một số API yêu cầu điều này)
  deleteWithData: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.delete(url, { 
        ...config,
        data 
      });
      return response.data;
    } catch (error) {
      console.error(`DELETE with data Error for ${url}:`, error);
      throw error;
    }
  },
  
  // Helpers to show success and info popups
  showSuccess: (message) => {
    if (popupHandler && popupHandler.showSuccess) {
      popupHandler.showSuccess(message);
    }
  },
  
  showInfo: (message) => {
    if (popupHandler && popupHandler.showInfo) {
      popupHandler.showInfo(message);
    }
  },
  
  showError: (message) => {
    if (popupHandler && popupHandler.showError) {
      popupHandler.showError(message);
    }
  }
};

export default api; 