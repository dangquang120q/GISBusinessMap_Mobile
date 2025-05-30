import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BusinessBranchService from '../../services/BusinessBranchService';

const BusinessFacilityDetailScreen = ({route, navigation}) => {
  const { facilityId } = route.params || {};
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch facility details on component mount
  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!facilityId) {
          throw new Error('Không có ID cơ sở kinh doanh');
        }
        
        const result = await BusinessBranchService.get(facilityId);
        if (result) {
          // Transform API data to facility format
          const facilityData = {
            id: result.id.toString(),
            name: result.branchName || 'Chưa có tên',
            address: formatAddress(result),
            status: result.isActive ? 'Hoạt động' : result.status === 'Chờ phê duyệt' ? 'Chờ phê duyệt' : 'Không hoạt động',
            licenseNumber: result.businessCode || 'Chưa có mã',
            operationDate: formatDate(result.establishedDate),
            expiryDate: formatDate(result.deactivationDate),
            owner: result.representativeName || 'Chưa có',
            contactPhone: result.phoneNumber || 'Chưa có',
            contactEmail: result.email || 'Chưa có',
            businessType: result.businessTypeName || 'Khác',
            area: '',
            employees: 0,
            // Thêm các thông tin khác từ API
            website: result.website,
            socialMediaUrl: result.socialMediaUrl,
            rating: result.rating,
            rawData: result, // Lưu dữ liệu gốc để sử dụng khi cần
          };
          
          setFacility(facilityData);
        } else {
          throw new Error('Không tìm thấy thông tin cơ sở kinh doanh');
        }
      } catch (err) {
        console.error('Error fetching facility details:', err);
        setError(err.message || 'Không thể tải thông tin chi tiết');
        Alert.alert(
          'Lỗi',
          'Không thể tải thông tin chi tiết cơ sở kinh doanh. Vui lòng thử lại sau.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityDetails();
  }, [facilityId]);

  // Định dạng địa chỉ từ dữ liệu API
  const formatAddress = (item) => {
    const parts = [];
    if (item.addressDetail) parts.push(item.addressDetail);
    if (item.wardName) parts.push(item.wardName);
    if (item.districtName) parts.push(item.districtName);
    
    return parts.join(', ') || 'Chưa có địa chỉ';
  };
  
  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleEditFacility = () => {
    navigation.navigate('EditBusinessFacility', { facilityId: facility.id, facility });
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  // Hiển thị thông báo lỗi
  if (error || !facility) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin cơ sở kinh doanh'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cơ sở kinh doanh</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.facilityHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={40} color="#085924" />
          </View>
          <Text style={styles.facilityName}>{facility.name}</Text>
          <View style={[styles.statusBadge, 
            facility.status === 'Hoạt động' ? styles.activeStatus : 
            facility.status === 'Chờ phê duyệt' ? styles.pendingStatus : 
            styles.inactiveStatus
          ]}>
            <Text style={styles.statusText}>{facility.status}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số giấy phép:</Text>
            <Text style={styles.infoValue}>{facility.licenseNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loại hình:</Text>
            <Text style={styles.infoValue}>{facility.businessType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày hoạt động:</Text>
            <Text style={styles.infoValue}>{facility.operationDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
            <Text style={styles.infoValue}>{facility.expiryDate}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa điểm</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{facility.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Diện tích:</Text>
            <Text style={styles.infoValue}>{facility.area}</Text>
          </View>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={50} color="#085924" />
            <Text style={styles.mapText}>Xem bản đồ</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Chủ sở hữu:</Text>
            <Text style={styles.infoValue}>{facility.owner}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Điện thoại:</Text>
            <Text style={styles.infoValue}>{facility.contactPhone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{facility.contactEmail}</Text>
          </View>
          {facility.website && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={styles.infoValue}>{facility.website}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số nhân viên:</Text>
            <Text style={styles.infoValue}>{facility.employees}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử đánh giá của cơ sở</Text>
          
          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userIcon}>
                  <Ionicons name="person" size={18} color="#085924" />
                </View>
                <Text style={styles.userName}>Trần Văn Bình</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= 4 ? "star" : "star-outline"} 
                    size={16} 
                    color="#FFD700" 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewDate}>20/05/2023</Text>
            <Text style={styles.reviewText}>
              Đồ ăn ngon, dịch vụ tốt, không gian sạch sẽ và thoáng mát. Sẽ quay lại lần sau.
            </Text>
          </View>
          
          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userIcon}>
                  <Ionicons name="person" size={18} color="#085924" />
                </View>
                <Text style={styles.userName}>Lê Thị Hương</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= 5 ? "star" : "star-outline"} 
                    size={16} 
                    color="#FFD700" 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewDate}>15/04/2023</Text>
            <Text style={styles.reviewText}>
              Tuyệt vời! Nhân viên phục vụ chu đáo, món ăn ngon miệng. Giá cả hợp lý.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Xem tất cả đánh giá</Text>
            <Ionicons name="chevron-forward" size={16} color="#085924" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.editDetailButton}
          onPress={handleEditFacility}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editDetailButtonText}>Chỉnh sửa thông tin cơ sở</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#085924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  facilityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  facilityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 5,
  },
  activeStatus: {
    backgroundColor: '#d4edda',
  },
  pendingStatus: {
    backgroundColor: '#fff3cd',
  },
  inactiveStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    width: '40%',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#e0f2e9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  mapText: {
    fontSize: 16,
    color: '#085924',
    marginTop: 8,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 16,
    color: '#085924',
    fontWeight: '500',
    marginRight: 8,
  },
  editDetailButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  editDetailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default BusinessFacilityDetailScreen; 