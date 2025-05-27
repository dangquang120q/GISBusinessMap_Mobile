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
import BusinessReviewService from '../../services/BusinessReviewService';

const ReviewHistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all reviews for the current user
      // Since API automatically filters for the current authenticated user
      // We're using the getAll method with appropriate pagination
      const response = await BusinessReviewService.getAll({
        maxResultCount: 50, // Adjust as needed
        skipCount: 0,
        isGetTotalCount: true,
        sorting: 'creationTime DESC' // Sort by newest first
      });
      
      if (response && Array.isArray(response.items)) {
        // Map the API response to our review format
        const mappedReviews = response.items.map(item => ({
          id: item.id,
          facilityName: item.businessName || 'Không có tên',
          facilityType: item.businessTypeName || 'Không phân loại',
          rating: item.rating || 0,
          content: item.content || '',
          date: formatDate(item.creationTime),
          status: item.isApproved ? 'approved' : 'pending',
        }));
        
        setReviews(mappedReviews);
      } else {
        // Fallback to empty array if response format is unexpected
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu đánh giá');
      
      // Show error alert
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách đánh giá. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteReview(reviewId)
        }
      ]
    );
  };

  const deleteReview = async (reviewId) => {
    try {
      setDeleting(true);
      await BusinessReviewService.delete(reviewId);
      
      // Update the local state after successful deletion
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      
      // Show success message
      Alert.alert('Thành công', 'Đã xóa đánh giá thành công');
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Lỗi', 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to format date from ISO string to local date format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
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
          style={[styles.filterButton, filter === 'approved' && styles.filterButtonActive]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.filterButtonText, filter === 'approved' && styles.filterButtonTextActive]}>
            Đã duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            Chờ duyệt
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <TouchableOpacity
        style={styles.reviewContent}
        onPress={() => {
          navigation.navigate('ReviewDetail', { reviewId: item.id });
        }}
      >
        <View style={styles.reviewHeader}>
          <Text style={styles.facilityName}>{item.facilityName}</Text>
          <View style={styles.headerRight}>
            <View style={[
              styles.statusBadge,
              item.status === 'approved' ? styles.statusApproved : styles.statusPending
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.facilityType}>{item.facilityType}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <Text>{renderStars(item.rating)}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </TouchableOpacity>
      
      <View style={styles.reviewActions}>
        {/* Only allow editing of pending reviews */}
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditReview', { reviewId: item.id })}
          >
            <Ionicons name="create-outline" size={18} color="#085924" />
            <Text style={styles.editButtonText}>Sửa</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteReview(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleRefresh = () => {
    fetchReviews();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đánh giá</Text>
      </View>

      {renderFilterButtons()}

      {loading || deleting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#085924" />
          {deleting && <Text style={styles.loadingText}>Đang xóa đánh giá...</Text>}
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredReviews.length > 0 ? (
        <FlatList
          data={filteredReviews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Không có đánh giá nào</Text>
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
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
  listContainer: {
    padding: 16,
  },
  reviewItem: {
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
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  facilityType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#444',
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  editButtonText: {
    color: '#085924',
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#e74c3c',
    marginLeft: 4,
    fontSize: 14,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusApproved: {
    backgroundColor: '#e8f5e9',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
});

export default ReviewHistoryScreen; 