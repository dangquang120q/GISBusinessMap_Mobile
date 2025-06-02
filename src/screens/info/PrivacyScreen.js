import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SessionService from '../../services/SessionService';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';

const PrivacyScreen = () => {
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceHistory: true,
    biometricLogin: false,
    autoLogout: true,
    autoLogoutTime: '30', // minutes
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const toggleSwitch = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handlePasswordChange = async () => {
    // Reset errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    let hasErrors = false;
    
    if (!passwordData.currentPassword) {
      setPasswordErrors(prev => ({...prev, currentPassword: 'Vui lòng nhập mật khẩu hiện tại'}));
      hasErrors = true;
    }

    if (!passwordData.newPassword) {
      setPasswordErrors(prev => ({...prev, newPassword: 'Vui lòng nhập mật khẩu mới'}));
      hasErrors = true;
    }

    if (!passwordData.confirmPassword) {
      setPasswordErrors(prev => ({...prev, confirmPassword: 'Vui lòng xác nhận mật khẩu mới'}));
      hasErrors = true;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors(prev => ({...prev, confirmPassword: 'Mật khẩu mới không khớp'}));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Call service to change password
      await SessionService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showSuccess('Mật khẩu đã được thay đổi');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.';
      
      if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        if (serverError.message) {
          errorMessage = `Lỗi: ${serverError.message}`;
        }
      }
      
      showError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    showConfirmation({
      title: 'Xóa tài khoản',
      message: 'Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Dữ liệu của bạn sẽ không thể khôi phục.',
      confirmText: 'Xóa tài khoản',
      cancelText: 'Hủy',
      isDestructive: true,
      onConfirm: () => {
        // Handle account deletion logic here
        showSuccess('Đã yêu cầu xóa tài khoản. Chúng tôi sẽ gửi email xác nhận để hoàn tất quy trình.');
      }
    });
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={24} color="#085924" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderToggleItem = (label, value, onToggle, description = null) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description && <Text style={styles.toggleDescription}>{description}</Text>}
      </View>
      <Switch
        trackColor={{ false: "#d1d1d1", true: "#eba6ef" }}
        thumbColor={value ? "#085924" : "#f4f3f4"}
        ios_backgroundColor="#d1d1d1"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo mật tài khoản</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {renderSectionHeader('Mật khẩu', 'lock-closed-outline')}
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="key-outline" size={22} color="#444" />
              <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.section}>
          {renderSectionHeader('Tự động đăng xuất', 'time-outline')}
          
          {renderToggleItem(
            'Tự động đăng xuất',
            settings.autoLogout,
            () => toggleSwitch('autoLogout'),
            'Tự động đăng xuất sau một thời gian không hoạt động'
          )}
          
          {settings.autoLogout && (
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Thời gian (phút):</Text>
              <TextInput
                style={styles.timeInput}
                value={settings.autoLogoutTime}
                onChangeText={(text) => setSettings({...settings, autoLogoutTime: text})}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          )}
        </View> */}
      </ScrollView>

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, passwordErrors.currentPassword ? styles.inputError : null]}
                placeholder="Mật khẩu hiện tại"
                secureTextEntry
                value={passwordData.currentPassword}
                onChangeText={(text) => {
                  setPasswordData({...passwordData, currentPassword: text});
                  if (text) setPasswordErrors({...passwordErrors, currentPassword: ''});
                }}
              />
              {passwordErrors.currentPassword ? (
                <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, passwordErrors.newPassword ? styles.inputError : null]}
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={passwordData.newPassword}
                onChangeText={(text) => {
                  setPasswordData({...passwordData, newPassword: text});
                  if (text) setPasswordErrors({...passwordErrors, newPassword: ''});
                }}
              />
              {passwordErrors.newPassword ? (
                <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, passwordErrors.confirmPassword ? styles.inputError : null]}
                placeholder="Xác nhận mật khẩu mới"
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={(text) => {
                  setPasswordData({...passwordData, confirmPassword: text});
                  if (text && text === passwordData.newPassword) 
                    setPasswordErrors({...passwordErrors, confirmPassword: ''});
                }}
              />
              {passwordErrors.confirmPassword ? (
                <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Đổi mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#085924',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#444',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 50,
    textAlign: 'center',
  },
  dangerButton: {
    borderColor: '#dc3545',
    borderWidth: 1,
    margin: 16,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  dangerButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalButton: {
    backgroundColor: '#085924',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacyScreen; 