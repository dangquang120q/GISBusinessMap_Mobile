import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  PanResponder,
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
    const fetchNotifications = async () => {
      try {
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

  const NotificationItem = ({ item }) => {
    const pan = new Animated.ValueXY();
    const deleteThreshold = -80;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          pan.x.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        if (gesture.dx < deleteThreshold) {
          Animated.timing(pan.x, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            deleteNotification(item.id);
          });
        } else {
          Animated.spring(pan.x, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    const deleteButtonOpacity = pan.x.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.notificationItemContainer}>
        <Animated.View
          style={[
            styles.deleteButton,
            {
              opacity: deleteButtonOpacity,
            },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.notificationItem,
            item.read ? styles.readItem : styles.unreadItem,
            {
              transform: [{ translateX: pan.x }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.notificationTitle, !item.read && styles.boldText]}>
              {item.title}
            </Text>
            <Text style={styles.notificationDescription}>{item.description}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

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
          <ActivityIndicator size="large" color="#085924" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationItem item={item} />}
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
    color: '#085924',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 10,
  },
  notificationItemContainer: {
    position: 'relative',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
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
    borderLeftColor: '#085924',
  },
  readItem: {
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
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
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
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