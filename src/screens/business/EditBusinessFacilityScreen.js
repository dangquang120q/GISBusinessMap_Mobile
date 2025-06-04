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
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import BusinessBranchService from '../../services/BusinessBranchService';
import BusinessTypeCatalogService from '../../services/BusinessTypeCatalogService';
import LocationService from '../../services/LocationService';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';

const EditBusinessFacilityScreen = ({ route, navigation }) => {
  const { facilityId, facility: initialFacility } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollViewRef = useRef(null);
  
  const [formData, setFormData] = useState({
    id: '',
    branchName: '',
    businessTypeId: null,
    businessTypeName: '',
    businessTypeIcon: '',
    businessTypeColor: '',
    representativeName: '',
    phoneNumber: '',
    email: '',
    website: '',
    socialMediaUrl: '',
    establishedDate: '',
    deactivationDate: '',
    provinceId: null,
    provinceName: '',
    districtId: null,
    districtName: '',
    wardId: null,
    wardName: '',
    addressDetail: '',
    latitude: '',
    longitude: '',
    isMainBranch: false,
    isActive: true,
  });

  // States for dropdown data
  const [businessTypes, setBusinessTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // States for dropdown modals
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isDeactivationDatePickerVisible, setDeactivationDatePickerVisible] = useState(false);

  const [errors, setErrors] = useState({});

  // Format date from API (ISO) to DD/MM/YYYY
  const formatDateForForm = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DDT00:00:00
  const parseDateForApi = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    try {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      if (day < 1 || day > 31 || month < 1 || month > 12) return null;
      
      return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Load facility data
        let facilityData = initialFacility;
        if (facilityId && !initialFacility) {
          const response = await BusinessBranchService.get(facilityId);
          facilityData = response;
        }

        // Load dropdown data
        const [businessTypesResponse, provincesResponse] = await Promise.all([
          BusinessTypeCatalogService.getList(),
          LocationService.getCities()
        ]);

        setBusinessTypes(businessTypesResponse.result);
        setProvinces(provincesResponse.result);

        if (facilityData) {
          // Transform API data to form format
          setFormData({
            id: facilityData.id || '',
            branchName: facilityData.branchName || facilityData.name || '',
            businessTypeId: facilityData.businessTypeId || null,
            businessTypeName: facilityData.businessTypeName || facilityData.businessType || '',
            businessTypeIcon: facilityData.businessTypeIcon || 'business',
            businessTypeColor: facilityData.businessTypeColor || '#085924',
            representativeName: facilityData.representativeName || facilityData.owner || '',
            phoneNumber: facilityData.phoneNumber || facilityData.contactPhone || '',
            email: facilityData.email || facilityData.contactEmail || '',
            website: facilityData.website || '',
            socialMediaUrl: facilityData.socialMediaUrl || '',
            establishedDate: facilityData.establishedDate ? formatDateForForm(facilityData.establishedDate) : '',
            deactivationDate: facilityData.deactivationDate ? formatDateForForm(facilityData.deactivationDate) : '',
            provinceId: facilityData.provinceId || null,
            provinceName: facilityData.provinceName || '',
            districtId: facilityData.districtId || null,
            districtName: facilityData.districtName || '',
            wardId: facilityData.wardId || null,
            wardName: facilityData.wardName || '',
            addressDetail: facilityData.addressDetail || facilityData.address || '',
            latitude: facilityData.latitude || '',
            longitude: facilityData.longitude || '',
            isMainBranch: facilityData.isMainBranch || false,
            isActive: facilityData.isActive !== undefined ? facilityData.isActive : 
                     facilityData.status === 'Hoạt động',
          });

          // Load districts if province is selected
          if (facilityData.provinceId) {
            const districtsResponse = await LocationService.getDistricts(facilityData.provinceId);
            setDistricts(districtsResponse.result);

            // Load wards if district is selected
            if (facilityData.districtId) {
              const wardsResponse = await LocationService.getWards(facilityData.districtId);
              setWards(wardsResponse.result);
            }
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        showError('Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [facilityId, initialFacility]);

  // Load districts when province changes
  useEffect(() => {
    if (formData.provinceId) {
      const loadDistricts = async () => {
        try {
          const response = await LocationService.getDistricts(formData.provinceId);
          setDistricts(response.result);
          // Clear district and ward selection
          setFormData(prev => ({
            ...prev,
            districtId: null,
            districtName: '',
            wardId: null,
            wardName: ''
          }));
        } catch (error) {
          console.error('Error loading districts:', error);
          showError('Không thể tải danh sách quận/huyện');
        }
      };

      loadDistricts();
    }
  }, [formData.provinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtId) {
      const loadWards = async () => {
        try {
          const response = await LocationService.getWards(formData.districtId);
          setWards(response.result);
          // Clear ward selection
          setFormData(prev => ({
            ...prev,
            wardId: null,
            wardName: ''
          }));
        } catch (error) {
          console.error('Error loading wards:', error);
          showError('Không thể tải danh sách phường/xã');
        }
      };

      loadWards();
    }
  }, [formData.districtId]);

  const handleDateConfirm = (date) => {
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    handleInputChange('establishedDate', formattedDate);
    setDatePickerVisible(false);
  };

  const handleDeactivationDateConfirm = (date) => {
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    handleInputChange('deactivationDate', formattedDate);
    setDeactivationDatePickerVisible(false);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Required fields validation
    const requiredFields = {
      branchName: 'Tên cơ sở/chi nhánh',
      businessTypeId: 'Loại hình kinh doanh',
      representativeName: 'Người đại diện',
      phoneNumber: 'Số điện thoại',
      provinceId: 'Tỉnh/thành phố',
      districtId: 'Quận/huyện',
      wardId: 'Phường/xã',
      addressDetail: 'Địa chỉ chi tiết'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `Vui lòng nhập ${requiredFields[field]}`;
        isValid = false;
      }
    });

    // Phone number validation
    if (formData.phoneNumber && !/^(0|\+84)([0-9]{9,10})$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Date validation
    if (formData.establishedDate) {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(formData.establishedDate)) {
        newErrors.establishedDate = 'Ngày không hợp lệ (DD/MM/YYYY)';
        isValid = false;
      }
    }

    if (formData.deactivationDate) {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(formData.deactivationDate)) {
        newErrors.deactivationDate = 'Ngày không hợp lệ (DD/MM/YYYY)';
        isValid = false;
      }

      // Check if deactivation date is after established date
      if (formData.establishedDate && dateRegex.test(formData.establishedDate)) {
        const [estDay, estMonth, estYear] = formData.establishedDate.split('/');
        const [deactDay, deactMonth, deactYear] = formData.deactivationDate.split('/');
        const estDate = new Date(estYear, estMonth - 1, estDay);
        const deactDate = new Date(deactYear, deactMonth - 1, deactDay);
        
        if (deactDate < estDate) {
          newErrors.deactivationDate = 'Ngày hết hạn phải sau ngày thành lập';
          isValid = false;
        }
      }
    }

    // URL validations
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.website && !urlRegex.test(formData.website)) {
      newErrors.website = 'Website không hợp lệ';
      isValid = false;
    }
    if (formData.socialMediaUrl && !urlRegex.test(formData.socialMediaUrl)) {
      newErrors.socialMediaUrl = 'URL mạng xã hội không hợp lệ';
      isValid = false;
    }
        
    // Coordinates validation
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Vĩ độ không hợp lệ';
      isValid = false;
    }
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Kinh độ không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
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
          businessTypeId: formData.businessTypeId,
          businessTypeName: formData.businessTypeName.trim(),
          businessTypeIcon: formData.businessTypeIcon,
          businessTypeColor: formData.businessTypeColor,
          representativeName: formData.representativeName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email ? formData.email.trim() : null,
          website: formData.website ? formData.website.trim() : null,
          socialMediaUrl: formData.socialMediaUrl ? formData.socialMediaUrl.trim() : null,
          establishedDate: parseDateForApi(formData.establishedDate),
          deactivationDate: parseDateForApi(formData.deactivationDate),
          provinceId: formData.provinceId,
          provinceName: formData.provinceName,
          districtId: formData.districtId,
          districtName: formData.districtName,
          wardId: formData.wardId,
          wardName: formData.wardName,
          addressDetail: formData.addressDetail.trim(),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          isMainBranch: formData.isMainBranch,
          isActive: formData.isActive,
          status: formData.isActive ? 'Hoạt động' : 'Không hoạt động',
        };
        
        // Call API to update
        await BusinessBranchService.updateByBusiness(branchData);
        
        showSuccess('Cập nhật cơ sở kinh doanh thành công');
        navigation.goBack();
      } catch (err) {
        console.error('Error updating business facility:', err);
        showError('Không thể cập nhật cơ sở kinh doanh. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Render dropdown item
  const renderDropdownItem = ({ item, onSelect, nameField, valueField = 'id' }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => onSelect(item)}
    >
      <View style={styles.dropdownItemContent}>
        {item.businessTypeIcon && (
          <MaterialIcons 
            name={(item.businessTypeIcon ? item.businessTypeIcon.replace(/_/g, '-') : 'business')}
            size={24} 
            color={item.color} 
            style={styles.dropdownItemIcon}
          />
        )}
        <Text style={styles.dropdownItemText}>{item[nameField]}</Text>
      </View>
    </TouchableOpacity>
  );

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#085924" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
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
      </View>
      
      <ScrollView style={styles.content}>
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên cơ sở/chi nhánh *</Text>
            <TextInput
              style={[styles.input, errors.branchName && styles.inputError]}
              value={formData.branchName}
              onChangeText={(text) => handleInputChange('branchName', text)}
              placeholder="Nhập tên cơ sở/chi nhánh"
            />
            {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loại hình kinh doanh *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => setShowBusinessTypeModal(true)}
            >
              <View style={styles.dropdownButtonContent}>
                {formData.businessTypeIcon && (
                  <MaterialIcons 
                    name={(formData.businessTypeIcon ? formData.businessTypeIcon.replace(/_/g, '-') : 'business')}
                    size={20} 
                    color={formData.businessTypeColor} 
                    style={styles.dropdownButtonIcon}
                  />
                )}
                <Text style={formData.businessTypeName ? styles.dropdownButtonText : styles.placeholderText}>
                  {formData.businessTypeName || 'Chọn loại hình kinh doanh'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.businessTypeId && <Text style={styles.errorText}>{errors.businessTypeId}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Người đại diện *</Text>
            <TextInput
              style={[styles.input, errors.representativeName && styles.inputError]}
              value={formData.representativeName}
              onChangeText={(text) => handleInputChange('representativeName', text)}
              placeholder="Nhập tên người đại diện"
            />
            {errors.representativeName && <Text style={styles.errorText}>{errors.representativeName}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={[styles.input, errors.website && styles.inputError]}
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              placeholder="Nhập website"
              autoCapitalize="none"
            />
            {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL mạng xã hội</Text>
            <TextInput
              style={[styles.input, errors.socialMediaUrl && styles.inputError]}
              value={formData.socialMediaUrl}
              onChangeText={(text) => handleInputChange('socialMediaUrl', text)}
              placeholder="Nhập URL mạng xã hội"
              autoCapitalize="none"
            />
            {errors.socialMediaUrl && <Text style={styles.errorText}>{errors.socialMediaUrl}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ngày thành lập</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, errors.establishedDate && styles.inputError]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={formData.establishedDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.establishedDate || 'Chọn ngày thành lập'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              {errors.establishedDate && <Text style={styles.errorText}>{errors.establishedDate}</Text>}
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ngày hết hạn</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, errors.deactivationDate && styles.inputError]}
                onPress={() => setDeactivationDatePickerVisible(true)}
              >
                <Text style={formData.deactivationDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.deactivationDate || 'Chọn ngày hết hạn'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              {errors.deactivationDate && <Text style={styles.errorText}>{errors.deactivationDate}</Text>}
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tỉnh/thành phố *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => setShowProvinceModal(true)}
            >
              <Text style={formData.provinceName ? styles.dropdownButtonText : styles.placeholderText}>
                {formData.provinceName || 'Chọn tỉnh/thành phố'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.provinceId && <Text style={styles.errorText}>{errors.provinceId}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quận/huyện *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => formData.provinceId && setShowDistrictModal(true)}
              disabled={!formData.provinceId}
            >
              <Text style={formData.districtName ? styles.dropdownButtonText : styles.placeholderText}>
                {formData.districtName || 'Chọn quận/huyện'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.districtId && <Text style={styles.errorText}>{errors.districtId}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phường/xã *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => formData.districtId && setShowWardModal(true)}
              disabled={!formData.districtId}
            >
              <Text style={formData.wardName ? styles.dropdownButtonText : styles.placeholderText}>
                {formData.wardName || 'Chọn phường/xã'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.wardId && <Text style={styles.errorText}>{errors.wardId}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Địa chỉ chi tiết *</Text>
            <TextInput
              style={[styles.input, errors.addressDetail && styles.inputError]}
              value={formData.addressDetail}
              onChangeText={(text) => handleInputChange('addressDetail', text)}
              placeholder="Nhập địa chỉ chi tiết"
              multiline
            />
            {errors.addressDetail && <Text style={styles.errorText}>{errors.addressDetail}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Vĩ độ</Text>
              <TextInput
                style={[styles.input, errors.latitude && styles.inputError]}
                value={formData.latitude}
                onChangeText={(text) => handleInputChange('latitude', text)}
                placeholder="Nhập vĩ độ"
                keyboardType="numeric"
              />
              {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Kinh độ</Text>
              <TextInput
                style={[styles.input, errors.longitude && styles.inputError]}
                value={formData.longitude}
                onChangeText={(text) => handleInputChange('longitude', text)}
                placeholder="Nhập kinh độ"
                keyboardType="numeric"
              />
              {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Cơ sở chính</Text>
            <Switch
              value={formData.isMainBranch}
              onValueChange={(value) => handleInputChange('isMainBranch', value)}
              trackColor={{ false: '#767577', true: '#085924' }}
              thumbColor={formData.isMainBranch ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Đang hoạt động</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => handleInputChange('isActive', value)}
              trackColor={{ false: '#767577', true: '#085924' }}
              thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
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

      {/* Business Type Modal */}
      <Modal
        visible={showBusinessTypeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại hình kinh doanh</Text>
              <TouchableOpacity
                onPress={() => setShowBusinessTypeModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={businessTypes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selected) => {
                  handleInputChange('businessTypeId', selected.id);
                  handleInputChange('businessTypeName', selected.businessTypeName);
                  handleInputChange('businessTypeIcon', selected.businessTypeIcon);
                  handleInputChange('businessTypeColor', selected.color);
                  setShowBusinessTypeModal(false);
                },
                nameField: 'businessTypeName'
              })}
            />
          </View>
        </View>
      </Modal>

      {/* Province Modal */}
      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
              <TouchableOpacity
                onPress={() => setShowProvinceModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={provinces}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selected) => {
                  handleInputChange('provinceId', selected.id);
                  handleInputChange('provinceName', selected.provinceName);
                  setShowProvinceModal(false);
                },
                nameField: 'provinceName'
              })}
            />
          </View>
        </View>
      </Modal>

      {/* District Modal */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn quận/huyện</Text>
              <TouchableOpacity
                onPress={() => setShowDistrictModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selected) => {
                  handleInputChange('districtId', selected.id);
                  handleInputChange('districtName', selected.districtName);
                  setShowDistrictModal(false);
                },
                nameField: 'districtName'
              })}
            />
          </View>
        </View>
      </Modal>

      {/* Ward Modal */}
      <Modal
        visible={showWardModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phường/xã</Text>
              <TouchableOpacity
                onPress={() => setShowWardModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={wards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selected) => {
                  handleInputChange('wardId', selected.id);
                  handleInputChange('wardName', selected.wardName);
                  setShowWardModal(false);
                },
                nameField: 'wardName'
              })}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày thành lập</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <DatePicker
                date={formData.establishedDate ? new Date(formData.establishedDate.split('/').reverse().join('-')) : new Date()}
                onDateChange={handleDateConfirm}
                mode="date"
                locale="vi"
                maximumDate={new Date()}
                androidVariant="nativeAndroid"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Deactivation Date Picker Modal */}
      <Modal
        visible={isDeactivationDatePickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày hết hạn</Text>
              <TouchableOpacity
                onPress={() => setDeactivationDatePickerVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <DatePicker
                date={formData.deactivationDate ? new Date(formData.deactivationDate.split('/').reverse().join('-')) : new Date()}
                onDateChange={handleDeactivationDateConfirm}
                mode="date"
                locale="vi"
                minimumDate={formData.establishedDate ? new Date(formData.establishedDate.split('/').reverse().join('-')) : new Date()}
                androidVariant="nativeAndroid"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#085924',
    borderRadius: 8,
    padding: 15,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#085924',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 15,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonIcon: {
    marginRight: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerContainer: {
    padding: 16,
    alignItems: 'center',
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
});

export default EditBusinessFacilityScreen; 