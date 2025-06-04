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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BusinessBranchService from '../../services/BusinessBranchService';
import { showError } from '../../utils/PopupUtils';

const BusinessFacilityDetailScreen = ({route, navigation}) => {
  const { facility, rawData } = route.params;
  const [facilityData, setFacilityData] = useState(facility || rawData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facility && !rawData) {
      setFacilityData(null);
    }
  }, [facility, rawData]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleEditFacility = () => {
    navigation.navigate('EditBusinessFacility', { 
      facilityId: facilityData.id, 
      facility: facilityData 
    });
  };

  if (!facilityData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
        <Text style={styles.errorText}>Không tìm thấy thông tin cơ sở kinh doanh</Text>
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
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tên cơ sở/chi nhánh:</Text>
            <Text style={styles.infoValue}>{facilityData.branchName || facilityData.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loại hình kinh doanh:</Text>
            <View style={styles.businessTypeContainer}>
              <MaterialIcons 
                name={(facilityData.businessTypeIcon ? facilityData.businessTypeIcon.replace(/_/g, '-') : 'business')}
                size={20} 
                color={facilityData.businessTypeColor || facilityData.color || '#085924'} 
                style={styles.businessTypeIcon}
              />
              <Text style={styles.infoValue}>{facilityData.businessTypeName}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Người đại diện:</Text>
            <Text style={styles.infoValue}>{facilityData.representativeName}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{facilityData.phoneNumber}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{facilityData.email || 'Chưa có'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={styles.infoValue}>{facilityData.website || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>URL mạng xã hội:</Text>
            <Text style={styles.infoValue}>{facilityData.socialMediaUrl || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ngày thành lập:</Text>
            <Text style={styles.infoValue}>{formatDate(facilityData.establishedDate) || 'Chưa có'}</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tỉnh/thành phố:</Text>
            <Text style={styles.infoValue}>{facilityData.provinceName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Quận/huyện:</Text>
            <Text style={styles.infoValue}>{facilityData.districtName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phường/xã:</Text>
            <Text style={styles.infoValue}>{facilityData.wardName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Địa chỉ chi tiết:</Text>
            <Text style={styles.infoValue}>{facilityData.addressDetail}</Text>
          </View>

          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateItem}>
              <Text style={styles.infoLabel}>Vĩ độ:</Text>
              <Text style={styles.infoValue}>{facilityData.latitude || 'Chưa có'}</Text>
            </View>

            <View style={styles.coordinateItem}>
              <Text style={styles.infoLabel}>Kinh độ:</Text>
              <Text style={styles.infoValue}>{facilityData.longitude || 'Chưa có'}</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.infoLabel}>Cơ sở chính:</Text>
              <View style={styles.statusValue}>
                <Ionicons 
                  name={facilityData.isMainBranch ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={facilityData.isMainBranch ? "#085924" : "#dc3545"} 
                />
                <Text style={[
                  styles.statusText,
                  { color: facilityData.isMainBranch ? "#085924" : "#dc3545" }
                ]}>
                  {facilityData.isMainBranch ? "Có" : "Không"}
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.infoLabel}>Đang hoạt động:</Text>
              <View style={styles.statusValue}>
                <Ionicons 
                  name={facilityData.isActive ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={facilityData.isActive ? "#085924" : "#dc3545"} 
                />
                <Text style={[
                  styles.statusText,
                  { color: facilityData.isActive ? "#085924" : "#dc3545" }
                ]}>
                  {facilityData.isActive ? "Có" : "Không"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditFacility}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
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
  header: {
    backgroundColor: '#085924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  businessTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessTypeIcon: {
    marginRight: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    width: '48%',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
});

export default BusinessFacilityDetailScreen; 