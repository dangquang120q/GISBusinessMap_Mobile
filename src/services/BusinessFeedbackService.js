import api from './api';

/**
 * Service để tương tác với API BusinessFeedbacks
 */
class BusinessFeedbackService {
  /**
   * Lấy danh sách tất cả phản hồi với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {string} params.organizationName Tên tổ chức
   * @param {string} params.status Trạng thái phản hồi
   * @param {number} params.feedbackTypeId ID loại phản hồi
   * @param {number} params.assignedTo ID người được gán xử lý
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách phản hồi
   */
  async getAllByUser(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessFeedbacks/GetAllByUser', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching business feedbacks:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin một phản hồi theo ID
   * 
   * @param {number} id ID của phản hồi
   * @returns {Promise} Promise với kết quả phản hồi
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/BusinessFeedbacks/Get', { Id: id });
      return response.result;
    } catch (error) {
      console.error(`Error fetching business feedback with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới phản hồi
   * 
   * @param {Object} feedbackData Dữ liệu phản hồi cần tạo
   * @returns {Promise} Promise với kết quả phản hồi đã tạo
   */
  async create(feedbackData) {
    try {
      const response = await api.post('/api/services/app/BusinessFeedbacks/Create', feedbackData);
      return response.result;
    } catch (error) {
      console.error('Error creating business feedback:', error);
      throw error;
    }
  }

  /**
   * Cập nhật phản hồi
   * 
   * @param {Object} feedbackData Dữ liệu phản hồi cần cập nhật
   * @returns {Promise} Promise với kết quả phản hồi đã cập nhật
   */
  async update(feedbackData) {
    try {
      const response = await api.put('/api/services/app/BusinessFeedbacks/Update', feedbackData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business feedback with id ${feedbackData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa phản hồi theo ID
   * 
   * @param {number} id ID của phản hồi cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/BusinessFeedbacks/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting business feedback with id ${id}:`, error);
      throw error;
    }
  }
}

export default new BusinessFeedbackService(); 