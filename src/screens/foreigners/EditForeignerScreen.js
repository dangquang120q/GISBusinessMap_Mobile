import React, { useState, useEffect } from 'react';
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
import ForeignersService from '../../services/ForeignersService';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';

const EditForeignerScreen = ({ route, navigation }) => {
  const { foreignerId, foreigner: initialForeigner } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Status constants
  const STATUS_ACTIVE = 'Đang hoạt động';
  const STATUS_PENDING = 'Chờ xác nhận';
  const STATUS_EXPIRED = 'Hết hạn';
  
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    passportNumber: '',
    countryName: '',
    gender: '',
    dateOfBirth: '',
    entryDate: '',
    visaExpiryDate: '',
    phoneNumber: '',
    stayAddress: '',
    jobTitle: '',
    workplace: '',
    visaNumber: '',
    visaType: '',
    visaIssuedDate: '',
    entryPort: '',
    email: '',
    workPermitNumber: '',
    workPermitExpiryDate: '',
    residenceCardNumber: '',
    residenceCardExpiry: '',
    notes: '',
    status: STATUS_PENDING,
  });

  // Function to format API date to DD/MM/YYYY for the form
  const formatDateForForm = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Function to parse DD/MM/YYYY to API format YYYY-MM-DD
  const parseDateForApi = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
  };

  // Load foreigner details on screen load
  useEffect(() => {
    const fetchForeignerDetails = async () => {
      try {
        if (!foreignerId && !initialForeigner) return;
        
        setInitialLoading(true);
        
        let foreignerData = initialForeigner;
        
        // If we have an ID but no foreigner object, fetch from API
        if (foreignerId && !initialForeigner) {
          const response = await ForeignersService.get(foreignerId);
          foreignerData = response;
        }
        
        if (foreignerData) {
          setFormData({
            id: foreignerData.id || '',
            fullName: foreignerData.fullName || '',
            passportNumber: foreignerData.passportNumber || '',
            countryName: foreignerData.countryName || '',
            gender: foreignerData.gender || '',
            dateOfBirth: foreignerData.dateOfBirth ? formatDateForForm(foreignerData.dateOfBirth) : '',
            entryDate: foreignerData.entryDate ? formatDateForForm(foreignerData.entryDate) : '',
            visaExpiryDate: foreignerData.visaExpiryDate ? formatDateForForm(foreignerData.visaExpiryDate) : '',
            phoneNumber: foreignerData.phoneNumber || '',
            stayAddress: foreignerData.stayAddress || '',
            jobTitle: foreignerData.jobTitle || '',
            workplace: foreignerData.workplace || '',
            visaNumber: foreignerData.visaNumber || '',
            visaType: foreignerData.visaType || '',
            visaIssuedDate: foreignerData.visaIssuedDate ? formatDateForForm(foreignerData.visaIssuedDate) : '',
            entryPort: foreignerData.entryPort || '',
            email: foreignerData.email || '',
            workPermitNumber: foreignerData.workPermitNumber || '',
            workPermitExpiryDate: foreignerData.workPermitExpiryDate ? formatDateForForm(foreignerData.workPermitExpiryDate) : '',
            residenceCardNumber: foreignerData.residenceCardNumber || '',
            residenceCardExpiry: foreignerData.residenceCardExpiry ? formatDateForForm(foreignerData.residenceCardExpiry) : '',
            notes: foreignerData.notes || '',
            status: foreignerData.status || STATUS_PENDING,
          });
        }
      } catch (err) {
        console.error('Error fetching foreigner details:', err);
        showError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchForeignerDetails();
  }, [foreignerId, initialForeigner]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate fullName
    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập tên người nước ngoài';
      isValid = false;
    }

    // Validate passportNumber
    if (!formData.passportNumber || !formData.passportNumber.trim()) {
      newErrors.passportNumber = 'Vui lòng nhập số hộ chiếu';
      isValid = false;
    }

    // Validate countryName
    if (!formData.countryName || !formData.countryName.trim()) {
      newErrors.countryName = 'Vui lòng nhập quốc tịch';
      isValid = false;
    }

    // Validate phoneNumber (improved validation)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^(0|\+84)([0-9]{9,10})$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ (Vui lòng nhập số điện thoại Việt Nam)';
        isValid = false;
      }
    }

    // Validate email (more comprehensive validation)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
    }

    // Validate dates (more comprehensive format validation)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    
    // Helper function to validate date
    const validateDate = (dateField, errorMessage) => {
      if (formData[dateField] && formData[dateField].trim()) {
        if (!dateRegex.test(formData[dateField])) {
          newErrors[dateField] = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
          isValid = false;
        } else {
          // Validate if date is valid
          const [day, month, year] = formData[dateField].split('/');
          const date = new Date(year, month - 1, day);
          if (date.getDate() !== parseInt(day) || 
              date.getMonth() !== parseInt(month) - 1 || 
              date.getFullYear() !== parseInt(year)) {
            newErrors[dateField] = 'Ngày không hợp lệ';
            isValid = false;
          }
          
          // Additional validation based on field
          if (dateField === 'dateOfBirth') {
            const today = new Date();
            if (date > today) {
              newErrors[dateField] = 'Ngày sinh không thể sau ngày hiện tại';
              isValid = false;
            }
          }
        }
      }
    };
    
    // Validate all date fields
    validateDate('entryDate', 'Định dạng ngày nhập cảnh không hợp lệ');
    validateDate('visaExpiryDate', 'Định dạng ngày hết hạn visa không hợp lệ');
    validateDate('dateOfBirth', 'Định dạng ngày sinh không hợp lệ');
    validateDate('visaIssuedDate', 'Định dạng ngày cấp visa không hợp lệ');
    validateDate('workPermitExpiryDate', 'Định dạng ngày hết hạn giấy phép lao động không hợp lệ');
    validateDate('residenceCardExpiry', 'Định dạng ngày hết hạn thẻ tạm trú không hợp lệ');
    
    // Validate relationships between dates
    if (!newErrors.visaIssuedDate && !newErrors.visaExpiryDate && 
        formData.visaIssuedDate && formData.visaExpiryDate) {
      const issuedParts = formData.visaIssuedDate.split('/');
      const expiryParts = formData.visaExpiryDate.split('/');
      
      const issuedDate = new Date(issuedParts[2], issuedParts[1] - 1, issuedParts[0]);
      const expiryDate = new Date(expiryParts[2], expiryParts[1] - 1, expiryParts[0]);
      
      if (issuedDate >= expiryDate) {
        newErrors.visaExpiryDate = 'Ngày hết hạn visa phải sau ngày cấp';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Đảm bảo có ID trước khi cập nhật
        if (!formData.id) {
          throw new Error('Không tìm thấy ID người nước ngoài');
        }
        
        // Chuẩn bị dữ liệu cho API
        const foreignerData = {
          id: formData.id,
          fullName: formData.fullName.trim(),
          passportNumber: formData.passportNumber.trim(),
          gender: formData.gender,
          dateOfBirth: parseDateForApi(formData.dateOfBirth),
          countryName: formData.countryName.trim(),
          visaNumber: formData.visaNumber ? formData.visaNumber.trim() : null,
          visaType: formData.visaType ? formData.visaType.trim() : null,
          visaIssuedDate: parseDateForApi(formData.visaIssuedDate),
          visaExpiryDate: parseDateForApi(formData.visaExpiryDate),
          entryDate: parseDateForApi(formData.entryDate),
          entryPort: formData.entryPort ? formData.entryPort.trim() : null,
          stayAddress: formData.stayAddress ? formData.stayAddress.trim() : null,
          phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
          email: formData.email ? formData.email.trim() : null,
          workplace: formData.workplace ? formData.workplace.trim() : null,
          jobTitle: formData.jobTitle ? formData.jobTitle.trim() : null,
          workPermitNumber: formData.workPermitNumber ? formData.workPermitNumber.trim() : null,
          workPermitExpiryDate: parseDateForApi(formData.workPermitExpiryDate),
          residenceCardNumber: formData.residenceCardNumber ? formData.residenceCardNumber.trim() : null,
          residenceCardExpiry: parseDateForApi(formData.residenceCardExpiry),
          notes: formData.notes ? formData.notes.trim() : null,
          status: formData.status,
        };
        
        // Gọi API để cập nhật
        await ForeignersService.update(foreignerData);
        
        setLoading(false);
        
        // Hiển thị thông báo thành công
        showConfirmation({
          title: 'Thành công',
          message: 'Đã cập nhật thông tin người nước ngoài thành công',
          confirmText: 'OK',
          onConfirm: () => navigation.navigate('ForeignerDetail', { 
            foreignerId: formData.id,
            refresh: true 
          }),
          onCancel: () => navigation.navigate('ForeignerDetail', { 
            foreignerId: formData.id,
            refresh: true 
          }),
          cancelText: '',
        });
      } catch (err) {
        console.error('Error updating foreigner:', err);
        setLoading(false);
        
        // Hiển thị thông báo lỗi chi tiết hơn
        let errorMessage = 'Không thể cập nhật thông tin người nước ngoài. Vui lòng thử lại sau.';
        
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
    } else {
      showError('Vui lòng kiểm tra lại thông tin');
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
        <Text style={styles.headerTitle}>Chỉnh sửa người nước ngoài</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ tên*</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Nhập tên người nước ngoài"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số hộ chiếu*</Text>
            <TextInput
              style={[styles.input, errors.passportNumber && styles.inputError]}
              placeholder="Nhập số hộ chiếu"
              value={formData.passportNumber}
              onChangeText={(text) => handleInputChange('passportNumber', text)}
            />
            {errors.passportNumber && <Text style={styles.errorText}>{errors.passportNumber}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quốc tịch*</Text>
            <TextInput
              style={[styles.input, errors.countryName && styles.inputError]}
              placeholder="Nhập quốc tịch"
              value={formData.countryName}
              onChangeText={(text) => handleInputChange('countryName', text)}
            />
            {errors.countryName && <Text style={styles.errorText}>{errors.countryName}</Text>}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity 
                  style={[
                    styles.genderButton, 
                    formData.gender === 'Nam' && styles.activeGenderButton
                  ]}
                  onPress={() => handleInputChange('gender', 'Nam')}
                >
                  <Text 
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'Nam' && styles.activeGenderButtonText
                    ]}
                  >Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.genderButton, 
                    formData.gender === 'Nữ' && styles.activeGenderButton
                  ]}
                  onPress={() => handleInputChange('gender', 'Nữ')}
                >
                  <Text 
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'Nữ' && styles.activeGenderButtonText
                    ]}
                  >Nữ</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày sinh</Text>
              <TextInput
                style={[styles.input, errors.dateOfBirth && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleInputChange('dateOfBirth', text)}
              />
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin thị thực</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số thị thực</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số thị thực"
              value={formData.visaNumber}
              onChangeText={(text) => handleInputChange('visaNumber', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loại thị thực</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập loại thị thực"
              value={formData.visaType}
              onChangeText={(text) => handleInputChange('visaType', text)}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày cấp</Text>
              <TextInput
                style={[styles.input, errors.visaIssuedDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.visaIssuedDate}
                onChangeText={(text) => handleInputChange('visaIssuedDate', text)}
              />
              {errors.visaIssuedDate && <Text style={styles.errorText}>{errors.visaIssuedDate}</Text>}
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hết hạn</Text>
              <TextInput
                style={[styles.input, errors.visaExpiryDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.visaExpiryDate}
                onChangeText={(text) => handleInputChange('visaExpiryDate', text)}
              />
              {errors.visaExpiryDate && <Text style={styles.errorText}>{errors.visaExpiryDate}</Text>}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin nhập cảnh</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cửa khẩu nhập cảnh</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập cửa khẩu nhập cảnh"
              value={formData.entryPort}
              onChangeText={(text) => handleInputChange('entryPort', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày nhập cảnh</Text>
            <TextInput
              style={[styles.input, errors.entryDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              value={formData.entryDate}
              onChangeText={(text) => handleInputChange('entryDate', text)}
            />
            {errors.entryDate && <Text style={styles.errorText}>{errors.entryDate}</Text>}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin làm việc</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nơi làm việc</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập nơi làm việc"
              value={formData.workplace}
              onChangeText={(text) => handleInputChange('workplace', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vị trí công việc</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập vị trí công việc"
              value={formData.jobTitle}
              onChangeText={(text) => handleInputChange('jobTitle', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số giấy phép lao động</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số giấy phép lao động"
              value={formData.workPermitNumber}
              onChangeText={(text) => handleInputChange('workPermitNumber', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày hết hạn giấy phép</Text>
            <TextInput
              style={[styles.input, errors.workPermitExpiryDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              value={formData.workPermitExpiryDate}
              onChangeText={(text) => handleInputChange('workPermitExpiryDate', text)}
            />
            {errors.workPermitExpiryDate && <Text style={styles.errorText}>{errors.workPermitExpiryDate}</Text>}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thẻ tạm trú</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số thẻ tạm trú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số thẻ tạm trú"
              value={formData.residenceCardNumber}
              onChangeText={(text) => handleInputChange('residenceCardNumber', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày hết hạn thẻ</Text>
            <TextInput
              style={[styles.input, errors.residenceCardExpiry && styles.inputError]}
              placeholder="DD/MM/YYYY"
              value={formData.residenceCardExpiry}
              onChangeText={(text) => handleInputChange('residenceCardExpiry', text)}
            />
            {errors.residenceCardExpiry && <Text style={styles.errorText}>{errors.residenceCardExpiry}</Text>}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
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
              placeholder="Nhập email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ lưu trú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ lưu trú"
              value={formData.stayAddress}
              onChangeText={(text) => handleInputChange('stayAddress', text)}
              multiline
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Ghi chú bổ sung</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập ghi chú bổ sung (nếu có)"
              value={formData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                formData.status === STATUS_ACTIVE && styles.activeStatusButton
              ]}
              onPress={() => handleInputChange('status', STATUS_ACTIVE)}
            >
              <Text style={[
                styles.statusButtonText,
                formData.status === STATUS_ACTIVE && styles.activeStatusButtonText
              ]}>Đang hoạt động</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                formData.status === STATUS_PENDING && styles.pendingStatusButton
              ]}
              onPress={() => handleInputChange('status', STATUS_PENDING)}
            >
              <Text style={[
                styles.statusButtonText,
                formData.status === STATUS_PENDING && styles.activeStatusButtonText
              ]}>Chờ xác nhận</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                formData.status === STATUS_EXPIRED && styles.expiredStatusButton
              ]}
              onPress={() => handleInputChange('status', STATUS_EXPIRED)}
            >
              <Text style={[
                styles.statusButtonText,
                formData.status === STATUS_EXPIRED && styles.activeStatusButtonText
              ]}>Hết hạn</Text>
            </TouchableOpacity>
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
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  activeGenderButton: {
    backgroundColor: '#085924',
    borderColor: '#085924',
  },
  genderButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  activeGenderButtonText: {
    color: '#fff',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#085924',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  activeStatusButton: {
    backgroundColor: '#085924',
    borderColor: '#085924',
  },
  pendingStatusButton: {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
  },
  expiredStatusButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  statusButtonText: {
    color: '#085924',
    fontWeight: '500',
  },
  activeStatusButtonText: {
    color: '#fff',
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

export default EditForeignerScreen; 