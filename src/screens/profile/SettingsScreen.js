import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { showConfirmation } from '../../utils/PopupUtils';

const SettingsScreen = () => {
  const {logout, userRole} = useContext(AuthContext);
  const isBusiness = userRole === '2' || userRole === 2;
  const navigation = useNavigation();
  
  // Trạng thái cài đặt
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('granted');

  useEffect(() => {
    // Trong ứng dụng thực tế, kiểm tra trạng thái quyền thông báo hiện tại
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    // Giả lập kiểm tra quyền thông báo
    // Trong ứng dụng thực tế, sử dụng thư viện như react-native-permissions
    // hoặc API của từng nền tảng (iOS, Android)
    
    // Mô phỏng kiểm tra quyền
    setNotificationPermissionStatus('granted'); // hoặc 'denied', 'blocked'
  };

  const requestNotificationPermission = async () => {
    // Trong ứng dụng thực tế, yêu cầu cấp quyền thông báo
    showConfirmation({
      title: 'Cấp quyền thông báo',
      message: 'Ứng dụng cần quyền gửi thông báo để thông báo cho bạn về các hoạt động mới.',
      cancelText: 'Để sau',
      confirmText: 'Mở cài đặt',
      onConfirm: () => {
        // Mở cài đặt của thiết bị
        setNotificationPermissionStatus('granted');
        setNotifications(true);
      }
    });
  };

  const toggleNotifications = (value) => {
    if (value && notificationPermissionStatus !== 'granted') {
      requestNotificationPermission();
    } else {
      setNotifications(value);
    }
  };

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    // Trong ứng dụng thực tế, cập nhật theme của ứng dụng
    // updateAppTheme(value ? 'dark' : 'light');
  };

  const renderSettingItem = (icon, title, rightElement, onPress = null) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#085924" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const goToEditProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  const goToPrivacySettings = () => {
    navigation.navigate('PrivacyScreen');
  };

  const goToPrivacy = () => {
    navigation.navigate('PrivacyPolicyScreen');
  };

  const goToTermsOfUse = () => {
    navigation.navigate('TermOfUseScreen');
  };

  const goToVersion = () => {
    navigation.navigate('VersionScreen');
  };

  const goToRate = () => {
    navigation.navigate('RateScreen');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản và bảo mật</Text>
        {renderSettingItem(
          isBusiness ? 'business-outline' : 'person-outline',
          isBusiness ? 'Thông tin doanh nghiệp' : 'Thông tin tài khoản',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToEditProfile
        )}
        {renderSettingItem(
          'lock-closed-outline',
          'Bảo mật',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToPrivacySettings
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ứng dụng</Text>
        {renderSettingItem(
          'notifications-outline',
          'Thông báo',
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{false: '#767577', true: '#085924'}}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />,
        )}
        
        {notificationPermissionStatus !== 'granted' && notifications && (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning-outline" size={18} color="#FFA500" />
            <Text style={styles.permissionWarningText}>
              Chưa cấp quyền thông báo. 
              <Text style={styles.permissionActionText} onPress={requestNotificationPermission}>
                {' '}Cấp quyền ngay
              </Text>
            </Text>
          </View>
        )}
        {renderSettingItem(
          'lock-closed-outline',
          'Chính sách quyền riêng tư',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToPrivacy
        )}
        {renderSettingItem(
          'information-circle-outline',
          'Điều khoản sử dụng',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToTermsOfUse
        )}
        {renderSettingItem(
          'apps-outline',
          'Phiên bản ứng dụng',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToVersion
        )}
        {renderSettingItem(
          'thumbs-up-outline',
          'Đánh giá ứng dụng',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToRate
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
    marginTop: -5,
    marginBottom: 10,
  },
  permissionWarningText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  permissionActionText: {
    color: '#085924',
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;