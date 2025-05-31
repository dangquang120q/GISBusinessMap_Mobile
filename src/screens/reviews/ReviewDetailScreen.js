import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BusinessReviewService from '../../services/BusinessReviewService';

const ReviewDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reviewId, review: initialReview } = route.params;
  
  const [loading, setLoading] = useState(!initialReview);
  const [review, setReview] = useState(initialReview || null);
  
  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const response = await BusinessReviewService.getById(reviewId);
        if (response) {
          setReview(response);
        } else {
          console.error('No review data returned');
        }
      } catch (error) {
        console.error('Error fetching review details:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin đánh giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if review data wasn't provided
    if (!initialReview) {
      fetchReviewDetail();
    }
  }, [reviewId, initialReview]);

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <View key={i}>
            <Ionicons
              name={i < rating ? 'star' : 'star-outline'}
              size={24}
              color="#FFD700"
              style={styles.starIcon}
            />
          </View>
        ))}
        <Text style={styles.ratingText}>{rating}/5</Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'A':
        return 'Đã duyệt';
      case 'P':
        return 'Chờ duyệt';
      case 'R':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'A':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'P':
        return { bg: '#fff3e0', text: '#f57c00' };
      case 'R':
        return { bg: '#ffebee', text: '#c62828' };
      default:
        return { bg: '#f5f5f5', text: '#757575' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
      </SafeAreaView>
    );
  }

  if (!review) {
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
          <Text style={styles.headerTitle}>Chi tiết đánh giá</Text>
        </View>
        <View style={styles.errorContainer}>
          <View>
            <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.errorText}>Không tìm thấy thông tin đánh giá</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(review.status);
  const media = review.listBusinessReviewMedia || [];

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
        <Text style={styles.headerTitle}>Chi tiết đánh giá</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.facilityInfoSection}>
          <Text style={styles.facilityName}>{review.branchName || review.organizationName || 'Không có tên'}</Text>
          
          {review.address && (
            <View style={styles.addressContainer}>
              <View>
                <Ionicons name="location" size={16} color="#666" />
              </View>
              <Text style={styles.address}>{review.address}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.reviewInfoSection}>
          <View style={styles.reviewerContainer}>
            <Text style={styles.reviewerLabel}>Người đánh giá:</Text>
            <Text style={styles.reviewerName}>{review.reviewerName || 'Ẩn danh'}</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.reviewerLabel}>Ngày đánh giá:</Text>
            <Text style={styles.date}>{formatDate(review.reviewDate || review.createdDate)}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.bg }
            ]}>
              <Text style={[
                styles.statusText,
                { color: statusStyle.text }
              ]}>
                {getStatusText(review.status)}
              </Text>
            </View>
          </View>
          
          {renderStars(review.rating || 0)}
          
          {review.title && (
            <Text style={styles.reviewTitle}>{review.title}</Text>
          )}
          
          <Text style={styles.contentLabel}>Nội dung đánh giá:</Text>
          <Text style={styles.content}>{review.content || 'Không có nội dung'}</Text>
          
          {review.response && (
            <View style={styles.responseSection}>
              <Text style={styles.responseLabel}>Phản hồi từ doanh nghiệp:</Text>
              <Text style={styles.responseText}>{review.response}</Text>
              {review.responseDate && (
                <Text style={styles.responseDate}>
                  Ngày phản hồi: {formatDate(review.responseDate)}
                </Text>
              )}
            </View>
          )}
        </View>
        
        {media.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosLabel}>Hình ảnh đính kèm:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photoScrollView}
            >
              {media.map((item, index) => (
                <Image 
                  key={index} 
                  source={{uri: item.mediaUrl}} 
                  style={styles.photo} 
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.actionsSection}>
          {review.status === 'P' && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditReviewScreen', { review })}
            >
              <View>
                <Ionicons name="create-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.deleteButton,
              review.status !== 'P' && styles.fullWidthButton
            ]}
            onPress={() => {
              Alert.alert(
                'Xác nhận xóa',
                'Bạn có chắc chắn muốn xóa đánh giá này không?',
                [
                  { text: 'Hủy', style: 'cancel' },
                  { 
                    text: 'Xóa', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setLoading(true);
                        await BusinessReviewService.delete(review.id);
                        Alert.alert('Thành công', 'Đã xóa đánh giá');
                        navigation.goBack();
                      } catch (error) {
                        console.error('Error deleting review:', error);
                        Alert.alert('Lỗi', 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
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
  scrollView: {
    flex: 1,
  },
  facilityInfoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  divider: {
    height: 8,
    backgroundColor: '#f1f1f1',
  },
  reviewInfoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  reviewerContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewerLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  responseSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#085924',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  responseText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  responseDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  photosSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  photosLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  photoScrollView: {
    flexDirection: 'row',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#085924',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fullWidthButton: {
    flex: 1,
    marginLeft: 0,
  },
});

export default ReviewDetailScreen; 