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

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const result = await BusinessFeedbackService.getUserFeedbacks();
      if (result && Array.isArray(result.items)) {
        setFeedback(result.items);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedbackItem}
      onPress={() => {
        navigation.navigate('FeedbackDetail', { feedbackId: item.id });
      }}
    >
      <View style={styles.feedbackHeader}>
        <Text style={styles.facilityName}>{item.businessName || 'Không có tên'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: BusinessFeedbackType.getStatusColor(item.status) }]}>
          <Ionicons 
            name={BusinessFeedbackType.getStatusIcon(item.status)} 
            size={14} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{BusinessFeedbackType.getStatusText(item.status)}</Text>
        </View>
      </View>
      
      {item.status !== BusinessFeedbackType.PENDING && item.handler && (
        <View style={styles.handlerInfo}>
          <Text style={styles.handlerName}>{item.handler}</Text>
          <Text style={styles.date}>{new Date(item.creationTime).toLocaleDateString()}</Text>
        </View>
      )}
      
      <Text style={styles.feedbackTitle}>{item.title || 'Không có tiêu đề'}</Text>
      <Text style={styles.feedbackContent} numberOfLines={3}>
        {item.status === BusinessFeedbackType.PENDING ? item.content : (item.responseContent || item.content)}
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
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
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