import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BusinessFeedbackService from '../../services/BusinessFeedbackService';
import BusinessFeedbackType from '../../services/BusinessFeedbackType';
import { showError } from '../../utils/PopupUtils';

const FeedbackDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { feedbackId, feedback: initialFeedback } = route.params || {};
  
  const [loading, setLoading] = useState(!initialFeedback);
  const [feedback, setFeedback] = useState(initialFeedback || null);
  
  useEffect(() => {
    const fetchFeedbackDetail = async () => {
      try {
        setLoading(true);
        const response = await BusinessFeedbackService.getById(feedbackId);
        if (response) {
          setFeedback(response);
        } else {
          console.error('No feedback data returned');
        }
      } catch (error) {
        console.error('Error fetching feedback details:', error);
        showError('Không thể tải thông tin phản ánh. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if feedback wasn't provided in navigation params
    if (!initialFeedback && feedbackId) {
      fetchFeedbackDetail();
    }
  }, [feedbackId, initialFeedback]);

  // Format date string to local date format
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
      return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
      </SafeAreaView>
    );
  }

  if (!feedback) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết phản hồi</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin phản hồi</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safely get feedback values
  const status = feedback.status || '';
  const facilityName = feedback.branchName || feedback.organizationName || 'Không có tên';
  const feedbackTypeName = feedback.feedbackTypeName || '';
  const senderAddress = feedback.senderAddress || '';
  const senderName = feedback.senderName || '';
  const senderPhone = feedback.senderPhone || '';
  const senderEmail = feedback.senderEmail || '';
  const content = feedback.content || '';
  const reportDate = formatDate(feedback.feedbackDate || feedback.createdDate);
  const responseContent = feedback.responseContent || '';
  const responseDate = formatDate(feedback.responseDate);
  const assignedToName = feedback.assignedToName || '';
  const ratingAfterResponse = feedback.ratingAfterResponse || 0;
  const isAnonymous = feedback.isAnonymous || false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết phản hồi</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: BusinessFeedbackType.getStatusColor(status) }]}>
            <Ionicons 
              name={BusinessFeedbackType.getStatusIcon(status)} 
              size={18} 
              color="#fff"
            />
            <Text style={styles.statusText}>{BusinessFeedbackType.getStatusText(status)}</Text>
          </View>
        </View>
        
        <View style={styles.facilityInfoSection}>
          <Text style={styles.facilityName}>{facilityName}</Text>
          
          {feedbackTypeName ? (
            <View style={styles.facilityTypeContainer}>
              <Ionicons 
                name="chatbubble-outline" 
                size={16} 
                color="#085924"
              />
              <Text style={styles.facilityType}>{feedbackTypeName}</Text>
            </View>
          ) : null}
          
          {senderAddress ? (
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.address}>{senderAddress}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.originalReportSection}>
          <Text style={styles.sectionTitle}>Nội dung phản ánh ban đầu</Text>
          
          <View style={styles.reporterInfo}>
            {!isAnonymous && senderName ? (
              <View style={styles.reporterRow}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.reporterLabel}>Người phản ánh:</Text>
                <Text style={styles.reporterValue}>{senderName}</Text>
              </View>
            ) : null}
            
            {!isAnonymous && senderPhone ? (
              <View style={styles.reporterRow}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.reporterLabel}>Số điện thoại:</Text>
                <Text style={styles.reporterValue}>{senderPhone}</Text>
              </View>
            ) : null}

            {!isAnonymous && senderEmail ? (
              <View style={styles.reporterRow}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.reporterLabel}>Email:</Text>
                <Text style={styles.reporterValue}>{senderEmail}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.reportDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.reportDate}>
              Ngày báo cáo: {reportDate}
            </Text>
          </View>
          
          <Text style={styles.reportContent}>{content}</Text>

          {feedback.attachmentUrl ? (
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Hình ảnh đính kèm:</Text>
              <TouchableOpacity 
                style={styles.mediaItem}
                onPress={() => {
                  // Handle media preview
                }}
              >
                <Image 
                  source={{uri: feedback.attachmentUrl}} 
                  style={styles.mediaThumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        
        {responseContent ? (
          <>
            <View style={styles.divider} />
            
            <View style={styles.responseSection}>
              <View style={styles.responseHeader}>
                <View style={styles.responseTitleContainer}>
                  <Text style={styles.sectionTitle}>Phản hồi từ cơ quan chức năng</Text>
                  {feedback.responseDate ? (
                    <View style={styles.responseDateContainer}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.responseDate}>
                        Ngày phản hồi: {responseDate}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              
              <Text style={styles.responseContent}>{responseContent}</Text>
              
              {ratingAfterResponse > 0 ? (
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
                  <View style={styles.starContainer}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < ratingAfterResponse ? 'star' : 'star-outline'}
                        size={20}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
        
        {assignedToName ? (
          <>
            <View style={styles.divider} />
            
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
              
              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Người phụ trách:</Text>
                  <Text style={styles.contactValue}>{assignedToName}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}
        
        {status === BusinessFeedbackType.RESOLVED && ratingAfterResponse === 0 ? (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => {
                // Navigate to rating screen or show rating dialog
              }}
            >
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.rateButtonText}>Đánh giá phản hồi</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  statusSection: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  facilityInfoSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  facilityName: {
    fontSize: 22,
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
    color: '#085924',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  originalReportSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  reporterInfo: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reporterLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
  },
  reporterValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reportDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  reportContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  responseSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  responseHeader: {
    marginBottom: 8,
  },
  responseTitleContainer: {
    marginBottom: 4,
  },
  responseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  responseDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  responseContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionSection: {
    padding: 16,
    marginBottom: 20,
  },
  rateButton: {
    backgroundColor: '#085924',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  mediaSection: {
    marginTop: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  mediaItem: {
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  ratingSection: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
});

export default FeedbackDetailScreen; 