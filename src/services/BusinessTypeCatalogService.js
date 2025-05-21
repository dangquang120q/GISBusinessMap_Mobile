import api from './api';

/**
 * Service để tương tác với API BusinessTypeCatalog
 */
class BusinessTypeCatalogService {
  /**
   * Lấy danh sách tất cả loại doanh nghiệp với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {string} params.businessTypeName Tên loại doanh nghiệp
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @returns {Promise} Promise với kết quả danh sách loại doanh nghiệp
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessTypeCatalog/GetAll', params);
      return response.result;
    } catch (error) {
      console.error('Error fetching business type catalog:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn giản tất cả loại doanh nghiệp
   * 
   * @returns {Promise} Promise với kết quả danh sách loại doanh nghiệp
   */
  async getList() {
    try {
      const response = await api.get('/api/services/app/BusinessTypeCatalog/GetList');
      return response.result;
    } catch (error) {
      console.error('Error fetching business type catalog list:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin một loại doanh nghiệp theo ID
   * 
   * @param {number} id ID của loại doanh nghiệp
   * @returns {Promise} Promise với kết quả loại doanh nghiệp
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/BusinessTypeCatalog/Get', { Id: id });
      return response.result;
    } catch (error) {
      console.error(`Error fetching business type catalog with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới loại doanh nghiệp
   * 
   * @param {Object} typeData Dữ liệu loại doanh nghiệp cần tạo
   * @returns {Promise} Promise với kết quả loại doanh nghiệp đã tạo
   */
  async create(typeData) {
    try {
      const response = await api.post('/api/services/app/BusinessTypeCatalog/Create', typeData);
      return response.result;
    } catch (error) {
      console.error('Error creating business type catalog:', error);
      throw error;
    }
  }

  /**
   * Cập nhật loại doanh nghiệp
   * 
   * @param {Object} typeData Dữ liệu loại doanh nghiệp cần cập nhật
   * @returns {Promise} Promise với kết quả loại doanh nghiệp đã cập nhật
   */
  async update(typeData) {
    try {
      const response = await api.put('/api/services/app/BusinessTypeCatalog/Update', typeData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business type catalog with id ${typeData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa loại doanh nghiệp theo ID
   * 
   * @param {number} id ID của loại doanh nghiệp cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/BusinessTypeCatalog/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting business type catalog with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa nhiều loại doanh nghiệp
   * 
   * @param {Array} types Danh sách loại doanh nghiệp cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async deleteMultiple(types) {
    try {
      const response = await api.deleteWithData('/api/services/app/BusinessTypeCatalog/DeleteMultiple', types);
      return response.result;
    } catch (error) {
      console.error('Error deleting multiple business type catalogs:', error);
      throw error;
    }
  }
}

export default new BusinessTypeCatalogService(); 