import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BusinessBranchService from '../../services/BusinessBranchService';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';

const EditBusinessFacilityScreen = ({ route, navigation }) => {
  const { facilityId, facility: initialFacility } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const scrollViewRef = useRef(null);
  
  const [formData, setFormData] = useState({
    id: '',
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

  // Hàm chuyển đổi ngày từ API (ISO) sang DD/MM/YYYY
  const formatDateForForm = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Hàm chuyển đổi ngày từ DD/MM/YYYY sang YYYY-MM-DDT00:00:00
  const parseDateForApi = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    try {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      // Validate parts are numbers
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      
      // Check date validity
      if (day < 1 || day > 31 || month < 1 || month > 12) return null;
      
      return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        if (!facilityId && !initialFacility) return;
        
        setInitialLoading(true);
        
        let facilityData = initialFacility;
        
        // If we have an ID but no facility object, fetch from API
        if (facilityId && !initialFacility) {
          const response = await BusinessBranchService.get(facilityId);
          facilityData = response;
        }
        
        if (facilityData) {
          // Transform API data to form format
          setFormData({
            id: facilityData.id || '',
            branchName: facilityData.branchName || facilityData.name || '',
            addressDetail: facilityData.addressDetail || facilityData.address || '',
            businessCode: facilityData.businessCode || facilityData.licenseNumber || '',
            businessTypeId: facilityData.businessTypeId || '',
            businessTypeName: facilityData.businessTypeName || facilityData.businessType || '',
            establishedDate: facilityData.establishedDate ? formatDateForForm(facilityData.establishedDate) : 
                           facilityData.operationDate || '',
            deactivationDate: facilityData.deactivationDate ? formatDateForForm(facilityData.deactivationDate) : 
                             facilityData.expiryDate || '',
            representativeName: facilityData.representativeName || facilityData.owner || '',
            phoneNumber: facilityData.phoneNumber || facilityData.contactPhone || '',
            email: facilityData.email || facilityData.contactEmail || '',
            website: facilityData.website || '',
            area: facilityData.area ? facilityData.area.toString().replace('m²', '') : '',
            isActive: facilityData.isActive !== undefined ? facilityData.isActive : 
                     facilityData.status === 'Hoạt động',
          });
        }
      } catch (err) {
        console.error('Error fetching facility details:', err);
        showError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchFacilityDetails();
  }, [facilityId, initialFacility]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate name
    if (!formData.branchName || !formData.branchName.trim()) {
      newErrors.branchName = 'Vui lòng nhập tên cơ sở';
      isValid = false;
    }

    // Validate address
    if (!formData.addressDetail || !formData.addressDetail.trim()) {
      newErrors.addressDetail = 'Vui lòng nhập địa chỉ';
      isValid = false;
    }

    // Validate business code
    if (!formData.businessCode || !formData.businessCode.trim()) {
      newErrors.businessCode = 'Vui lòng nhập số giấy phép';
      isValid = false;
    }

    // Validate business type
    if (!formData.businessTypeName || !formData.businessTypeName.trim()) {
      newErrors.businessTypeName = 'Vui lòng nhập loại hình kinh doanh';
      isValid = false;
    }

    // Validate owner
    if (!formData.representativeName || !formData.representativeName.trim()) {
      newErrors.representativeName = 'Vui lòng nhập tên chủ sở hữu';
      isValid = false;
    }

    // Validate phone (more comprehensive validation)
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^(0|\+84)([0-9]{9,10})$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (Vui lòng nhập số điện thoại Việt Nam)';
      isValid = false;
    }

    // Validate email (more comprehensive validation)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Địa chỉ email không hợp lệ';
        isValid = false;
      }
    }

    // Validate dates (more comprehensive format validation)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    
    if (formData.establishedDate && formData.establishedDate.trim()) {
      if (!dateRegex.test(formData.establishedDate)) {
        newErrors.establishedDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
        isValid = false;
      } else {
        // Validate if date is valid
        const [day, month, year] = formData.establishedDate.split('/');
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== parseInt(day) || 
            date.getMonth() !== parseInt(month) - 1 || 
            date.getFullYear() !== parseInt(year)) {
          newErrors.establishedDate = 'Ngày không hợp lệ';
          isValid = false;
        }
      }
    }
    
    if (formData.deactivationDate && formData.deactivationDate.trim()) {
      if (!dateRegex.test(formData.deactivationDate)) {
        newErrors.deactivationDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
        isValid = false;
      } else {
        // Validate if date is valid
        const [day, month, year] = formData.deactivationDate.split('/');
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== parseInt(day) || 
            date.getMonth() !== parseInt(month) - 1 || 
            date.getFullYear() !== parseInt(year)) {
          newErrors.deactivationDate = 'Ngày không hợp lệ';
          isValid = false;
        }
        
        // Check if deactivation date is after established date
        if (formData.establishedDate && formData.establishedDate.trim() && dateRegex.test(formData.establishedDate)) {
          const [estDay, estMonth, estYear] = formData.establishedDate.split('/');
          const estDate = new Date(estYear, estMonth - 1, estDay);
          
          if (date < estDate) {
            newErrors.deactivationDate = 'Ngày hết hạn phải sau ngày hoạt động';
            isValid = false;
          }
        }
      }
    }

    // Validate website format if provided
    if (formData.website && formData.website.trim()) {
      const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!websiteRegex.test(formData.website.trim())) {
        newErrors.website = 'URL website không hợp lệ';
        isValid = false;
      }
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (!isValid && scrollViewRef.current) {
      // For this to work properly in a real app, we'd need refs for each input field
      // For now, we'll just scroll to the top to make errors visible
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Validate ID exists
        if (!formData.id) {
          throw new Error('Không tìm thấy ID cơ sở kinh doanh');
        }
        
        // Prepare data for API
        const branchData = {
          id: formData.id,
          branchName: formData.branchName.trim(),
          addressDetail: formData.addressDetail.trim(),
          businessCode: formData.businessCode.trim(),
          businessTypeId: formData.businessTypeId || null,
          businessTypeName: formData.businessTypeName.trim(),
          establishedDate: parseDateForApi(formData.establishedDate),
          deactivationDate: parseDateForApi(formData.deactivationDate),
          representativeName: formData.representativeName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email ? formData.email.trim() : null,
          website: formData.website ? formData.website.trim() : null,
          isActive: formData.isActive,
          status: formData.isActive ? 'Hoạt động' : 'Không hoạt động',
        };
        
        // Call API to update
        await BusinessBranchService.updateByBusiness(branchData);
        
        setLoading(false);
        
        // Show success message with confirmation popup
        showConfirmation({
          title: 'Thành công',
          message: 'Thông tin cơ sở kinh doanh đã được cập nhật thành công',
          confirmText: 'OK',
          onConfirm: () => navigation.navigate('BusinessFacilityDetail', { 
            facilityId: formData.id,
            refresh: true 
          }),
          onCancel: () => {},
          cancelText: '',
        });
      } catch (err) {
        console.error('Error updating business facility:', err);
        setLoading(false);
        
        // Show more specific error message if available
        let errorMessage = 'Không thể cập nhật thông tin cơ sở kinh doanh. Vui lòng thử lại sau.';
        
        if (err.response && err.response.data) {
          if (err.response.data.error && err.response.data.error.message) {
            errorMessage = err.response.data.error.message;
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        showError(errorMessage);
      }
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

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
        <Text style={styles.headerTitle}>Chỉnh sửa cơ sở kinh doanh</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.content}
        ref={scrollViewRef}
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên cơ sở*</Text>
            <TextInput
              style={[styles.input, errors.branchName && styles.inputError]}
              placeholder="Nhập tên cơ sở"
              value={formData.branchName}
              onChangeText={(text) => handleInputChange('branchName', text)}
              name="branchName"
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
              name="businessCode"
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
              name="businessTypeName"
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
                name="establishedDate"
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
                name="deactivationDate"
              />
              {errors.deactivationDate && <Text style={styles.errorText}>{errors.deactivationDate}</Text>}
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.inputLabel}>Trạng thái</Text>
            <View style={styles.statusOptions}>
              <TouchableOpacity 
                style={[
                  styles.statusOption, 
                  formData.isActive === true && styles.activeStatusOption
                ]}
                onPress={() => handleInputChange('isActive', true)}
              >
                <Text style={styles.statusOptionText}>Hoạt động</Text>
                {formData.isActive === true && (
                  <Ionicons name="checkmark-circle" size={20} color="#085924" />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.statusOption, 
                  formData.isActive === false && styles.inactiveStatusOption
                ]}
                onPress={() => handleInputChange('isActive', false)}
              >
                <Text style={styles.statusOptionText}>Không hoạt động</Text>
                {formData.isActive === false && (
                  <Ionicons name="checkmark-circle" size={20} color="#dc3545" />
                )}
              </TouchableOpacity>
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
              name="addressDetail"
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
              name="area"
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
              name="representativeName"
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
              name="phoneNumber"
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
              name="email"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={[styles.input, errors.website && styles.inputError]}
              placeholder="Nhập địa chỉ website"
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              autoCapitalize="none"
              name="website"
            />
            {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
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
              <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
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
  statusContainer: {
    marginTop: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  activeStatusOption: {
    borderColor: '#085924',
    backgroundColor: '#e0f2e9',
  },
  inactiveStatusOption: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  statusOptionText: {
    fontSize: 15,
    color: '#333',
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

export default EditBusinessFacilityScreen; 