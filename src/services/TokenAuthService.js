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
      return response.result;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
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
      return response;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
}

export default new TokenAuthService(); 