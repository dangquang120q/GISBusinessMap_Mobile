import api from './api';

/**
 * Service để tương tác với API TokenAuth
 */
class TokenAuthService {
  /**
   * Xác thực người dùng
   * 
   * @param {Object} loginData Dữ liệu đăng nhập
   * @param {string} loginData.userNameOrEmailAddress Tên đăng nhập hoặc địa chỉ email
   * @param {string} loginData.password Mật khẩu
   * @param {boolean} loginData.rememberClient Ghi nhớ thiết bị
   * @returns {Promise} Promise với kết quả xác thực
   */
  async authenticate(loginData) {
    try {
      const response = await api.post('/api/TokenAuth/Authenticate', loginData);
      
      if (!response || !response.result) {
        throw new Error('Không nhận được kết quả xác thực');
      }
      
      return {
        success: true,
        data: response.result
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      
      return {
        success: false,
        error: error,
        message: error.response?.data?.error?.message || 'Đăng nhập thất bại'
      };
    }
  }

  /**
   * Đăng xuất
   * 
   * @returns {Promise} Promise với kết quả đăng xuất
   */
  async logout() {
    try {
      const response = await api.post('/api/TokenAuth/Logout');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error logging out:', error);
      return {
        success: false,
        error: error,
        message: 'Đăng xuất thất bại'
      };
    }
  }
}

export default new TokenAuthService(); 