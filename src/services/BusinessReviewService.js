import api from './api';

/**
 * Service để tương tác với API BusinessReviews
 */
class BusinessReviewService {
  /**
   * Lấy danh sách tất cả đánh giá với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {number} params.id ID đánh giá
   * @param {number} params.branchId ID chi nhánh
   * @param {string} params.organizationName Tên tổ chức
   * @param {string} params.reviewerName Tên người đánh giá
   * @param {number} params.rating Số sao đánh giá
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách đánh giá
   */
  async getAllByBusiness(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessReviews/GetAllByBusiness', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      throw error;
    }
  }
  /**
   * Lấy danh sách tất cả đánh giá với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {number} params.id ID đánh giá
   * @param {number} params.branchId ID chi nhánh
   * @param {string} params.organizationName Tên tổ chức
   * @param {string} params.reviewerName Tên người đánh giá
   * @param {number} params.rating Số sao đánh giá
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách đánh giá
   */
  async getAllByUser(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessReviews/GetAllByUser', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      throw error;
    }
  }
    /**
   * Lấy danh sách tất cả đánh giá với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {number} params.id ID đánh giá
   * @param {number} params.branchId ID chi nhánh
   * @param {string} params.organizationName Tên tổ chức
   * @param {string} params.reviewerName Tên người đánh giá
   * @param {number} params.rating Số sao đánh giá
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách đánh giá
   */
    async getList(params = {}) {
      try {
        const response = await api.get('/api/services/app/BusinessReviews/GetList', params);
        return response.result;
      } catch (error) {
        console.error('Error fetching business reviews:', error);
        throw error;
      }
    }
  /**
   * Lấy thông tin một đánh giá theo ID
   * 
   * @param {number} id ID của đánh giá
   * @returns {Promise} Promise với kết quả đánh giá
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/BusinessReviews/Get', { Id: id });
      return response.result;
    } catch (error) {
      console.error(`Error fetching business review with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới đánh giá
   * 
   * @param {Object} reviewData Dữ liệu đánh giá cần tạo
   * @returns {Promise} Promise với kết quả đánh giá đã tạo
   */
  async create(reviewData) {
    try {
      const response = await api.post('/api/services/app/BusinessReviews/Create', reviewData);
      return response.result;
    } catch (error) {
      console.error('Error creating business review:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá
   * 
   * @param {Object} reviewData Dữ liệu đánh giá cần cập nhật
   * @returns {Promise} Promise với kết quả đánh giá đã cập nhật
   */
  async update(reviewData) {
    try {
      const response = await api.put('/api/services/app/BusinessReviews/Update', reviewData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business review with id ${reviewData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa đánh giá theo ID
   * 
   * @param {number} id ID của đánh giá cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/BusinessReviews/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting business review with id ${id}:`, error);
      throw error;
    }
  }
}

export default new BusinessReviewService(); 