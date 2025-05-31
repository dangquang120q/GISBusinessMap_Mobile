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
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BusinessFeedbackService from '../../services/BusinessFeedbackService';
import BusinessFeedbackType from '../../services/BusinessFeedbackType';

const FeedbackHistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'processing', 'resolved'
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await BusinessFeedbackService.getAllByUser({
        maxResultCount: 50,
        skipCount: 0,
        isGetTotalCount: true,
        sorting: 'feedbackDate DESC'
      });
      
      if (result && result.items && Array.isArray(result.items)) {
        setFeedback(result.items);
        setTotalCount(result.totalCount || 0);
      } else {
        setFeedback([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Không thể tải dữ liệu phản ánh.');
      Alert.alert(
        'Lỗi',
        'Không thể tải dữ liệu phản ánh. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
      setFeedback([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch feedback data on component mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

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
          style={[styles.filterButton, filter === BusinessFeedbackType.PENDING && styles.filterButtonActive]}
          onPress={() => setFilter(BusinessFeedbackType.PENDING)}
        >
          <Text style={[styles.filterButtonText, filter === BusinessFeedbackType.PENDING && styles.filterButtonTextActive]}>
            Chưa xác minh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === BusinessFeedbackType.PROCESSING && styles.filterButtonActive]}
          onPress={() => setFilter(BusinessFeedbackType.PROCESSING)}
        >
          <Text style={[styles.filterButtonText, filter === BusinessFeedbackType.PROCESSING && styles.filterButtonTextActive]}>
            Đang xử lý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === BusinessFeedbackType.RESOLVED && styles.filterButtonActive]}
          onPress={() => setFilter(BusinessFeedbackType.RESOLVED)}
        >
          <Text style={[styles.filterButtonText, filter === BusinessFeedbackType.RESOLVED && styles.filterButtonTextActive]}>
            Đã xử lý
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    };

    // Get the display date
    const displayDate = formatDate(item.feedbackDate || item.createdDate);

    return (
      <TouchableOpacity
        style={styles.feedbackItem}
        onPress={() => {
          navigation.navigate('FeedbackDetail', { feedbackId: item.id, feedback: item });
        }}
      >
        <View style={styles.feedbackHeader}>
          <Text style={styles.facilityName}>
            {item.branchName || item.organizationName || 'Không có tên'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: BusinessFeedbackType.getStatusColor(item.status) }]}>
            <View>
              <Ionicons 
                name={BusinessFeedbackType.getStatusIcon(item.status)} 
                size={14} 
                color="#fff"
              />
            </View>
            <Text style={styles.statusText}>{BusinessFeedbackType.getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.dateRow}>
          <View>
            <Ionicons name="calendar-outline" size={14} color="#666" />
          </View>
          <Text style={styles.date}>{displayDate}</Text>
        </View>
        
        {item.status !== BusinessFeedbackType.PENDING && item.assignedToName && (
          <View style={styles.handlerInfo}>
            <View style={styles.handlerRow}>
              <View>
                <Ionicons name="person-outline" size={14} color="#666" />
              </View>
              <Text style={styles.handlerName}>{item.assignedToName}</Text>
            </View>
          </View>
        )}
        
        <Text style={styles.feedbackTitle}>{item.feedbackTypeName || 'Phản ánh'}</Text>
        <Text style={styles.feedbackContent} numberOfLines={3}>
          {item.status === BusinessFeedbackType.PENDING ? item.content : (item.responseContent || item.content)}
        </Text>
        
        {item.attachmentUrl && (
          <View style={styles.mediaIndicator}>
            <View>
              <Ionicons name="images-outline" size={16} color="#666" />
            </View>
            <Text style={styles.mediaText}>Có hình ảnh đính kèm</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Lịch sử phản ánh {totalCount > 0 ? `(${totalCount})` : ''}
        </Text>
      </View>

      {renderFilterButtons()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#085924" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View>
            <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredFeedback.length > 0 ? (
        <FlatList
          data={filteredFeedback}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? 'Chưa có phản ánh nào' 
              : `Không có phản ánh nào ${filter === BusinessFeedbackType.RESOLVED ? 'đã xử lý' : filter === BusinessFeedbackType.PROCESSING ? 'đang xử lý' : 'chưa xác minh'}`}
          </Text>
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
    marginLeft: 4,
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
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  handlerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mediaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#085924',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FeedbackHistoryScreen; 