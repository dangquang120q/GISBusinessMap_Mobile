import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PrivacyScreen = () => {
  const navigation = useNavigation();
  
  // Sample privacy settings - replace with actual data from your API/storage
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // 'public', 'friends', 'private'
    locationSharing: true,
    reviewsVisible: true,
    dataCollection: {
      appActivity: true,
      locationHistory: true,
      searchHistory: true,
      personalizedAds: false,
    },
    accountActivity: {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceHistory: true,
    }
  });

  const toggleSwitch = (category, subcategory = null) => {
    if (subcategory) {
      // Toggle a subcategory
      setSettings({
        ...settings,
        [category]: {
          ...settings[category],
          [subcategory]: !settings[category][subcategory]
        }
      });
    } else {
      // Toggle a main category
      setSettings({
        ...settings,
        [category]: !settings[category]
      });
    }
  };

  const setProfileVisibility = (value) => {
    setSettings({
      ...settings,
      profileVisibility: value
    });
  };

  const handleSave = () => {
    // Here you would make an API call to save privacy settings
    // For example: savePrivacySettings(settings);
    
    Alert.alert(
      'Thành công',
      'Cài đặt quyền riêng tư đã được lưu',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Dữ liệu của bạn sẽ không thể khôi phục.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tài khoản', 
          style: 'destructive',
          onPress: () => {
            // Handle account deletion logic here
            Alert.alert('Đã yêu cầu xóa tài khoản', 'Chúng tôi sẽ gửi email xác nhận để hoàn tất quy trình.');
          } 
        }
      ]
    );
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={24} color="#AD40AF" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderToggleItem = (label, value, onToggle, indent = false) => (
    <View style={[styles.toggleItem, indent && styles.indentedItem]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        trackColor={{ false: "#d1d1d1", true: "#eba6ef" }}
        thumbColor={value ? "#AD40AF" : "#f4f3f4"}
        ios_backgroundColor="#d1d1d1"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );

  const isSelected = (option) => settings.profileVisibility === option;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt quyền riêng tư</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {renderSectionHeader('Thông tin cá nhân', 'person-outline')}
          
          <View style={styles.optionsContainer}>
            <Text style={styles.optionGroupLabel}>Hiển thị trang cá nhân</Text>
            
            <TouchableOpacity 
              style={[styles.optionItem, isSelected('public') && styles.selectedOption]}
              onPress={() => setProfileVisibility('public')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="globe-outline" size={22} color="#444" />
                <Text style={styles.optionLabel}>Công khai</Text>
              </View>
              {isSelected('public') && (
                <Ionicons name="checkmark-circle" size={22} color="#AD40AF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, isSelected('friends') && styles.selectedOption]}
              onPress={() => setProfileVisibility('friends')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="people-outline" size={22} color="#444" />
                <Text style={styles.optionLabel}>Chỉ bạn bè</Text>
              </View>
              {isSelected('friends') && (
                <Ionicons name="checkmark-circle" size={22} color="#AD40AF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, isSelected('private') && styles.selectedOption]}
              onPress={() => setProfileVisibility('private')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="lock-closed-outline" size={22} color="#444" />
                <Text style={styles.optionLabel}>Riêng tư</Text>
              </View>
              {isSelected('private') && (
                <Ionicons name="checkmark-circle" size={22} color="#AD40AF" />
              )}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {renderToggleItem(
              'Chia sẻ vị trí', 
              settings.locationSharing, 
              () => toggleSwitch('locationSharing')
            )}
            
            {renderToggleItem(
              'Cho phép xem đánh giá của tôi', 
              settings.reviewsVisible, 
              () => toggleSwitch('reviewsVisible')
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Thu thập dữ liệu', 'analytics-outline')}
          
          <View style={styles.togglesContainer}>
            {renderToggleItem(
              'Hoạt động ứng dụng', 
              settings.dataCollection.appActivity, 
              () => toggleSwitch('dataCollection', 'appActivity')
            )}
            
            {renderToggleItem(
              'Lịch sử vị trí', 
              settings.dataCollection.locationHistory, 
              () => toggleSwitch('dataCollection', 'locationHistory')
            )}
            
            {renderToggleItem(
              'Lịch sử tìm kiếm', 
              settings.dataCollection.searchHistory, 
              () => toggleSwitch('dataCollection', 'searchHistory')
            )}
            
            {renderToggleItem(
              'Quảng cáo cá nhân hóa', 
              settings.dataCollection.personalizedAds, 
              () => toggleSwitch('dataCollection', 'personalizedAds')
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Bảo mật tài khoản', 'shield-checkmark-outline')}
          
          <View style={styles.togglesContainer}>
            {renderToggleItem(
              'Xác thực hai yếu tố', 
              settings.accountActivity.twoFactorAuth, 
              () => toggleSwitch('accountActivity', 'twoFactorAuth')
            )}
            
            {renderToggleItem(
              'Thông báo đăng nhập', 
              settings.accountActivity.loginAlerts, 
              () => toggleSwitch('accountActivity', 'loginAlerts')
            )}
            
            {renderToggleItem(
              'Lịch sử thiết bị', 
              settings.accountActivity.deviceHistory, 
              () => toggleSwitch('accountActivity', 'deviceHistory')
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Xóa tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#AD40AF',
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
  optionsContainer: {
    padding: 16,
  },
  optionGroupLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#f9f0fa',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#444',
    marginLeft: 12,
  },
  togglesContainer: {
    padding: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  indentedItem: {
    paddingLeft: 32,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#AD40AF',
    margin: 16,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    borderColor: '#dc3545',
    borderWidth: 1,
    margin: 16,
    marginTop: 0,
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
});

export default PrivacyScreen; 