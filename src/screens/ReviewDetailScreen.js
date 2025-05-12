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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReviewDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reviewId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  
  // Sample review data - replace with your actual API call
  const sampleReviews = [
    {
      id: '1',
      facilityName: 'Nhà hàng ABC',
      facilityType: 'Nhà hàng',
      rating: 4,
      content: 'Đồ ăn ngon, phục vụ tốt. Giá cả hợp lý, không gian thoáng mát và sạch sẽ. Nhân viên thân thiện và nhiệt tình. Sẽ quay lại lần sau.',
      date: '2023-12-05',
      address: '123 Đường Lê Lợi, Quận 1, TP HCM',
      photoUrls: [
        'https://via.placeholder.com/500x300',
        'https://via.placeholder.com/500x300',
      ],
      reviewerName: 'Nguyễn Văn A',
    },
    {
      id: '2',
      facilityName: 'Khách sạn XYZ',
      facilityType: 'Khách sạn',
      rating: 5,
      content: 'Phòng sạch sẽ, nhân viên thân thiện. Vị trí trung tâm, thuận tiện đi lại. Dịch vụ phòng nhanh chóng và chất lượng. Bữa sáng đa dạng và ngon miệng.',
      date: '2023-11-28',
      address: '456 Đường Nguyễn Huệ, Quận 1, TP HCM',
      photoUrls: [
        'https://via.placeholder.com/500x300',
        'https://via.placeholder.com/500x300',
      ],
      reviewerName: 'Trần Thị B',
    },
    {
      id: '3',
      facilityName: 'Cửa hàng LMN',
      facilityType: 'Cửa hàng',
      rating: 3,
      content: 'Sản phẩm đa dạng, giá khá cao. Nhân viên phục vụ còn thiếu nhiệt tình. Không gian cửa hàng hơi chật, trưng bày sản phẩm chưa hợp lý.',
      date: '2023-11-15',
      address: '789 Đường Lê Duẩn, Quận 3, TP HCM',
      photoUrls: [
        'https://via.placeholder.com/500x300',
      ],
      reviewerName: 'Phạm Văn C',
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchReviewDetail = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`your-api-endpoint/${reviewId}`);
        // const data = await response.json();
        // setReview(data);
        
        // Using sample data for now
        setTimeout(() => {
          const foundReview = sampleReviews.find(r => r.id === reviewId);
          setReview(foundReview || null);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching review details:', error);
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, [reviewId]);

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={24}
            color="#FFD700"
            style={styles.starIcon}
          />
        ))}
        <Text style={styles.ratingText}>{rating}/5</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AD40AF" />
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
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đánh giá</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin đánh giá</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đánh giá</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.facilityInfoSection}>
          <Text style={styles.facilityName}>{review.facilityName}</Text>
          <View style={styles.facilityTypeContainer}>
            <Ionicons 
              name={review.facilityType === 'Nhà hàng' ? 'restaurant' : 
                   review.facilityType === 'Khách sạn' ? 'bed' : 'cart'} 
              size={16} 
              color="#AD40AF" 
            />
            <Text style={styles.facilityType}>{review.facilityType}</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.address}>{review.address}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.reviewInfoSection}>
          <View style={styles.reviewerContainer}>
            <Text style={styles.reviewerLabel}>Người đánh giá:</Text>
            <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.date}>{review.date}</Text>
          </View>
          
          {renderStars(review.rating)}
          
          <Text style={styles.contentLabel}>Nội dung đánh giá:</Text>
          <Text style={styles.content}>{review.content}</Text>
        </View>
        
        {review.photoUrls && review.photoUrls.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosLabel}>Hình ảnh đính kèm:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photoScrollView}
            >
              {review.photoUrls.map((url, index) => (
                <Image 
                  key={index} 
                  source={{uri: url}} 
                  style={styles.photo} 
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
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
  facilityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityType: {
    fontSize: 16,
    color: '#AD40AF',
    marginLeft: 6,
    fontWeight: '500',
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
    backgroundColor: '#AD40AF',
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
});

export default ReviewDetailScreen; 