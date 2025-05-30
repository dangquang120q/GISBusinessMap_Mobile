import api from './api';

/**
 * Service để tương tác với API Business Branch
 */
class BusinessBranchService {
  /**
   * Lấy danh sách các cơ sở kinh doanh
   * 
   * @param {Object} params Tham số tìm kiếm
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.businessTypeId Loại cơ sở kinh doanh
   * @param {boolean} params.isActive Trạng thái hoạt động
   * @param {number} params.maxResultCount Số lượng kết quả tối đa
   * @param {number} params.skipCount Số lượng kết quả bỏ qua (phân trang)
   * @returns {Promise} Promise với kết quả danh sách cơ sở kinh doanh
   */
  async getList(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessBranches/GetAll', { params });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branches:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết cơ sở kinh doanh theo ID
   * 
   * @param {number} id ID của cơ sở kinh doanh
   * @returns {Promise} Promise với kết quả chi tiết cơ sở kinh doanh
   */
  async get(id) {
    try {
      const response = await api.get('/api/services/app/BusinessBranches/Get', { params: { Id: id } });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branch details:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách các cơ sở kinh doanh trong phạm vi bản đồ
   * 
   * @param {Object} bounds Ranh giới bản đồ
   * @param {Object} bounds.northEast Tọa độ góc đông bắc
   * @param {number} bounds.northEast.lat Vĩ độ góc đông bắc
   * @param {number} bounds.northEast.lng Kinh độ góc đông bắc
   * @param {Object} bounds.southWest Tọa độ góc tây nam
   * @param {number} bounds.southWest.lat Vĩ độ góc tây nam
   * @param {number} bounds.southWest.lng Kinh độ góc tây nam
   * @param {number} businessTypeId Loại cơ sở kinh doanh
   * @returns {Promise} Promise với kết quả danh sách cơ sở kinh doanh trong phạm vi
   */
  async getInBounds(bounds, businessTypeId) {
    try {
      const params = {
        minLat: bounds.southWest.lat,
        maxLat: bounds.northEast.lat,
        minLng: bounds.southWest.lng,
        maxLng: bounds.northEast.lng,
        businessTypeId: businessTypeId
      };
      
      const response = await api.get('/api/services/app/BusinessBranches/GetInBounds', { params });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branches in bounds:', error);
      throw error;
    }
  }

  /**
   * Tạo mới chi nhánh kinh doanh
   * 
   * @param {Object} branchData Dữ liệu chi nhánh kinh doanh cần tạo
   * @returns {Promise} Promise với kết quả chi nhánh kinh doanh đã tạo
   */
  async create(branchData) {
    try {
      const response = await api.post('/api/services/app/BusinessBranches/Create', branchData);
      return response.result;
    } catch (error) {
      console.error('Error creating business branch:', error);
      throw error;
    }
  }

  /**
   * Cập nhật chi nhánh kinh doanh
   * 
   * @param {Object} branchData Dữ liệu chi nhánh kinh doanh cần cập nhật
   * @returns {Promise} Promise với kết quả chi nhánh kinh doanh đã cập nhật
   */
  async update(branchData) {
    try {
      const response = await api.put('/api/services/app/BusinessBranches/Update', branchData);
      return response.result;
    } catch (error) {
      console.error(`Error updating business branch with id ${branchData.id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa chi nhánh kinh doanh theo ID
   * 
   * @param {number} id ID của chi nhánh cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    try {
      const response = await api.delete('/api/services/app/BusinessBranches/Delete', { params: { Id: id } });
      return response;
    } catch (error) {
      console.error(`Error deleting business branch with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa nhiều chi nhánh kinh doanh
   * 
   * @param {Array} branches Danh sách chi nhánh kinh doanh cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async deleteMultiple(branches) {
    try {
      const response = await api.deleteWithData('/api/services/app/BusinessBranches/DeleteMultiple', branches);
      return response.result;
    } catch (error) {
      console.error('Error deleting multiple business branches:', error);
      throw error;
    }
  }

  /**
   * Kích hoạt/vô hiệu hóa chi nhánh kinh doanh
   * 
   * @param {number} id ID của chi nhánh 
   * @param {boolean} isActive Trạng thái kích hoạt
   * @returns {Promise} Promise với kết quả thay đổi trạng thái
   */
  async changeStatus(id, isActive) {
    try {
      const response = await api.post('/api/services/app/BusinessBranches/ChangeStatus', null, {
        params: { id, isActive }
      });
      return response.result;
    } catch (error) {
      console.error(`Error changing status for business branch with id ${id}:`, error);
      throw error;
    }
  }
}

export default new BusinessBranchService(); 