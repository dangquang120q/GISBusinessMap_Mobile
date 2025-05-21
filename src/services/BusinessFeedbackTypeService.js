import api from './api';

/**
 * Service để tương tác với API BusinessFeedbackTypes
 */
class BusinessFeedbackTypeService {
  /**
   * Lấy danh sách tất cả loại phản hồi với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {string} params.feedbackTypeName Tên loại phản hồi
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách loại phản hồi
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessFeedbackTypes/GetAll', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching business feedback types:', error);
      throw error;
    }
  }

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

  /**
   * Lấy thông tin một loại phản hồi theo ID
   * 
   * @param {number} id ID của loại phản hồi
   * @returns {Promise} Promise với kết quả loại phản hồi
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/BusinessFeedbackTypes/Get', { Id: id });
      return response.result;
    } catch (error) {
      console.error(`Error fetching business feedback type with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới loại phản hồi
   * 
   * @param {Object} typeData Dữ liệu loại phản hồi cần tạo
   * @returns {Promise} Promise với kết quả loại phản hồi đã tạo
   */
  async create(typeData) {
    try {
      const response = await api.post('/api/services/app/BusinessFeedbackTypes/Create', typeData);
      return response.result;
    } catch (error) {
      console.error('Error creating business feedback type:', error);
      throw error;
    }
  }

  /**
   * Cập nhật loại phản hồi
   * 
   * @param {Object} typeData Dữ liệu loại phản hồi cần cập nhật
   * @returns {Promise} Promise với kết quả loại phản hồi đã cập nhật
   */
  async update(typeData) {
    try {
      const response = await api.put('/api/services/app/BusinessFeedbackTypes/Update', typeData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business feedback type with id ${typeData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa loại phản hồi theo ID
   * 
   * @param {number} id ID của loại phản hồi cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/BusinessFeedbackTypes/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting business feedback type with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa nhiều loại phản hồi
   * 
   * @param {Array} types Danh sách loại phản hồi cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async deleteMultiple(types) {
    try {
      const response = await api.deleteWithData('/api/services/app/BusinessFeedbackTypes/DeleteMultiple', types);
      return response.result;
    } catch (error) {
      console.error('Error deleting multiple business feedback types:', error);
      throw error;
    }
  }
}

export default new BusinessFeedbackTypeService(); 