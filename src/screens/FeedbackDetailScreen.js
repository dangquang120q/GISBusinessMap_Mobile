import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const FeedbackDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { feedbackId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  
  // Sample feedback data - replace with your actual API call
  const sampleFeedback = [
    {
      id: '1',
      facilityName: 'Nhà hàng ABC',
      facilityType: 'Nhà hàng',
      address: '123 Đường Lê Lợi, Quận 1, TP HCM',
      responseFrom: 'Sở Y tế',
      responseTitle: 'Phản hồi về vệ sinh an toàn thực phẩm',
      responseContent: 'Chúng tôi đã tiếp nhận phản ánh của bạn về vấn đề vệ sinh thực phẩm tại cơ sở. Sau khi kiểm tra, chúng tôi đã phát hiện một số vấn đề cần khắc phục:\n\n1. Khu vực bếp chưa đảm bảo vệ sinh theo quy định.\n2. Một số thực phẩm chưa được bảo quản đúng cách.\n3. Nhân viên chưa thực hiện đầy đủ quy trình vệ sinh cá nhân.\n\nCơ sở đã được yêu cầu khắc phục các vấn đề trên trong vòng 15 ngày. Chúng tôi sẽ tiến hành kiểm tra lại sau thời gian trên và sẽ có thông báo kết quả đến người dân.\n\nCảm ơn bạn đã góp phần giúp cải thiện an toàn thực phẩm cho cộng đồng.',
      responseDate: '2023-12-10',
      originalReportDate: '2023-12-01',
      originalReportContent: 'Tôi phát hiện nhà hàng có dấu hiệu không đảm bảo vệ sinh thực phẩm. Khu vực bếp nhìn qua cửa sổ thấy rất bẩn, thức ăn để lâu không được bảo quản đúng cách.',
      status: 'resolved',
      contactPerson: 'Ông Nguyễn Văn X',
      contactDepartment: 'Phòng An toàn Thực phẩm',
      contactPhone: '028.1234.5678',
      trackingNumber: 'YT-2023-12-001',
    },
    {
      id: '2',
      facilityName: 'Khách sạn XYZ',
      facilityType: 'Khách sạn',
      address: '456 Đường Nguyễn Huệ, Quận 1, TP HCM',
      responseFrom: 'Sở Du lịch',
      responseTitle: 'Phản hồi về chất lượng dịch vụ',
      responseContent: 'Cảm ơn bạn đã phản hồi về chất lượng dịch vụ tại khách sạn XYZ. Chúng tôi đã nhận được phản ánh của bạn và đang tiến hành xác minh thông tin.\n\nHiện tại, chúng tôi đã liên hệ với ban quản lý khách sạn để làm rõ các vấn đề bạn đã nêu. Khách sạn đã cam kết sẽ rà soát lại quy trình phục vụ và cải thiện chất lượng dịch vụ.\n\nChúng tôi sẽ tiếp tục theo dõi và cập nhật thông tin đến bạn trong thời gian tới.',
      responseDate: '2023-11-25',
      originalReportDate: '2023-11-20',
      originalReportContent: 'Dịch vụ phòng không đúng như quảng cáo, phòng không được dọn dẹp sạch sẽ mỗi ngày, nhân viên thái độ không tốt.',
      status: 'processing',
      contactPerson: 'Bà Trần Thị Y',
      contactDepartment: 'Phòng Quản lý Dịch vụ Du lịch',
      contactPhone: '028.8765.4321',
      trackingNumber: 'DL-2023-11-015',
    },
    {
      id: '3',
      facilityName: 'Cửa hàng LMN',
      facilityType: 'Cửa hàng',
      address: '789 Đường Lê Duẩn, Quận 3, TP HCM',
      responseFrom: 'Sở Công Thương',
      responseTitle: 'Phản hồi về tính minh bạch giá cả',
      responseContent: 'Chúng tôi đã tiếp nhận phản ánh của bạn về vấn đề niêm yết giá tại cửa hàng LMN. Sau khi tiến hành kiểm tra, chúng tôi nhận thấy cơ sở có một số vi phạm về quy định niêm yết giá như sau:\n\n1. Không niêm yết giá ở vị trí dễ quan sát\n2. Giá bán không đúng với giá niêm yết\n3. Không cung cấp đầy đủ thông tin về sản phẩm\n\nCửa hàng đã bị xử phạt hành chính và yêu cầu khắc phục ngay các vi phạm. Hiện tại cửa hàng đã điều chỉnh lại cách niêm yết giá theo đúng quy định.\n\nCảm ơn bạn đã phản ánh vấn đề này để giúp thị trường minh bạch hơn.',
      responseDate: '2023-11-05',
      originalReportDate: '2023-10-28',
      originalReportContent: 'Cửa hàng không niêm yết giá rõ ràng, giá tính tiền cao hơn giá ghi trên sản phẩm.',
      status: 'resolved',
      contactPerson: 'Ông Lê Văn Z',
      contactDepartment: 'Phòng Quản lý Thị trường',
      contactPhone: '028.2468.1357',
      trackingNumber: 'CT-2023-10-042',
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchFeedbackDetail = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`your-api-endpoint/${feedbackId}`);
        // const data = await response.json();
        // setFeedback(data);
        
        // Using sample data for now
        setTimeout(() => {
          const foundFeedback = sampleFeedback.find(f => f.id === feedbackId);
          setFeedback(foundFeedback || null);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching feedback details:', error);
        setLoading(false);
      }
    };

    fetchFeedbackDetail();
  }, [feedbackId]);

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
        return 'Chưa xử lý';
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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feedback.status) }]}>
            <Ionicons 
              name={getStatusIcon(feedback.status)} 
              size={18} 
              color="#fff" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{getStatusText(feedback.status)}</Text>
          </View>
          <Text style={styles.trackingNumber}>Mã theo dõi: {feedback.trackingNumber}</Text>
        </View>
        
        <View style={styles.facilityInfoSection}>
          <Text style={styles.facilityName}>{feedback.facilityName}</Text>
          <View style={styles.facilityTypeContainer}>
            <Ionicons 
              name={feedback.facilityType === 'Nhà hàng' ? 'restaurant' : 
                   feedback.facilityType === 'Khách sạn' ? 'bed' : 'cart'} 
              size={16} 
              color="#085924" 
            />
            <Text style={styles.facilityType}>{feedback.facilityType}</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.address}>{feedback.address}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.originalReportSection}>
          <Text style={styles.sectionTitle}>Nội dung phản ánh ban đầu</Text>
          <View style={styles.reportDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.reportDate}>Ngày báo cáo: {feedback.originalReportDate}</Text>
          </View>
          <Text style={styles.reportContent}>{feedback.originalReportContent}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.responseSection}>
          <View style={styles.responseHeader}>
            <View style={styles.responseTitleContainer}>
              <Text style={styles.sectionTitle}>Phản hồi từ {feedback.responseFrom}</Text>
              <View style={styles.responseDateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.responseDate}>Ngày phản hồi: {feedback.responseDate}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.responseTitle}>{feedback.responseTitle}</Text>
          <Text style={styles.responseContent}>{feedback.responseContent}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Người phụ trách:</Text>
              <Text style={styles.contactValue}>{feedback.contactPerson}</Text>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phòng/Ban:</Text>
              <Text style={styles.contactValue}>{feedback.contactDepartment}</Text>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Điện thoại:</Text>
              <Text style={styles.contactValue}>{feedback.contactPhone}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.replyButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.replyButtonText}>Gửi phản hồi bổ sung</Text>
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
  },
  statusIcon: {
    marginRight: 6,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#666',
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
  responseTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
    marginBottom: 10,
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
  replyButton: {
    backgroundColor: '#085924',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default FeedbackDetailScreen; 