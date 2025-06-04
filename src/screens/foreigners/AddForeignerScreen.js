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
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ForeignersService from '../../services/ForeignersService';
import LocationService from '../../services/LocationService';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';
import DatePicker from 'react-native-date-picker';

const STATUS_PENDING = 'P';
const GENDER_OPTIONS = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' },
];

const AddForeignerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date());

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    countryId: null,
    countryName: '',
    passportNumber: '',
    passportIssuedDate: '',
    passportIssuedPlace: '',
    visaNumber: '',
    visaType: '',
    visaIssuedDate: '',
    visaExpiryDate: '',
    entryDate: '',
    entryPort: '',
    stayAddress: '',
    phoneNumber: '',
    email: '',
    workplace: '',
    jobTitle: '',
    workPermitNumber: '',
    workPermitExpiryDate: '',
    sponsorOrganization: '',
    startDate: '',
    endDate: '',
    residenceCardNumber: '',
    residenceCardExpiry: '',
    notes: '',
    status: STATUS_PENDING,
  });

  useEffect(() => {
    // Gọi API lấy danh sách quốc tịch
    const fetchCountries = async () => {
      try {
        if (LocationService.getCountries) {
          const res = await LocationService.getCountries();
          setCountries(res.result || []);
        } else {
          // Nếu chưa có API, dùng tạm danh sách mẫu
          setCountries([
            { id: 1, countryName: 'Việt Nam' },
            { id: 2, countryName: 'Hoa Kỳ' },
            { id: 3, countryName: 'Nhật Bản' },
          ]);
        }
      } catch (err) {
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  // Helper: format date to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('/')) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Helper: parse DD/MM/YYYY to YYYY-MM-DDT00:00:00
  const parseDateForApi = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDateFieldPress = (field) => {
    setDatePickerField(field);
    setDatePickerValue(formData[field] ? new Date(formData[field].split('/').reverse().join('-')) : new Date());
    setDatePickerVisible(true);
  };

  const handleDateConfirm = (date) => {
    const formatted = formatDate(date);
    handleInputChange(datePickerField, formatted);
    setDatePickerVisible(false);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    // Các trường bắt buộc
    if (!formData.fullName) { newErrors.fullName = 'Vui lòng nhập họ tên'; isValid = false; }
    if (!formData.dateOfBirth) { newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh'; isValid = false; }
    if (!formData.countryId) { newErrors.countryId = 'Vui lòng chọn quốc tịch'; isValid = false; }
    if (!formData.phoneNumber) { newErrors.phoneNumber = 'Vui lòng nhập số điện thoại'; isValid = false; }
    if (!formData.stayAddress) { newErrors.stayAddress = 'Vui lòng nhập địa chỉ lưu trú'; isValid = false; }
    if (!formData.passportNumber) { newErrors.passportNumber = 'Vui lòng nhập số hộ chiếu'; isValid = false; }
    if (!formData.visaNumber) { newErrors.visaNumber = 'Vui lòng nhập số visa'; isValid = false; }
    if (!formData.visaType) { newErrors.visaType = 'Vui lòng nhập loại visa'; isValid = false; }
    if (!formData.visaIssuedDate) { newErrors.visaIssuedDate = 'Vui lòng chọn ngày cấp visa'; isValid = false; }
    if (!formData.visaExpiryDate) { newErrors.visaExpiryDate = 'Vui lòng chọn ngày hết hạn visa'; isValid = false; }
    if (!formData.workplace) { newErrors.workplace = 'Vui lòng nhập nơi làm việc'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        const data = {
          ...formData,
          dateOfBirth: parseDateForApi(formData.dateOfBirth),
          passportIssuedDate: parseDateForApi(formData.passportIssuedDate),
          visaIssuedDate: parseDateForApi(formData.visaIssuedDate),
          visaExpiryDate: parseDateForApi(formData.visaExpiryDate),
          entryDate: parseDateForApi(formData.entryDate),
          workPermitExpiryDate: parseDateForApi(formData.workPermitExpiryDate),
          residenceCardExpiry: parseDateForApi(formData.residenceCardExpiry),
          startDate: parseDateForApi(formData.startDate),
          endDate: parseDateForApi(formData.endDate),
        };
        const result = await ForeignersService.createByBusiness(data);
        showSuccess('Đăng ký người nước ngoài thành công');
        navigation.goBack();
      } catch (err) {
        showError('Không thể đăng ký người nước ngoài. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Dropdown chọn quốc tịch
  const renderCountryDropdown = () => (
    <Modal visible={showCountryModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn quốc tịch</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={countries}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('countryId', item.id);
                  handleInputChange('countryName', item.countryName);
                  setShowCountryModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.countryName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Dropdown chọn giới tính
  const renderGenderDropdown = () => (
    <Modal visible={showGenderModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn giới tính</Text>
            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={GENDER_OPTIONS}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('gender', item.value);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Date picker modal
  const renderDatePicker = () => (
    <Modal visible={isDatePickerVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn ngày</Text>
            <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContainer}>
            <DatePicker
              date={datePickerValue}
              onDateChange={setDatePickerValue}
              mode="date"
              locale="vi"
              maximumDate={new Date(2100, 11, 31)}
              androidVariant="nativeAndroid"
            />
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => handleDateConfirm(datePickerValue)}
            >
              <Text style={styles.datePickerButtonText}>Chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.inputLabel}>Họ và tên *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChangeText={text => handleInputChange('fullName', text)}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày sinh *</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dateInput,
                  errors.dateOfBirth && styles.inputError
                ]}
                onPress={() => handleDateFieldPress('dateOfBirth')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={formData.dateOfBirth ? styles.dateInputText : styles.placeholderText}>
                    {formData.dateOfBirth || 'Chọn ngày sinh'}
                  </Text>
                </View>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowGenderModal(true)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={formData.gender ? styles.dropdownButtonText : styles.placeholderText}>
                    {formData.gender || 'Chọn giới tính'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quốc tịch *</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                errors.countryId && styles.inputError
              ]}
              onPress={() => setShowCountryModal(true)}
            >
              <View style={{ flex: 1 }}>
                <Text style={formData.countryName ? styles.dropdownButtonText : styles.placeholderText}>
                  {formData.countryName || 'Chọn quốc tịch'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" style={styles.inputIconRight} />
            </TouchableOpacity>
            {errors.countryId && <Text style={styles.errorText}>{errors.countryId}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="Nhập số điện thoại"
              value={formData.phoneNumber}
              onChangeText={text => handleInputChange('phoneNumber', text)}
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
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ lưu trú tại Việt Nam *</Text>
            <TextInput
              style={[styles.input, errors.stayAddress && styles.inputError]}
              placeholder="Nhập địa chỉ lưu trú"
              value={formData.stayAddress}
              onChangeText={text => handleInputChange('stayAddress', text)}
              multiline
            />
            {errors.stayAddress && <Text style={styles.errorText}>{errors.stayAddress}</Text>}
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin hộ chiếu</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số hộ chiếu *</Text>
            <TextInput
              style={[styles.input, errors.passportNumber && styles.inputError]}
              placeholder="Nhập số hộ chiếu"
              value={formData.passportNumber}
              onChangeText={text => handleInputChange('passportNumber', text)}
            />
            {errors.passportNumber && <Text style={styles.errorText}>{errors.passportNumber}</Text>}
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày cấp hộ chiếu</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => handleDateFieldPress('passportIssuedDate')}
              >
                <Text style={formData.passportIssuedDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.passportIssuedDate || 'Chọn ngày cấp'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Nơi cấp hộ chiếu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập nơi cấp hộ chiếu"
                value={formData.passportIssuedPlace}
                onChangeText={text => handleInputChange('passportIssuedPlace', text)}
              />
            </View>
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin visa</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số Visa *</Text>
            <TextInput
              style={[styles.input, errors.visaNumber && styles.inputError]}
              placeholder="Nhập số visa"
              value={formData.visaNumber}
              onChangeText={text => handleInputChange('visaNumber', text)}
            />
            {errors.visaNumber && <Text style={styles.errorText}>{errors.visaNumber}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loại Visa *</Text>
            <TextInput
              style={[styles.input, errors.visaType && styles.inputError]}
              placeholder="Nhập loại visa"
              value={formData.visaType}
              onChangeText={text => handleInputChange('visaType', text)}
            />
            {errors.visaType && <Text style={styles.errorText}>{errors.visaType}</Text>}
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày cấp Visa *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, errors.visaIssuedDate && styles.inputError]}
                onPress={() => handleDateFieldPress('visaIssuedDate')}
              >
                <Text style={formData.visaIssuedDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.visaIssuedDate || 'Chọn ngày cấp'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
              {errors.visaIssuedDate && <Text style={styles.errorText}>{errors.visaIssuedDate}</Text>}
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày hết hạn Visa *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, errors.visaExpiryDate && styles.inputError]}
                onPress={() => handleDateFieldPress('visaExpiryDate')}
              >
                <Text style={formData.visaExpiryDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.visaExpiryDate || 'Chọn ngày hết hạn'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
              {errors.visaExpiryDate && <Text style={styles.errorText}>{errors.visaExpiryDate}</Text>}
            </View>
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin nhập cảnh & làm việc</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày nhập cảnh</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => handleDateFieldPress('entryDate')}
              >
                <Text style={formData.entryDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.entryDate || 'Chọn ngày nhập cảnh'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Cửa khẩu nhập cảnh</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập cửa khẩu nhập cảnh"
                value={formData.entryPort}
                onChangeText={text => handleInputChange('entryPort', text)}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nơi làm việc tại Việt Nam *</Text>
            <TextInput
              style={[styles.input, errors.workplace && styles.inputError]}
              placeholder="Nhập nơi làm việc"
              value={formData.workplace}
              onChangeText={text => handleInputChange('workplace', text)}
            />
            {errors.workplace && <Text style={styles.errorText}>{errors.workplace}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Chức vụ/Công việc</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập chức vụ/công việc"
              value={formData.jobTitle}
              onChangeText={text => handleInputChange('jobTitle', text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tổ chức/Công ty bảo lãnh</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tổ chức/công ty bảo lãnh"
              value={formData.sponsorOrganization}
              onChangeText={text => handleInputChange('sponsorOrganization', text)}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày bắt đầu làm việc</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => handleDateFieldPress('startDate')}
              >
                <Text style={formData.startDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.startDate || 'Chọn ngày bắt đầu'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Ngày kết thúc làm việc</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => handleDateFieldPress('endDate')}
              >
                <Text style={formData.endDate ? styles.dateInputText : styles.placeholderText}>
                  {formData.endDate || 'Chọn ngày kết thúc'}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Giấy phép lao động & Thẻ tạm trú</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số giấy phép lao động</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số giấy phép lao động"
              value={formData.workPermitNumber}
              onChangeText={text => handleInputChange('workPermitNumber', text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hạn giấy phép lao động</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput]}
              onPress={() => handleDateFieldPress('workPermitExpiryDate')}
            >
              <Text style={formData.workPermitExpiryDate ? styles.dateInputText : styles.placeholderText}>
                {formData.workPermitExpiryDate || 'Chọn hạn giấy phép'}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số thẻ tạm trú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số thẻ tạm trú"
              value={formData.residenceCardNumber}
              onChangeText={text => handleInputChange('residenceCardNumber', text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày hết hạn thẻ tạm trú</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput]}
              onPress={() => handleDateFieldPress('residenceCardExpiry')}
            >
              <Text style={formData.residenceCardExpiry ? styles.dateInputText : styles.placeholderText}>
                {formData.residenceCardExpiry || 'Chọn ngày hết hạn'}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" style={styles.inputIconRight} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập ghi chú (nếu có)"
            value={formData.notes}
            onChangeText={text => handleInputChange('notes', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <TextInput
            style={styles.input}
            value={formData.status === 'P' ? 'Chờ xác thực' : formData.status}
            editable={false}
          />
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
              <Text style={styles.submitButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderCountryDropdown()}
      {renderGenderDropdown()}
      {renderDatePicker()}
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#085924',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  datePickerButton: {
    padding: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#085924',
  },
  placeholderText: {
    color: '#666',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    marginRight: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    marginRight: 10,
  },
  inputIconRight: {
    marginLeft: 8,
    alignSelf: 'center',
  },
});

export default AddForeignerScreen; 