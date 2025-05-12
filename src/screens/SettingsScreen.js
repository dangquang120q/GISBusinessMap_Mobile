import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const SettingsScreen = () => {
  const {logout} = useContext(AuthContext);
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
    Alert.alert(
      'Cấp quyền thông báo',
      'Ứng dụng cần quyền gửi thông báo để thông báo cho bạn về các hoạt động mới.',
      [
        { 
          text: 'Để sau', 
          style: 'cancel' 
        },
        { 
          text: 'Mở cài đặt', 
          onPress: () => {
            // Mở cài đặt của thiết bị
            setNotificationPermissionStatus('granted');
            setNotifications(true);
          } 
        }
      ]
    );
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
        <Ionicons name={icon} size={24} color="#AD40AF" />
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

  const goToHelpCenter = () => {
    // Điều hướng đến trang trung tâm trợ giúp
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
  };

  const goToAbout = () => {
    // Điều hướng đến trang giới thiệu
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
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
        <Text style={styles.sectionTitle}>Tùy chọn</Text>
        {renderSettingItem(
          'notifications-outline',
          'Thông báo',
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{false: '#767577', true: '#AD40AF'}}
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
          'moon-outline',
          'Chế độ tối',
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{false: '#767577', true: '#AD40AF'}}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />,
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        {renderSettingItem(
          'person-outline',
          'Thông tin tài khoản',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToEditProfile
        )}
        {renderSettingItem(
          'lock-closed-outline',
          'Quyền riêng tư & Bảo mật',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToPrivacySettings
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        {renderSettingItem(
          'help-circle-outline',
          'Trung tâm trợ giúp',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToHelpCenter
        )}
        {renderSettingItem(
          'information-circle-outline',
          'Giới thiệu',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
          goToAbout
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
    color: '#AD40AF',
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