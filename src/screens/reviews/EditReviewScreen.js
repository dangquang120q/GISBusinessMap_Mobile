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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BusinessReviewService from '../../services/BusinessReviewService';
import { showError, showSuccess } from '../../utils/PopupUtils';

const EditReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reviewId, review: initialReview } = route.params;
  
  const [loading, setLoading] = useState(!initialReview);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState(initialReview || null);
  
  // Editable fields
  const [title, setTitle] = useState(initialReview?.title || '');
  const [content, setContent] = useState(initialReview?.content || '');
  const [rating, setRating] = useState(initialReview?.rating || 5);
  
  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const response = await BusinessReviewService.getById(reviewId);
        if (response) {
          setReview(response);
          setTitle(response.title || '');
          setContent(response.content || '');
          setRating(response.rating || 5);
        } else {
          console.error('No review data returned');
        }
      } catch (error) {
        console.error('Error fetching review details:', error);
        showError('Không thể tải thông tin đánh giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if review data wasn't provided
    if (!initialReview && reviewId) {
      fetchReviewDetail();
    }
  }, [reviewId, initialReview]);

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      showError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSaving(true);

      const updatedReview = {
        ...review,
        title: title.trim(),
        content: content.trim(),
        rating: rating
      };

      const response = await BusinessReviewService.updateByUser(updatedReview);
      
      if (response) {
        showSuccess('Đã cập nhật đánh giá thành công');
        navigation.goBack();
      } else {
        showError('Không thể cập nhật đánh giá');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showError('Không thể cập nhật đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <TouchableOpacity 
            key={i}
            onPress={() => handleRatingChange(i + 1)}
            style={styles.starButton}
          >
            <Ionicons
              name={i < rating ? 'star' : 'star-outline'}
              size={30}
              color="#FFD700"
              style={styles.starIcon}
            />
          </TouchableOpacity>
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
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa đánh giá</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin đánh giá</Text>
        </View>
      </SafeAreaView>
    );
  }

  const media = review.listBusinessReviewMedia || [];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa đánh giá</Text>
          {saving ? (
            <ActivityIndicator size="small" color="#085924" />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.facilityInfoSection}>
            <Text style={styles.facilityName}>{review.branchName || review.organizationName || 'Không có tên'}</Text>
            
            {review.address && (
              <View style={styles.addressContainer}>
                <Ionicons name="location" size={16} color="#666" />
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

            <Text style={styles.editSectionLabel}>Đánh giá của bạn</Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Đánh giá sao:</Text>
              {renderStars()}
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tiêu đề (tùy chọn):</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề đánh giá"
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Nội dung đánh giá:</Text>
              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Nhập nội dung đánh giá của bạn"
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCounter}>{content?.length || 0}/500</Text>
            </View>
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
                  <View key={index} style={styles.photoContainer}>
                    <Image 
                      source={{uri: item.mediaUrl}} 
                      style={styles.photo} 
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.photoNote}>* Hiện tại không thể thay đổi ảnh đã tải lên</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginHorizontal: 16,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#085924',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  editSectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  charCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  photosSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
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
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  photoNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default EditReviewScreen; 