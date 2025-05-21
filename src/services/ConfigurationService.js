import api from './api';

/**
 * Service để tương tác với API Configuration
 */
class ConfigurationService {
  /**
   * Lấy tất cả cấu hình của người dùng
   * 
   * @returns {Promise} Promise với kết quả cấu hình người dùng
   */
  async getAll() {
    try {
      const response = await api.get('/api/services/app/Configuration/GetAll');
      return response.result;
    } catch (error) {
      console.error('Error fetching user configuration:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả cài đặt
   * 
   * @returns {Promise} Promise với kết quả danh sách cài đặt
   */
  async getAllSettings() {
    try {
      const response = await api.get('/api/services/app/Configuration/GetAllSettings');
      return response.result;
    } catch (error) {
      console.error('Error fetching all settings:', error);
      throw error;
    }
  }

  /**
   * Cập nhật cài đặt
   * 
   * @param {Array} settingsData Mảng cài đặt cần cập nhật
   * @returns {Promise<boolean>} Promise với kết quả cập nhật
   */
  async updateSettings(settingsData) {
    try {
      const response = await api.post('/api/services/app/Configuration/UpdateSettings', settingsData);
      return response.result;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}

export default new ConfigurationService(); 