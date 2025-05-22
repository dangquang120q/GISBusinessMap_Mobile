/**
 * Enum để định nghĩa các trạng thái phản ánh
 */
const BusinessFeedbackType = {
  /**
   * Phản ánh đang chờ xác minh
   */
  PENDING: 'pending',
  
  /**
   * Phản ánh đang được xử lý
   */
  PROCESSING: 'processing',
  
  /**
   * Phản ánh đã được xử lý
   */
  RESOLVED: 'resolved',
  
  /**
   * Lấy màu dựa trên trạng thái
   * @param {string} status Trạng thái của phản ánh
   * @returns {string} Mã màu tương ứng
   */
  getStatusColor: function(status) {
    switch (status) {
      case this.RESOLVED:
        return '#28a745';
      case this.PROCESSING:
        return '#ffc107';
      case this.PENDING:
        return '#dc3545';
      default:
        return '#6c757d';
    }
  },
  
  /**
   * Lấy text hiển thị dựa trên trạng thái
   * @param {string} status Trạng thái của phản ánh
   * @returns {string} Text hiển thị tương ứng
   */
  getStatusText: function(status) {
    switch (status) {
      case this.RESOLVED:
        return 'Đã xử lý';
      case this.PROCESSING:
        return 'Đang xử lý';
      case this.PENDING:
        return 'Chưa xác minh';
      default:
        return 'Không xác định';
    }
  },
  
  /**
   * Lấy icon dựa trên trạng thái
   * @param {string} status Trạng thái của phản ánh
   * @returns {string} Tên icon tương ứng
   */
  getStatusIcon: function(status) {
    switch (status) {
      case this.RESOLVED:
        return 'checkmark-circle';
      case this.PROCESSING:
        return 'time';
      case this.PENDING:
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }
};

export default BusinessFeedbackType; 