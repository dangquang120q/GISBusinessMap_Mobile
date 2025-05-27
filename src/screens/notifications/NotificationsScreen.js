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

const NotificationsScreen = () => {
  const navigation = useNavigation();
  
  // Sample notification settings - replace with actual data from your API/storage
  const [settings, setSettings] = useState({
    pushNotifications: true,
    reviews: true,
    feedback: true,
    messages: true,
    appUpdates: false,
    promotions: false,
    email: {
      enabled: true,
      reviews: true,
      feedback: true,
      messages: false,
      promotions: false,
    },
    sms: {
      enabled: false,
      reviews: false,
      feedback: false,
      messages: false,
      promotions: false,
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

  const handleSave = () => {
    // Here you would make an API call to save notification settings
    // For example: saveNotificationSettings(settings);
    
    Alert.alert(
      'Thành công',
      'Cài đặt thông báo đã được lưu',
      [{ text: 'OK' }]
    );
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={24} color="#085924" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderToggleItem = (label, value, onToggle, indent = false) => (
    <View style={[styles.toggleItem, indent && styles.indentedItem]}>
      <Text style={styles.toggleLabel}>{label}</Text>
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
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {renderSectionHeader('Thông báo đẩy', 'notifications-outline')}
          
          <View style={styles.togglesContainer}>
            {renderToggleItem(
              'Thông báo đẩy', 
              settings.pushNotifications, 
              () => toggleSwitch('pushNotifications')
            )}
            
            <View style={styles.divider} />
            
            {renderToggleItem(
              'Thông báo về đánh giá', 
              settings.reviews, 
              () => toggleSwitch('reviews'),
              true
            )}
            
            {renderToggleItem(
              'Phản hồi từ cơ quan chức năng', 
              settings.feedback, 
              () => toggleSwitch('feedback'),
              true
            )}
            
            {renderToggleItem(
              'Tin nhắn', 
              settings.messages, 
              () => toggleSwitch('messages'),
              true
            )}
            
            {renderToggleItem(
              'Cập nhật ứng dụng', 
              settings.appUpdates, 
              () => toggleSwitch('appUpdates'),
              true
            )}
            
            {renderToggleItem(
              'Khuyến mãi & Tin tức', 
              settings.promotions, 
              () => toggleSwitch('promotions'),
              true
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Thông báo Email', 'mail-outline')}
          
          <View style={styles.togglesContainer}>
            {renderToggleItem(
              'Nhận email thông báo', 
              settings.email.enabled, 
              () => toggleSwitch('email', 'enabled')
            )}
            
            <View style={styles.divider} />
            
            {renderToggleItem(
              'Thông báo về đánh giá', 
              settings.email.reviews, 
              () => toggleSwitch('email', 'reviews'),
              true
            )}
            
            {renderToggleItem(
              'Phản hồi từ cơ quan chức năng', 
              settings.email.feedback, 
              () => toggleSwitch('email', 'feedback'),
              true
            )}
            
            {renderToggleItem(
              'Tin nhắn', 
              settings.email.messages, 
              () => toggleSwitch('email', 'messages'),
              true
            )}
            
            {renderToggleItem(
              'Khuyến mãi & Tin tức', 
              settings.email.promotions, 
              () => toggleSwitch('email', 'promotions'),
              true
            )}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader('Thông báo SMS', 'chatbubble-outline')}
          
          <View style={styles.togglesContainer}>
            {renderToggleItem(
              'Nhận SMS thông báo', 
              settings.sms.enabled, 
              () => toggleSwitch('sms', 'enabled')
            )}
            
            <View style={styles.divider} />
            
            {renderToggleItem(
              'Thông báo về đánh giá', 
              settings.sms.reviews, 
              () => toggleSwitch('sms', 'reviews'),
              true
            )}
            
            {renderToggleItem(
              'Phản hồi từ cơ quan chức năng', 
              settings.sms.feedback, 
              () => toggleSwitch('sms', 'feedback'),
              true
            )}
            
            {renderToggleItem(
              'Tin nhắn', 
              settings.sms.messages, 
              () => toggleSwitch('sms', 'messages'),
              true
            )}
            
            {renderToggleItem(
              'Khuyến mãi & Tin tức', 
              settings.sms.promotions, 
              () => toggleSwitch('sms', 'promotions'),
              true
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
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
    marginVertical: 4,
  },
  saveButton: {
    backgroundColor: '#085924',
    margin: 16,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen; 