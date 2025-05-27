import api from './api';

/**
 * Service để tương tác với API Foreigners
 */
class ForeignersService {
  /**
   * Lấy danh sách tất cả người nước ngoài với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {string} params.fullName Họ tên
   * @param {string} params.dateOfBirth Ngày sinh
   * @param {string} params.passportNumber Số hộ chiếu
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách người nước ngoài
   */
  async getAllByBusiness(params = {}) {
    try {
      const response = await api.get('/api/services/app/Foreigners/GetAllByBusiness', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching foreigners:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin một người nước ngoài theo ID
   * 
   * @param {number} id ID của người nước ngoài
   * @returns {Promise} Promise với kết quả thông tin người nước ngoài
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/Foreigners/Get', { Id: id });
      return response.result;
    } catch (error) {
      console.error(`Error fetching foreigner with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới thông tin người nước ngoài
   * 
   * @param {Object} foreignerData Dữ liệu người nước ngoài cần tạo
   * @returns {Promise} Promise với kết quả thông tin người nước ngoài đã tạo
   */
  async create(foreignerData) {
    try {
      const response = await api.post('/api/services/app/Foreigners/Create', foreignerData);
      return response.result;
    } catch (error) {
      console.error('Error creating foreigner:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người nước ngoài
   * 
   * @param {Object} foreignerData Dữ liệu người nước ngoài cần cập nhật
   * @returns {Promise} Promise với kết quả thông tin người nước ngoài đã cập nhật
   */
  async update(foreignerData) {
    try {
      const response = await api.put('/api/services/app/Foreigners/Update', foreignerData);
      return response.result;
    } catch (error) {
      console.error(`Error updating foreigner with id ${foreignerData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa thông tin người nước ngoài theo ID
   * 
   * @param {number} id ID của người nước ngoài cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/Foreigners/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting foreigner with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa nhiều thông tin người nước ngoài
   * 
   * @param {Array} foreigners Danh sách người nước ngoài cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async deleteMultiple(foreigners) {
    try {
      const response = await api.deleteWithData('/api/services/app/Foreigners/DeleteMultiple', foreigners);
      return response.result;
    } catch (error) {
      console.error('Error deleting multiple foreigners:', error);
      throw error;
    }
  }
}

export default new ForeignersService(); 