import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BusinessBranchService from '../../services/BusinessBranchService';

const AddBusinessFacilityScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    branchName: '',
    addressDetail: '',
    businessCode: '',
    businessTypeId: '',
    businessTypeName: '',
    establishedDate: '',
    deactivationDate: '',
    representativeName: '',
    phoneNumber: '',
    email: '',
    website: '',
    area: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hàm chuyển đổi ngày từ DD/MM/YYYY sang YYYY-MM-DDT00:00:00
  const parseDateForApi = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate name
    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Vui lòng nhập tên cơ sở';
      isValid = false;
    }

    // Validate address
    if (!formData.addressDetail.trim()) {
      newErrors.addressDetail = 'Vui lòng nhập địa chỉ';
      isValid = false;
    }

    // Validate business code
    if (!formData.businessCode.trim()) {
      newErrors.businessCode = 'Vui lòng nhập số giấy phép';
      isValid = false;
    }

    // Validate business type
    if (!formData.businessTypeName.trim()) {
      newErrors.businessTypeName = 'Vui lòng nhập loại hình kinh doanh';
      isValid = false;
    }

    // Validate owner
    if (!formData.representativeName.trim()) {
      newErrors.representativeName = 'Vui lòng nhập tên chủ sở hữu';
      isValid = false;
    }

    // Validate phone (simple validation)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Validate email (simple validation)
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
      isValid = false;
    }

    // Validate dates (simple format validation)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    
    if (formData.establishedDate.trim() && !dateRegex.test(formData.establishedDate)) {
      newErrors.establishedDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
      isValid = false;
    }
    
    if (formData.deactivationDate.trim() && !dateRegex.test(formData.deactivationDate)) {
      newErrors.deactivationDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Prepare data for API
        const branchData = {
          branchName: formData.branchName,
          addressDetail: formData.addressDetail,
          businessCode: formData.businessCode,
          businessTypeId: formData.businessTypeId || null,
          businessTypeName: formData.businessTypeName,
          establishedDate: parseDateForApi(formData.establishedDate),
          deactivationDate: parseDateForApi(formData.deactivationDate),
          representativeName: formData.representativeName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          website: formData.website,
          isActive: true,
          status: 'Hoạt động',
        };
        
        // Call API to create
        const result = await BusinessBranchService.create(branchData);
        
        setLoading(false);
        
        // Show success message
        Alert.alert(
          'Thành công',
          'Cơ sở kinh doanh đã được tạo thành công',
          [
            {
              text: 'OK',
              onPress: () => {
                if (result && result.id) {
                  navigation.navigate('BusinessFacilityDetail', { facilityId: result.id });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } catch (err) {
        console.error('Error creating business facility:', err);
        setLoading(false);
        Alert.alert('Lỗi', 'Không thể tạo cơ sở kinh doanh. Vui lòng thử lại sau.');
      }
    } else {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear the error for this field when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm cơ sở kinh doanh mới</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên cơ sở*</Text>
            <TextInput
              style={[styles.input, errors.branchName && styles.inputError]}
              placeholder="Nhập tên cơ sở"
              value={formData.branchName}
              onChangeText={(text) => handleInputChange('branchName', text)}
            />
            {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số giấy phép*</Text>
            <TextInput
              style={[styles.input, errors.businessCode && styles.inputError]}
              placeholder="Nhập số giấy phép"
              value={formData.businessCode}
              onChangeText={(text) => handleInputChange('businessCode', text)}
            />
            {errors.businessCode && <Text style={styles.errorText}>{errors.businessCode}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loại hình kinh doanh*</Text>
            <TextInput
              style={[styles.input, errors.businessTypeName && styles.inputError]}
              placeholder="Nhập loại hình kinh doanh"
              value={formData.businessTypeName}
              onChangeText={(text) => handleInputChange('businessTypeName', text)}
            />
            {errors.businessTypeName && <Text style={styles.errorText}>{errors.businessTypeName}</Text>}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hoạt động</Text>
              <TextInput
                style={[styles.input, errors.establishedDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.establishedDate}
                onChangeText={(text) => handleInputChange('establishedDate', text)}
              />
              {errors.establishedDate && <Text style={styles.errorText}>{errors.establishedDate}</Text>}
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hết hạn</Text>
              <TextInput
                style={[styles.input, errors.deactivationDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.deactivationDate}
                onChangeText={(text) => handleInputChange('deactivationDate', text)}
              />
              {errors.deactivationDate && <Text style={styles.errorText}>{errors.deactivationDate}</Text>}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Địa điểm</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ*</Text>
            <TextInput
              style={[styles.input, errors.addressDetail && styles.inputError]}
              placeholder="Nhập địa chỉ cơ sở"
              value={formData.addressDetail}
              onChangeText={(text) => handleInputChange('addressDetail', text)}
              multiline
            />
            {errors.addressDetail && <Text style={styles.errorText}>{errors.addressDetail}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Diện tích (m²)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập diện tích"
              value={formData.area}
              onChangeText={(text) => handleInputChange('area', text)}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.mapButtonText}>Chọn vị trí trên bản đồ</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên chủ sở hữu*</Text>
            <TextInput
              style={[styles.input, errors.representativeName && styles.inputError]}
              placeholder="Nhập tên chủ sở hữu"
              value={formData.representativeName}
              onChangeText={(text) => handleInputChange('representativeName', text)}
            />
            {errors.representativeName && <Text style={styles.errorText}>{errors.representativeName}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại*</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="Nhập số điện thoại"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ website"
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              autoCapitalize="none"
            />
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Thêm cơ sở</Text>
            )}
          </TouchableOpacity>
        </View>
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
  placeholder: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
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
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  mapButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#085924',
    borderRadius: 8,
    padding: 14,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#085924',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 14,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddBusinessFacilityScreen; 