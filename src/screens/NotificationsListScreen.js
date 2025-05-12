import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const NotificationsListScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu thông báo mẫu
  const mockNotifications = [
    {
      id: 1,
      title: 'Đánh giá mới',
      description: 'Nhà hàng ABC vừa nhận được đánh giá 5 sao mới',
      time: '10 phút trước',
      read: false,
      type: 'review',
    },
    {
      id: 2,
      title: 'Phản hồi từ quản trị viên',
      description: 'Quản trị viên đã phản hồi đánh giá của bạn về Khách sạn XYZ',
      time: '2 giờ trước',
      read: false,
      type: 'feedback',
    },
    {
      id: 3,
      title: 'Cập nhật ứng dụng',
      description: 'Phiên bản mới 2.0.1 đã sẵn sàng để cài đặt',
      time: '3 giờ trước',
      read: true,
      type: 'system',
    },
    {
      id: 4,
      title: 'Cơ sở kinh doanh mới',
      description: 'Cửa hàng 123 vừa được thêm vào danh sách gần vị trí của bạn',
      time: '1 ngày trước',
      read: true,
      type: 'location',
    },
    {
      id: 5,
      title: 'Xác nhật đánh giá',
      description: 'Đánh giá của bạn về Nhà hàng ABC đã được đăng',
      time: '3 ngày trước',
      read: true,
      type: 'confirmation',
    },
  ];

  useEffect(() => {
    // Giả lập fetch dữ liệu từ API
    const fetchNotifications = async () => {
      try {
        // Trong ứng dụng thực tế, dữ liệu sẽ được lấy từ API
        // const response = await fetch('api/notifications');
        // const data = await response.json();
        
        // Giả lập độ trễ khi tải dữ liệu
        setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type, read) => {
    const iconColor = read ? '#999' : '#AD40AF';
    
    switch (type) {
      case 'review':
        return <Ionicons name="star" size={24} color={iconColor} />;
      case 'feedback':
        return <Ionicons name="chatbubble" size={24} color={iconColor} />;
      case 'system':
        return <Ionicons name="information-circle" size={24} color={iconColor} />;
      case 'location':
        return <Ionicons name="location" size={24} color={iconColor} />;
      case 'confirmation':
        return <Ionicons name="checkmark-circle" size={24} color={iconColor} />;
      default:
        return <Ionicons name="notifications" size={24} color={iconColor} />;
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.read ? styles.readItem : styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationLeft}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(item.type, item.read)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.boldText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationDescription}>{item.description}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={clearAllNotifications}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#AD40AF" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
          <Text style={styles.emptySubText}>
            Các thông báo mới sẽ xuất hiện tại đây
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    color: '#AD40AF',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#AD40AF',
  },
  readItem: {
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationsListScreen;