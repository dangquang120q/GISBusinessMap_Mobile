import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EmergencyScreen = ({ onClose }) => {
  // State cho các modal SOS
  const [isSOSConfirmModalVisible, setIsSOSConfirmModalVisible] = useState(false);
  const [isSOSSuccessModalVisible, setIsSOSSuccessModalVisible] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null);
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);

  // Danh sách các loại khẩn cấp
  const emergencyTypes = [
    { id: 1, title: 'Tai nạn giao thông', icon: 'information-circle' },
    { id: 2, title: 'Hỏa hoạn, cháy nổ', icon: 'flame' },
    { id: 3, title: 'An ninh trật tự', icon: 'shield' },
    { id: 4, title: 'Trộm cắp, cướp giật', icon: 'warning' },
  ];

  // Xử lý khi chọn loại khẩn cấp
  const handleEmergencyTypeSelect = (type) => {
    setSelectedEmergencyType(type);
    setIsConfirmChecked(false); // Reset checkbox when opening confirmation modal
    setIsSOSConfirmModalVisible(true);
  };

  // Xử lý khi xác nhận gửi SOS
  const handleSOSConfirm = () => {
    setIsSOSConfirmModalVisible(false);
    // Gửi thông tin SOS đến API (trong ứng dụng thực tế)
    // sendSOSAlert(selectedEmergencyType);
    
    // Hiển thị thông báo thành công
    setIsSOSSuccessModalVisible(true);
  };

  // Xử lý khi tick vào checkbox xác nhận
  const toggleConfirmCheckbox = () => {
    setIsConfirmChecked(!isConfirmChecked);
  };

  return (
    <>
      {/* Main Emergency Type Selection */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>NGUY HIỂM - CẦN HỖ TRỢ</Text>
            {onClose && (
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn gửi tín hiệu khẩn cấp?
            </Text>
            <Text style={styles.modalSubText}>
              Hãy chọn nội dung cần hỗ trợ
            </Text>
            
            {emergencyTypes.map((type) => (
              <TouchableOpacity 
                key={type.id}
                style={styles.emergencyTypeButton}
                onPress={() => handleEmergencyTypeSelect(type)}
              >
                <Ionicons name={type.icon} size={24} color="#d32f2f" />
                <Text style={styles.emergencyTypeText}>{type.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {onClose && (
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal xác nhận gửi SOS */}
      <Modal
        visible={isSOSConfirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSOSConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NGUY HIỂM - CẦN HỖ TRỢ</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Xác nhận gửi tín hiệu SOS để kích hoạt đội ngũ cứu hộ ngay lập tức
              </Text>
              
              <Text style={styles.modalWarningText}>
                Việc gửi tín hiệu SOS sẽ lập tức kích hoạt quy trình phản ứng khẩn cấp của các lực lượng cứu trợ. Chỉ sử dụng trong trường hợp thực sự nguy hiểm và cần hỗ trợ ngay. Gửi nhầm hoặc lạm dụng tín hiệu SOS có thể gây ảnh hưởng nghiêm trọng đến công tác cứu hộ, làm lãng phí tài nguyên và có thể bị xử lý theo quy định pháp luật!
              </Text>
              
              <Text style={[styles.modalText, {fontWeight: 'bold', marginTop: 10}]}>
                Bạn có chắc chắn muốn tiếp tục gửi yêu cầu cấp cứu?
              </Text>
              
              {/* Checkbox xác nhận */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={toggleConfirmCheckbox}
              >
                <View style={[styles.checkbox, isConfirmChecked && styles.checkboxChecked]}>
                  {isConfirmChecked && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  Tôi đồng ý với các điều khoản trên và xác nhận đây là trường hợp khẩn cấp thực sự
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setIsSOSConfirmModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalConfirmButton, 
                  !isConfirmChecked && styles.modalConfirmButtonDisabled
                ]}
                onPress={handleSOSConfirm}
                disabled={!isConfirmChecked}
              >
                <Text style={[
                  styles.modalConfirmButtonText,
                  !isConfirmChecked && styles.modalConfirmButtonTextDisabled
                ]}>
                  Gửi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thông báo gửi SOS thành công */}
      <Modal
        visible={isSOSSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSOSSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>THÔNG BÁO</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" style={styles.successIcon} />
              
              <Text style={[styles.modalText, {fontWeight: 'bold'}]}>
                Bạn vừa gửi tín hiệu khẩn cấp thành công!
              </Text>
              
              <Text style={styles.modalText}>
                Hãy giữ liên lạc, đơn vị chức năng sẽ liên hệ hỗ trợ trong thời gian sớm nhất!
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => {
                setIsSOSSuccessModalVisible(false);
                if (onClose) onClose();
              }}
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.85,
    maxHeight: '80%',
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalWarningText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff9c4',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  emergencyTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emergencyTypeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 15,
    paddingVertical: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d32f2f',
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#d32f2f',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmButtonTextDisabled: {
    color: '#9e9e9e',
  },
  modalCloseButton: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
});

export default EmergencyScreen; 