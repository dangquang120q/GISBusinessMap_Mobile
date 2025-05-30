import api from './api';

/**
 * Service để tương tác với API Business Branch
 */
class BusinessBranchService {
  /**
   * Xử lý lỗi API chung
   * 
   * @param {Error} error Lỗi từ API
   * @param {string} defaultMessage Thông báo mặc định
   * @returns {Error} Lỗi đã được xử lý
   */
  handleApiError(error, defaultMessage) {
    console.error(defaultMessage, error);
    
    // Nếu có response từ server
    if (error.response) {
      // Lấy thông tin lỗi từ response data
      if (error.response.data) {
        if (error.response.data.error && error.response.data.error.message) {
          error.userMessage = error.response.data.error.message;
        } else if (typeof error.response.data === 'string') {
          error.userMessage = error.response.data;
        }
      }
      
      // Thêm mã lỗi HTTP
      error.statusCode = error.response.status;
    }
    
    // Nếu không có thông báo cụ thể, sử dụng thông báo mặc định
    if (!error.userMessage) {
      error.userMessage = defaultMessage;
    }
    
    return error;
  }

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
  async getAll(params = {}) {
    try {
      // Đảm bảo businessTypeId là chuỗi nếu tồn tại
      if (params.businessTypeId !== undefined && params.businessTypeId !== null) {
        params.businessTypeId = String(params.businessTypeId);
      }
      
      const response = await api.get('/api/services/app/BusinessBranches/GetAll', { params });
      return response.result || { items: [] }; // Đảm bảo luôn trả về cấu trúc hợp lệ
    } catch (error) {
      throw this.handleApiError(error, 'Lỗi khi lấy danh sách cơ sở kinh doanh');
    }
  }

  /**
   * Lấy danh sách cơ sở kinh doanh (alias của getAll)
   * 
   * @param {Object} params Tham số tìm kiếm 
   * @returns {Promise} Promise với kết quả danh sách
   */
  async getList(params = {}) {
    return this.getAll(params);
  }

  /**
   * Lấy chi tiết cơ sở kinh doanh theo ID
   * 
   * @param {number|string} id ID của cơ sở kinh doanh
   * @returns {Promise} Promise với kết quả chi tiết cơ sở kinh doanh
   */
  async get(id) {
    if (!id) {
      const error = new Error('ID cơ sở kinh doanh không được để trống');
      error.userMessage = 'ID cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    try {
      // Đảm bảo ID luôn là chuỗi
      const safeId = String(id);
      
      const response = await api.get('/api/services/app/BusinessBranches/Get', { params: { Id: safeId } });
      if (!response || !response.result) {
        throw new Error('Không tìm thấy cơ sở kinh doanh');
      }
      return response.result;
    } catch (error) {
      throw this.handleApiError(error, `Lỗi khi lấy thông tin cơ sở kinh doanh (ID: ${id})`);
    }
  }

  /**
   * Lấy danh sách các cơ sở kinh doanh trong phạm vi bản đồ
   * 
   * @param {Object} bounds Ranh giới bản đồ hoặc null để lấy tất cả
   * @param {Object} bounds.northEast Tọa độ góc đông bắc
   * @param {number} bounds.northEast.lat Vĩ độ góc đông bắc
   * @param {number} bounds.northEast.lng Kinh độ góc đông bắc
   * @param {Object} bounds.southWest Tọa độ góc tây nam
   * @param {number} bounds.southWest.lat Vĩ độ góc tây nam
   * @param {number} bounds.southWest.lng Kinh độ góc tây nam
   * @param {number|string} businessTypeId Loại cơ sở kinh doanh
   * @returns {Promise} Promise với kết quả danh sách cơ sở kinh doanh trong phạm vi
   */
  async getInBounds(bounds, businessTypeId) {
    try {
      const params = {};
      
      // Chỉ thêm tọa độ ranh giới nếu bounds hợp lệ
      if (bounds && bounds.northEast && bounds.southWest && 
          bounds.northEast.lat !== undefined && bounds.northEast.lng !== undefined &&
          bounds.southWest.lat !== undefined && bounds.southWest.lng !== undefined) {
        params.minLat = bounds.southWest.lat;
        params.maxLat = bounds.northEast.lat;
        params.minLng = bounds.southWest.lng;
        params.maxLng = bounds.northEast.lng;
      }
      
      // Thêm businessTypeId nếu có và đảm bảo là chuỗi
      if (businessTypeId !== undefined && businessTypeId !== null) {
        params.businessTypeId = String(businessTypeId);
      }
      
      const response = await api.get('/api/services/app/BusinessBranches/GetInBounds', { params });
      return response.result || []; // Đảm bảo luôn trả về mảng
    } catch (error) {
      throw this.handleApiError(error, 'Lỗi khi lấy danh sách cơ sở kinh doanh trong khu vực');
    }
  }

