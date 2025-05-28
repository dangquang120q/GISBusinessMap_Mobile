import api from './api';

/**
 * Service để tương tác với API Account
 */
class AccountService {
  /**
   * Đăng ký người dùng mới
   * 
   * @param {Object} registerData Dữ liệu đăng ký tài khoản
   * @param {string} registerData.name Tên
   * @param {string} registerData.surname Họ
   * @param {string} registerData.gender Giới tính
   * @param {string} registerData.phoneNumber Số điện thoại
   * @param {string} registerData.dateOfBirth Ngày sinh
   * @param {string} registerData.userName Tên đăng nhập
   * @param {string} registerData.emailAddress Địa chỉ email
   * @param {string} registerData.password Mật khẩu
   * @param {string} registerData.confirmPassword Xác nhận mật khẩu
   * @returns {Promise} Promise với kết quả đăng ký
   */
  async register(registerData) {
    try {
      const response = await api.post('/api/services/app/UserProfile/Register', registerData);
      
      console.log('Registration API response:', response);
      
      return response.result || { canLogin: false };
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }
}

export default new AccountService(); 