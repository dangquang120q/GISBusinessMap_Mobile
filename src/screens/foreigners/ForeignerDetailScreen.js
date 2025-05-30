import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ForeignersService from '../../services/ForeignersService';

const ForeignerDetailScreen = ({route, navigation}) => {
  const { foreignerId } = route.params || {};
  const [foreigner, setForeigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Status constants
  const STATUS_ACTIVE = 'Đang hoạt động';
  const STATUS_PENDING = 'Chờ xác nhận';
  const STATUS_EXPIRED = 'Hết hạn';

  // Function to format date from API
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Check if visa or residence card is expired
  const checkIfExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  // Get status display based on data
  const getStatusDisplay = (foreigner) => {
    if (foreigner.status) return foreigner.status;
    
    // Fallback logic if status is not set
    if (checkIfExpired(foreigner.visaExpiryDate) || 
        checkIfExpired(foreigner.workPermitExpiryDate) || 
        checkIfExpired(foreigner.residenceCardExpiry)) {
      return STATUS_EXPIRED;
    }
    
    return STATUS_ACTIVE;
  };

  // Get status style
  const getStatusStyle = (status) => {
    switch(status) {
      case STATUS_ACTIVE:
        return styles.activeStatus;
      case STATUS_PENDING:
        return styles.pendingStatus;
      case STATUS_EXPIRED:
        return styles.expiredStatus;
      default:
        return styles.activeStatus;
    }
  };

  // Load foreigner details on screen load
  useEffect(() => {
    const fetchForeignerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If we have an ID, fetch from API
        if (foreignerId) {
          const response = await ForeignersService.get(foreignerId);
          setForeigner(response);
        } else if (route.params?.foreigner) {
          // Fallback to the passed foreigner object if no ID
          setForeigner(route.params.foreigner);
        } else {
          throw new Error('Không có thông tin người nước ngoài');
        }
      } catch (err) {
        console.error('Error fetching foreigner details:', err);
        setError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
        Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchForeignerDetails();
  }, [foreignerId, route.params]);

  const handleEditForeigner = () => {
    navigation.navigate('EditForeigner', { foreigner, foreignerId: foreigner.id });
  };
  
  const handleDeleteForeigner = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await ForeignersService.delete(foreigner.id);
      
      // Close the modal
      setShowDeleteModal(false);
      setLoading(false);
      
      // Show success message
      Alert.alert(
        'Thành công',
        'Đã xóa người nước ngoài khỏi danh sách',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ForeignerManagement'),
          },
        ]
      );
    } catch (err) {
      console.error('Error deleting foreigner:', err);
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể xóa người nước ngoài. Vui lòng thử lại sau.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  if (error || !foreigner) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin người nước ngoài'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const status = getStatusDisplay(foreigner);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết người nước ngoài</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.personHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#085924" />
          </View>
          <Text style={styles.personName}>{foreigner.fullName}</Text>
          <View style={[styles.statusBadge, getStatusStyle(status)]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Hộ chiếu:</Text>
            <Text style={styles.infoValue}>{foreigner.passportNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Quốc tịch:</Text>
            <Text style={styles.infoValue}>{foreigner.countryName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{foreigner.gender || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>{foreigner.dateOfBirth ? formatDate(foreigner.dateOfBirth) : '-'}</Text>
          </View>
          {foreigner.jobTitle && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vị trí công việc:</Text>
              <Text style={styles.infoValue}>{foreigner.jobTitle}</Text>
            </View>
          )}
          {foreigner.workplace && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nơi làm việc:</Text>
              <Text style={styles.infoValue}>{foreigner.workplace}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thị thực</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số visa:</Text>
            <Text style={styles.infoValue}>{foreigner.visaNumber || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loại visa:</Text>
            <Text style={styles.infoValue}>{foreigner.visaType || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày cấp:</Text>
            <Text style={styles.infoValue}>
              {foreigner.visaIssuedDate ? formatDate(foreigner.visaIssuedDate) : '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
            <Text style={styles.infoValue}>
              {foreigner.visaExpiryDate ? formatDate(foreigner.visaExpiryDate) : '-'}
            </Text>
          </View>
          <View style={styles.warningContainer}>
            {foreigner.visaExpiryDate && checkIfExpired(foreigner.visaExpiryDate) ? (
              <>
                <Ionicons name="warning" size={20} color="#dc3545" />
                <Text style={styles.warningText}>Thị thực đã hết hạn</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                <Text style={styles.validText}>Thị thực còn hiệu lực</Text>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin nhập cảnh</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày nhập cảnh:</Text>
            <Text style={styles.infoValue}>
              {foreigner.entryDate ? formatDate(foreigner.entryDate) : '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cửa khẩu:</Text>
            <Text style={styles.infoValue}>{foreigner.entryPort || '-'}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Điện thoại:</Text>
            <Text style={styles.infoValue}>{foreigner.phoneNumber || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{foreigner.email || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Địa chỉ lưu trú:</Text>
            <Text style={styles.infoValue}>{foreigner.stayAddress || '-'}</Text>
          </View>
        </View>
        
        {foreigner.workPermitNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giấy phép lao động</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số giấy phép:</Text>
              <Text style={styles.infoValue}>{foreigner.workPermitNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
              <Text style={styles.infoValue}>
                {foreigner.workPermitExpiryDate ? formatDate(foreigner.workPermitExpiryDate) : '-'}
              </Text>
            </View>
            <View style={styles.warningContainer}>
              {foreigner.workPermitExpiryDate && checkIfExpired(foreigner.workPermitExpiryDate) ? (
                <>
                  <Ionicons name="warning" size={20} color="#dc3545" />
                  <Text style={styles.warningText}>Giấy phép lao động đã hết hạn</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                  <Text style={styles.validText}>Giấy phép lao động còn hiệu lực</Text>
                </>
              )}
            </View>
          </View>
        )}
        
        {foreigner.residenceCardNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thẻ tạm trú</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số thẻ:</Text>
              <Text style={styles.infoValue}>{foreigner.residenceCardNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
              <Text style={styles.infoValue}>
                {foreigner.residenceCardExpiry ? formatDate(foreigner.residenceCardExpiry) : '-'}
              </Text>
            </View>
            <View style={styles.warningContainer}>
              {foreigner.residenceCardExpiry && checkIfExpired(foreigner.residenceCardExpiry) ? (
                <>
                  <Ionicons name="warning" size={20} color="#dc3545" />
                  <Text style={styles.warningText}>Thẻ tạm trú đã hết hạn</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                  <Text style={styles.validText}>Thẻ tạm trú còn hiệu lực</Text>
                </>
              )}
            </View>
          </View>
        )}
        
        {foreigner.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <Text style={styles.notesText}>{foreigner.notes}</Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đăng ký</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày tạo:</Text>
            <Text style={styles.infoValue}>{formatDate(foreigner.createdDate)}</Text>
          </View>
          {foreigner.updatedDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cập nhật lần cuối:</Text>
              <Text style={styles.infoValue}>{formatDate(foreigner.updatedDate)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditForeigner}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteForeigner}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Xóa người nước ngoài</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={28} color="#dc3545" />
              <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa {foreigner.fullName} khỏi danh sách? Thao tác này không thể hoàn tác.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.modalCancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Xóa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#085924',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#085924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  personHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  personName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 5,
  },
  activeStatus: {
    backgroundColor: '#d4edda',
  },
  pendingStatus: {
    backgroundColor: '#fff3cd',
  },
  expiredStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    width: '40%',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    color: '#dc3545',
    marginLeft: 8,
    fontWeight: '500',
  },
  validText: {
    color: '#28a745',
    marginLeft: 8,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalDeleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  modalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForeignerDetailScreen; 