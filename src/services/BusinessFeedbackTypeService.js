import api from './api';

/**
 * Service để tương tác với API BusinessFeedbackTypes
 */
class BusinessFeedbackTypeService {

  /**
   * Lấy danh sách đơn giản tất cả loại phản hồi
   * 
   * @returns {Promise} Promise với kết quả danh sách loại phản hồi
   */
  async getList() {
    try {
      const response = await api.get('/api/services/app/BusinessFeedbackTypes/GetList');
      return response.result;
    } catch (error) {
      console.error('Error fetching business feedback types list:', error);
      throw error;
    }
  }
}

export default new BusinessFeedbackTypeService(); 