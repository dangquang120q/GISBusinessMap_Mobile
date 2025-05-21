import api from './api';

/**
 * Service để tương tác với API BusinessReviewMedia
 */
class BusinessReviewMediaService {
  /**
   * Tạo mới media cho đánh giá
   * 
   * @param {Object} mediaData Dữ liệu media cần tạo
   * @returns {Promise} Promise với kết quả media đã tạo
   */
  async create(mediaData) {
    try {
      const response = await api.post('/api/services/app/BusinessReviewMedia/Create', mediaData);
      return response.result;
    } catch (error) {
      console.error('Error creating business review media:', error);
      throw error;
    }
  }

  /**
   * Cập nhật media đánh giá
   * 
   * @param {Object} mediaData Dữ liệu media cần cập nhật
   * @returns {Promise} Promise với kết quả media đã cập nhật
   */
  async update(mediaData) {
    try {
      const response = await api.put('/api/services/app/BusinessReviewMedia/Update', mediaData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business review media with id ${mediaData.id}:`, error);
      throw error;
    }
  }
}

export default new BusinessReviewMediaService(); 