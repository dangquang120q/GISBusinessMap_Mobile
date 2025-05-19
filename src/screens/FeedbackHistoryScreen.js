import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const FeedbackHistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'processing', 'resolved'

  // Sample data - replace with your actual API call
  const sampleFeedback = [
    {
      id: '1',
      facilityName: 'Nhà hàng ABC',
      handler: 'Nguyễn Văn A - Sở Y tế',
      title: 'Phản ánh về vệ sinh an toàn thực phẩm',
      content: 'Chúng tôi đã tiếp nhận phản ánh của bạn về vấn đề vệ sinh thực phẩm tại cơ sở. Sau khi kiểm tra, chúng tôi đã yêu cầu cơ sở khắc phục các vấn đề và sẽ theo dõi trong thời gian tới.',
      status: 'resolved',
      date: '2023-12-10',
      feedbackContent: 'Nhà hàng không đảm bảo vệ sinh, nhân viên không đeo khẩu trang khi chế biến thức ăn.',
    },
    {
      id: '2',
      facilityName: 'Khách sạn XYZ',
      handler: 'Trần Thị B - Sở Du lịch',
      title: 'Phản ánh về chất lượng dịch vụ',
      content: 'Cảm ơn bạn đã phản hồi về chất lượng dịch vụ. Chúng tôi đang xem xét vấn đề và sẽ có biện pháp cải thiện trong thời gian tới.',
      status: 'processing',
      date: '2023-11-25',
      feedbackContent: 'Phòng ốc không sạch sẽ, nhân viên phục vụ thiếu chuyên nghiệp.',
    },
    {
      id: '3',
      facilityName: 'Cửa hàng LMN',
      handler: 'Lê Văn C - Sở Công Thương',
      title: 'Phản ánh về tính minh bạch giá cả',
      content: 'Chúng tôi đã tiếp nhận phản ánh của bạn về vấn đề niêm yết giá. Sau khi kiểm tra, cơ sở đã được yêu cầu tuân thủ quy định về niêm yết giá và thông tin sản phẩm.',
      status: 'resolved',
      date: '2023-11-05',
      feedbackContent: 'Cửa hàng không niêm yết giá rõ ràng, tính giá cao hơn giá niêm yết.',
    },
    {
      id: '4',
      facilityName: 'Quán cafe PQR',
      title: 'Phản ánh về tiếng ồn',
      content: 'Quán cafe hoạt động quá giờ, gây ồn ào ảnh hưởng đến khu dân cư.',
      status: 'pending',
      date: '2023-12-15',
      feedbackContent: 'Quán cafe hoạt động quá giờ, gây ồn ào ảnh hưởng đến khu dân cư.',
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchFeedback = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setFeedback(data);
        
        // Using sample data for now
        setTimeout(() => {
          setFeedback(sampleFeedback);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#28a745';
      case 'processing':
        return '#ffc107';
      case 'pending':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved':
        return 'Đã xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chưa xác minh';
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'pending':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            Chưa xác minh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'processing' && styles.filterButtonActive]}
          onPress={() => setFilter('processing')}
        >
          <Text style={[styles.filterButtonText, filter === 'processing' && styles.filterButtonTextActive]}>
            Đang xử lý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'resolved' && styles.filterButtonActive]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[styles.filterButtonText, filter === 'resolved' && styles.filterButtonTextActive]}>
            Đã xử lý
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedbackItem}
      onPress={() => {
        navigation.navigate('FeedbackDetail', { feedbackId: item.id });
      }}
    >
      <View style={styles.feedbackHeader}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={14} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      {item.status !== 'pending' && (
        <View style={styles.handlerInfo}>
          <Text style={styles.handlerName}>{item.handler}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      )}
      
      <Text style={styles.feedbackTitle}>{item.title}</Text>
      <Text style={styles.feedbackContent} numberOfLines={3}>
        {item.status === 'pending' ? item.feedbackContent : item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử phản ánh</Text>
      </View>

      {renderFilterButtons()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#085924" />
        </View>
      ) : filteredFeedback.length > 0 ? (
        <FlatList
          data={filteredFeedback}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có phản ánh nào</Text>
        </View>
      )}
    </SafeAreaView>
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
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 48,
  },
  filterContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    height: 32,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#085924',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIcon: {
    marginRight: 4,
  },
  handlerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  handlerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  feedbackContent: {
    fontSize: 15,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default FeedbackHistoryScreen; 