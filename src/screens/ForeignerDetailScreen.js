import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ForeignerDetailScreen = ({route, navigation}) => {
  const { foreigner } = route.params || {
    id: '1',
    name: 'John Smith',
    passport: 'AB123456',
    nationality: 'Mỹ',
    status: 'Đang hoạt động',
    entryDate: '15/03/2023',
    expiryDate: '15/03/2024',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    workPosition: 'Giám đốc kỹ thuật',
    gender: 'Nam',
    birthDate: '15/05/1985',
    purpose: 'Công tác',
    notes: 'Đã được xác minh thông tin cá nhân.',
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditForeigner = () => {
    navigation.navigate('EditForeigner', { foreigner });
  };
  
  const handleDeleteForeigner = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Here you would typically call your API to delete the foreigner
    
    // Close the modal
    setShowDeleteModal(false);
    
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
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

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
          <Text style={styles.personName}>{foreigner.name}</Text>
          <View style={[styles.statusBadge, 
            foreigner.status === 'Đang hoạt động' ? styles.activeStatus : 
            foreigner.status === 'Chờ xác nhận' ? styles.pendingStatus : 
            styles.expiredStatus
          ]}>
            <Text style={styles.statusText}>{foreigner.status}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Hộ chiếu:</Text>
            <Text style={styles.infoValue}>{foreigner.passport}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Quốc tịch:</Text>
            <Text style={styles.infoValue}>{foreigner.nationality}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{foreigner.gender || 'Nam'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>{foreigner.birthDate || '15/05/1985'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mục đích:</Text>
            <Text style={styles.infoValue}>{foreigner.purpose || 'Công tác'}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày đến:</Text>
            <Text style={styles.infoValue}>{foreigner.entryDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
            <Text style={styles.infoValue}>{foreigner.expiryDate}</Text>
          </View>
          <View style={styles.warningContainer}>
            {new Date(foreigner.expiryDate.split('/').reverse().join('-')) < new Date() ? (
              <>
                <Ionicons name="warning" size={20} color="#dc3545" />
                <Text style={styles.warningText}>Đã hết hạn lưu trú</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                <Text style={styles.validText}>Đang trong thời gian lưu trú hợp lệ</Text>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Điện thoại:</Text>
            <Text style={styles.infoValue}>{foreigner.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{foreigner.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vị trí công việc:</Text>
            <Text style={styles.infoValue}>{foreigner.workPosition}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <Text style={styles.notesText}>
            {foreigner.notes || 'Đã được xác minh thông tin cá nhân.'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử đăng ký</Text>
          <View style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>15/03/2023</Text>
              <View style={styles.historyStatus}>
                <Text style={styles.historyStatusText}>Đăng ký mới</Text>
              </View>
            </View>
            <Text style={styles.historyDesc}>Đăng ký lần đầu với cơ sở kinh doanh</Text>
          </View>
          
          <View style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>20/06/2023</Text>
              <View style={styles.historyStatus}>
                <Text style={styles.historyStatusText}>Gia hạn</Text>
              </View>
            </View>
            <Text style={styles.historyDesc}>Gia hạn thêm 9 tháng lưu trú và làm việc</Text>
          </View>
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
              Bạn có chắc chắn muốn xóa {foreigner.name} khỏi danh sách? Thao tác này không thể hoàn tác.
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
              >
                <Text style={styles.modalDeleteButtonText}>Xóa</Text>
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
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  historyStatus: {
    backgroundColor: '#e0f2e9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 12,
    color: '#085924',
    fontWeight: '500',
  },
  historyDesc: {
    fontSize: 14,
    color: '#333',
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