  /**
   * Tạo mới chi nhánh kinh doanh
   * 
   * @param {Object} branchData Dữ liệu chi nhánh kinh doanh cần tạo
   * @returns {Promise} Promise với kết quả chi nhánh kinh doanh đã tạo
   */
  async create(branchData) {
    if (!branchData) {
      const error = new Error('Thiếu dữ liệu cơ sở kinh doanh');
      error.userMessage = 'Thiếu dữ liệu cơ sở kinh doanh';
      throw error;
    }
    
    // Validate các trường bắt buộc
    if (!branchData.branchName) {
      const error = new Error('Tên cơ sở kinh doanh không được để trống');
      error.userMessage = 'Tên cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    try {
      // Đảm bảo businessTypeId là chuỗi nếu tồn tại
      if (branchData.businessTypeId !== undefined && branchData.businessTypeId !== null) {
        branchData.businessTypeId = String(branchData.businessTypeId);
      }
      
      const response = await api.post('/api/services/app/BusinessBranches/Create', branchData);
      return response.result;
    } catch (error) {
      throw this.handleApiError(error, 'Lỗi khi tạo cơ sở kinh doanh mới');
    }
  }

  /**
   * Cập nhật chi nhánh kinh doanh
   * 
   * @param {Object} branchData Dữ liệu chi nhánh kinh doanh cần cập nhật
   * @returns {Promise} Promise với kết quả chi nhánh kinh doanh đã cập nhật
   */
  async update(branchData) {
    if (!branchData) {
      const error = new Error('Thiếu dữ liệu cơ sở kinh doanh');
      error.userMessage = 'Thiếu dữ liệu cơ sở kinh doanh';
      throw error;
    }
    
    // Validate các trường bắt buộc
    if (!branchData.id) {
      const error = new Error('ID cơ sở kinh doanh không được để trống');
      error.userMessage = 'ID cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    if (!branchData.branchName) {
      const error = new Error('Tên cơ sở kinh doanh không được để trống');
      error.userMessage = 'Tên cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    try {
      // Đảm bảo ID và businessTypeId là chuỗi
      if (branchData.id !== undefined && branchData.id !== null) {
        branchData.id = String(branchData.id);
      }
      
      if (branchData.businessTypeId !== undefined && branchData.businessTypeId !== null) {
        branchData.businessTypeId = String(branchData.businessTypeId);
      }
      
      const response = await api.put('/api/services/app/BusinessBranches/Update', branchData);
      return response.result;
    } catch (error) {
      throw this.handleApiError(error, `Lỗi khi cập nhật cơ sở kinh doanh (ID: ${branchData.id})`);
    }
  }

  /**
   * Xóa chi nhánh kinh doanh theo ID
   * 
   * @param {number|string} id ID của chi nhánh cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async delete(id) {
    if (!id) {
      const error = new Error('ID cơ sở kinh doanh không được để trống');
      error.userMessage = 'ID cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    try {
      // Đảm bảo ID luôn là chuỗi
      const safeId = String(id);
      
      const response = await api.delete('/api/services/app/BusinessBranches/Delete', { params: { Id: safeId } });
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Lỗi khi xóa cơ sở kinh doanh (ID: ${id})`);
    }
  }

  /**
   * Xóa nhiều chi nhánh kinh doanh
   * 
   * @param {Array} branches Danh sách chi nhánh kinh doanh cần xóa
   * @returns {Promise} Promise với kết quả xóa
   */
  async deleteMultiple(branches) {
    if (!branches || !Array.isArray(branches) || branches.length === 0) {
      const error = new Error('Danh sách cơ sở kinh doanh cần xóa không hợp lệ');
      error.userMessage = 'Danh sách cơ sở kinh doanh cần xóa không hợp lệ';
      throw error;
    }
    
    try {
      // Đảm bảo tất cả các ID đều là chuỗi
      const safeBranches = branches.map(branch => {
        if (typeof branch === 'object' && branch !== null) {
          return {
            ...branch,
            id: branch.id !== undefined ? String(branch.id) : branch.id
          };
        }
        return branch;
      });
      
      const response = await api.deleteWithData('/api/services/app/BusinessBranches/DeleteMultiple', safeBranches);
      return response.result;
    } catch (error) {
      throw this.handleApiError(error, 'Lỗi khi xóa nhiều cơ sở kinh doanh');
    }
  }

  /**
   * Kích hoạt/vô hiệu hóa chi nhánh kinh doanh
   * 
   * @param {number|string} id ID của chi nhánh 
   * @param {boolean} isActive Trạng thái kích hoạt
   * @returns {Promise} Promise với kết quả thay đổi trạng thái
   */
  async changeStatus(id, isActive) {
    if (!id) {
      const error = new Error('ID cơ sở kinh doanh không được để trống');
      error.userMessage = 'ID cơ sở kinh doanh không được để trống';
      throw error;
    }
    
    if (isActive === undefined || isActive === null) {
      const error = new Error('Trạng thái hoạt động không được để trống');
      error.userMessage = 'Trạng thái hoạt động không được để trống';
      throw error;
    }
    
    try {
      // Đảm bảo ID luôn là chuỗi
      const safeId = String(id);
      
      const response = await api.post('/api/services/app/BusinessBranches/ChangeStatus', null, {
        params: { id: safeId, isActive }
      });
      return response.result;
    } catch (error) {
      throw this.handleApiError(error, `Lỗi khi thay đổi trạng thái cơ sở kinh doanh (ID: ${id})`);
    }
  }
}

export default new BusinessBranchService(); 