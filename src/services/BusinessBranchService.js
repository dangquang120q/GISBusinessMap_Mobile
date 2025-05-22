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
   * @param {string} params.types Loại cơ sở kinh doanh (comma-separated: restaurant,hotel,shop)
   * @param {number} params.maxResultCount Số lượng kết quả tối đa
   * @param {number} params.skipCount Số lượng kết quả bỏ qua (phân trang)
   * @returns {Promise} Promise với kết quả danh sách cơ sở kinh doanh
   */
  async getList(params = {}) {
    try {
      const response = await api.get('/api/services/app/BusinessBranch/GetList', { params });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branches:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết cơ sở kinh doanh theo ID
   * 
   * @param {string} id ID của cơ sở kinh doanh
   * @returns {Promise} Promise với kết quả chi tiết cơ sở kinh doanh
   */
  async get(id) {
    try {
      const response = await api.get(`/api/services/app/BusinessBranch/Get?id=${id}`);
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
   * @param {string} types Loại cơ sở kinh doanh (comma-separated: restaurant,hotel,shop)
   * @returns {Promise} Promise với kết quả danh sách cơ sở kinh doanh trong phạm vi
   */
  async getInBounds(bounds, types) {
    try {
      const params = {
        northEastLat: bounds.northEast.lat,
        northEastLng: bounds.northEast.lng,
        southWestLat: bounds.southWest.lat,
        southWestLng: bounds.southWest.lng,
        types: types
      };
      
      const response = await api.get('/api/services/app/BusinessBranch/GetInBounds', { params });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branches in bounds:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả chi nhánh kinh doanh với các bộ lọc
   * 
   * @param {Object} params Các tham số lọc và phân trang
   * @param {string} params.keyword Từ khóa tìm kiếm
   * @param {string} params.sorting Cách sắp xếp
   * @param {string} params.businessCode Mã doanh nghiệp
   * @param {string} params.organizationName Tên tổ chức
   * @param {string} params.branchName Tên chi nhánh
   * @param {string} params.districtName Tên quận/huyện
   * @param {string} params.wardName Tên phường/xã
   * @param {boolean} params.isGetTotalCount Có lấy tổng số bản ghi không
   * @param {number} params.skipCount Số bản ghi bỏ qua
   * @param {number} params.maxResultCount Số bản ghi tối đa
   * @param {AbortSignal} signal Signal để hủy request
   * @returns {Promise} Promise với kết quả danh sách chi nhánh kinh doanh
   */
  async getAll(params = {}, signal) {
    try {
      const response = await api.get('/api/services/app/BusinessBranches/GetAll', { 
        params,
        signal
      });
      return response.result;
    } catch (error) {
      console.error('Error fetching business branches:', error);
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
   * Tính điểm đánh giá trung bình cho một chi nhánh
   * 
   * @param {number} branchId ID của chi nhánh
   * @returns {Promise} Promise với kết quả điểm đánh giá trung bình
   */
  async calculateAverageRating(branchId) {
    try {
      const response = await api.post('/api/services/app/BusinessBranches/CalculateAverageRating', null, {
        params: { branchId }
      });
      return response.result;
    } catch (error) {
      console.error(`Error calculating average rating for branch id ${branchId}:`, error);
      throw error;
    }
  }
}

export default new BusinessBranchService(); 