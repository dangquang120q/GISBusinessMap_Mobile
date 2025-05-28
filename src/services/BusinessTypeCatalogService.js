import api from './api';

/**
 * Service để tương tác với API BusinessTypeCatalog
 */
class BusinessTypeCatalogService {
  /**
   * Lấy danh sách đơn giản tất cả loại doanh nghiệp
   * 
   * @returns {Promise} Promise với kết quả danh sách loại doanh nghiệp
   */
  async getList() {
    try {
      const response = await api.get('/api/services/app/BusinessTypeCatalog/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching business type catalog list:', error);
      throw error;
    }
  }
}

export default new BusinessTypeCatalogService(); 