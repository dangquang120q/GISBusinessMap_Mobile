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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddForeignerScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    passport: '',
    nationality: '',
    gender: '',
    birthDate: '',
    purpose: '',
    entryDate: '',
    expiryDate: '',
    phone: '',
    address: '',
    workPosition: '',
    notes: '',
    status: 'Chờ xác nhận',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên người nước ngoài';
      isValid = false;
    }

    // Validate passport
    if (!formData.passport.trim()) {
      newErrors.passport = 'Vui lòng nhập số hộ chiếu';
      isValid = false;
    }

    // Validate nationality
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Vui lòng nhập quốc tịch';
      isValid = false;
    }

    // Validate phone (simple validation)
    if (formData.phone.trim() && !/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Validate dates (simple format validation)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    
    if (formData.entryDate.trim() && !dateRegex.test(formData.entryDate)) {
      newErrors.entryDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
      isValid = false;
    }
    
    if (formData.expiryDate.trim() && !dateRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
      isValid = false;
    }
    
    if (formData.birthDate.trim() && !dateRegex.test(formData.birthDate)) {
      newErrors.birthDate = 'Định dạng ngày không hợp lệ (DD/MM/YYYY)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically send the data to your API
      Alert.alert(
        'Thành công',
        'Đã đăng ký người nước ngoài thành công',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
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
        <Text style={styles.headerTitle}>Đăng ký người nước ngoài</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ tên*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Nhập tên người nước ngoài"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số hộ chiếu*</Text>
            <TextInput
              style={[styles.input, errors.passport && styles.inputError]}
              placeholder="Nhập số hộ chiếu"
              value={formData.passport}
              onChangeText={(text) => handleInputChange('passport', text)}
            />
            {errors.passport && <Text style={styles.errorText}>{errors.passport}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quốc tịch*</Text>
            <TextInput
              style={[styles.input, errors.nationality && styles.inputError]}
              placeholder="Nhập quốc tịch"
              value={formData.nationality}
              onChangeText={(text) => handleInputChange('nationality', text)}
            />
            {errors.nationality && <Text style={styles.errorText}>{errors.nationality}</Text>}
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
                style={[styles.input, errors.birthDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.birthDate}
                onChangeText={(text) => handleInputChange('birthDate', text)}
              />
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mục đích lưu trú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mục đích lưu trú"
              value={formData.purpose}
              onChangeText={(text) => handleInputChange('purpose', text)}
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày đến</Text>
              <TextInput
                style={[styles.input, errors.entryDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.entryDate}
                onChangeText={(text) => handleInputChange('entryDate', text)}
              />
              {errors.entryDate && <Text style={styles.errorText}>{errors.entryDate}</Text>}
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hết hạn</Text>
              <TextInput
                style={[styles.input, errors.expiryDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                value={formData.expiryDate}
                onChangeText={(text) => handleInputChange('expiryDate', text)}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ lưu trú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ lưu trú"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vị trí công việc</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập vị trí công việc"
              value={formData.workPosition}
              onChangeText={(text) => handleInputChange('workPosition', text)}
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
          <Text style={styles.sectionTitle}>Trạng thái đăng ký</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                formData.status === 'Đang hoạt động' && styles.activeStatusButton
              ]}
              onPress={() => handleInputChange('status', 'Đang hoạt động')}
            >
              <Text style={[
                styles.statusButtonText,
                formData.status === 'Đang hoạt động' && styles.activeStatusButtonText
              ]}>Đang hoạt động</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                formData.status === 'Chờ xác nhận' && styles.pendingStatusButton
              ]}
              onPress={() => handleInputChange('status', 'Chờ xác nhận')}
            >
              <Text style={[
                styles.statusButtonText,
                formData.status === 'Chờ xác nhận' && styles.activeStatusButtonText
              ]}>Chờ xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#085924" />
          <Text style={styles.infoText}>
            Thông tin đăng ký sẽ được lưu và sử dụng theo quy định pháp luật.
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Đăng ký</Text>
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
  statusButtonText: {
    color: '#085924',
    fontWeight: '500',
  },
  activeStatusButtonText: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#e0f2e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#085924',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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

export default AddForeignerScreen; 