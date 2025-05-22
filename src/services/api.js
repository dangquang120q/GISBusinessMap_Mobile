import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        // Thực hiện logout hoặc refresh token tại đây
        console.log('Token expired or invalid');
        
        // Ví dụ: Xóa token và thông tin người dùng
        await AsyncStorage.removeItem('userToken');
        // TODO: Redirect đến màn hình login
      }
      
      // Xử lý lỗi không có quyền (403)
      if (status === 403) {
        console.log('Forbidden: No permission to access this resource');
      }
      
      // Lỗi server (500)
      if (status >= 500) {
        console.log('Server error occurred');
      }
    } else if (error.request) {
      // Request gửi đi nhưng không nhận được response
      console.log('Network error or server not responding');
    } else {
      // Lỗi khi thiết lập request
      console.log('Error setting up request:', error.message);
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
  }
};

export default api; 