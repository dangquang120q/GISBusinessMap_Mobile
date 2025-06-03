/**
 * Enum để định nghĩa các trạng thái phản ánh
 */
const BusinessFeedbackType = {
  /**
   * Phản ánh đang chờ xác minh
   */
  PENDING: 'P',
  
  /**
   * Phản ánh đã xác minh
   */
  APPROVED: 'A',
  
  /**
   * Phản ánh đang được xử lý
   */
  PROCESSING: 'I',
  
  /**
   * Phản ánh đã phản hồi
   */
  REPLIED: 'R',
  
  /**
   * Phản ánh đã đóng
   */
  CLOSED: 'C',
  
  /**
   * Lấy màu dựa trên trạng thái
   * @param {string} status Trạng thái của phản ánh
   * @returns {string} Mã màu tương ứng
   */
  getStatusColor: function(status) {
    switch (status) {
      case this.CLOSED:
        return '#28a745'; // xanh lá
      case this.REPLIED:
        return '#17a2b8'; // xanh dương
      case this.PROCESSING:
        return '#ffc107'; // vàng
      case this.APPROVED:
        return '#6f42c1'; // tím
      case this.PENDING:
        return '#dc3545'; // đỏ
      default:
        return '#6c757d'; // xám
    }
  },
  
  /**
   * Lấy text hiển thị dựa trên trạng thái
   * @param {string} status Trạng thái của phản ánh
   * @returns {string} Text hiển thị tương ứng
   */
  getStatusText: function(status) {
    switch (status) {
      case this.CLOSED:
        return 'Đã đóng';
      case this.REPLIED:
        return 'Đã phản hồi';
      case this.PROCESSING:
        return 'Đang xử lý';
      case this.APPROVED:
        return 'Đã xác minh';
      case this.PENDING:
        return 'Chờ xác minh';
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
      case this.CLOSED:
        return 'checkmark-circle';
      case this.REPLIED:
        return 'chatbox-ellipses';
      case this.PROCESSING:
        return 'time';
      case this.APPROVED:
        return 'checkmark';
      case this.PENDING:
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }
};

export default BusinessFeedbackType; 