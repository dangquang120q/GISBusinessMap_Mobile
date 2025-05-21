import api from './api';

/**
 * Service để tương tác với API Session
 */
class SessionService {
  /**
   * Lấy thông tin đăng nhập hiện tại
   * 
   * @returns {Promise} Promise với kết quả thông tin đăng nhập
   */
  async getCurrentLoginInformations() {
    try {
      const response = await api.get('/api/services/app/Session/GetCurrentLoginInformations');
      return response.result;
    } catch (error) {
      console.error('Error fetching current login information:', error);
      throw error;
    }
  }

  /**
   * Thay đổi mật khẩu
   * 
   * @param {Object} passwordData Dữ liệu mật khẩu cần thay đổi
   * @param {string} passwordData.currentPassword Mật khẩu hiện tại
   * @param {string} passwordData.newPassword Mật khẩu mới
   * @returns {Promise<boolean>} Promise với kết quả thay đổi mật khẩu
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/api/services/app/Session/ChangePassword', passwordData);
      return response.result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Cập nhật hồ sơ người dùng
   * 
   * @param {Object} profileData Dữ liệu hồ sơ cần cập nhật
   * @returns {Promise} Promise với kết quả hồ sơ đã cập nhật
   */
  async updateProfile(profileData) {
    try {
      console.log('profileData', profileData);
      const response = await api.post('/api/services/app/Session/UpdateProfile', profileData);
      return response.result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật cài đặt người dùng
   * 
   * @param {Array} settingsData Mảng cài đặt cần cập nhật
   * @returns {Promise<boolean>} Promise với kết quả cập nhật
   */
  async updateSettings(settingsData) {
    try {
      const response = await api.post('/api/services/app/Session/UpdateSettings', settingsData);
      return response.result;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
}

export default new SessionService(); 