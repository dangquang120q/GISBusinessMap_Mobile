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

const AddBusinessFacilityScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    licenseNumber: '',
    businessType: '',
    operationDate: '',
    expiryDate: '',
    owner: '',
    contactPhone: '',
    contactEmail: '',
    area: '',
    employees: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên cơ sở';
      isValid = false;
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
      isValid = false;
    }

    // Validate license number
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Vui lòng nhập số giấy phép';
      isValid = false;
    }

    // Validate business type
    if (!formData.businessType.trim()) {
      newErrors.businessType = 'Vui lòng nhập loại hình kinh doanh';
      isValid = false;
    }

    // Validate owner
    if (!formData.owner.trim()) {
      newErrors.owner = 'Vui lòng nhập tên chủ sở hữu';
      isValid = false;
    }

    // Validate phone (simple validation)
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^\d{10,11}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    // Validate email (simple validation)
    if (formData.contactEmail.trim() && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Địa chỉ email không hợp lệ';
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
        'Cơ sở kinh doanh đã được tạo thành công',
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
        <Text style={styles.headerTitle}>Thêm cơ sở kinh doanh mới</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên cơ sở*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Nhập tên cơ sở"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số giấy phép*</Text>
            <TextInput
              style={[styles.input, errors.licenseNumber && styles.inputError]}
              placeholder="Nhập số giấy phép"
              value={formData.licenseNumber}
              onChangeText={(text) => handleInputChange('licenseNumber', text)}
            />
            {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loại hình kinh doanh*</Text>
            <TextInput
              style={[styles.input, errors.businessType && styles.inputError]}
              placeholder="Nhập loại hình kinh doanh"
              value={formData.businessType}
              onChangeText={(text) => handleInputChange('businessType', text)}
            />
            {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hoạt động</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.operationDate}
                onChangeText={(text) => handleInputChange('operationDate', text)}
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hết hạn</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.expiryDate}
                onChangeText={(text) => handleInputChange('expiryDate', text)}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Địa điểm</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ*</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Nhập địa chỉ cơ sở"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
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
              style={[styles.input, errors.owner && styles.inputError]}
              placeholder="Nhập tên chủ sở hữu"
              value={formData.owner}
              onChangeText={(text) => handleInputChange('owner', text)}
            />
            {errors.owner && <Text style={styles.errorText}>{errors.owner}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại*</Text>
            <TextInput
              style={[styles.input, errors.contactPhone && styles.inputError]}
              placeholder="Nhập số điện thoại"
              value={formData.contactPhone}
              onChangeText={(text) => handleInputChange('contactPhone', text)}
              keyboardType="phone-pad"
            />
            {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.contactEmail && styles.inputError]}
              placeholder="Nhập địa chỉ email"
              value={formData.contactEmail}
              onChangeText={(text) => handleInputChange('contactEmail', text)}
              keyboardType="email-address"
            />
            {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số nhân viên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số lượng nhân viên"
              value={formData.employees}
              onChangeText={(text) => handleInputChange('employees', text)}
              keyboardType="numeric"
            />
          </View>
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
            <Text style={styles.submitButtonText}>Tạo cơ sở</Text>
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