import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';

import DatePicker from 'react-native-date-picker';

import InputField from '../../components/InputField';
import Colors from '../../constants/Colors';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomButton from '../../components/CustomButton';
import AccountService from '../../services/AccountService';

const RegisterScreen = ({navigation}) => {
  // Form states
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('M'); // Default: Male
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date('2000-01-01'));
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dobLabel, setDobLabel] = useState('Ngày sinh');
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!name || !name.trim()) {
      errors.name = 'Vui lòng nhập tên';
      isValid = false;
    }
    
    if (!surname || !surname.trim()) {
      errors.surname = 'Vui lòng nhập họ';
      isValid = false;
    }
    
    if (!phoneNumber || !phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^(0|\+84)([0-9]{9,10})$/.test(phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (Vui lòng nhập số điện thoại Việt Nam)';
      isValid = false;
    }
    
    if (!email || !email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email';
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Địa chỉ email không hợp lệ';
        isValid = false;
      }
    }
    
    if (!username || !username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    } else if (username.trim().length < 4) {
      errors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
      isValid = false;
    }
    
    // Kiểm tra ngày sinh
    if (dateOfBirth) {
      const today = new Date();
      if (dateOfBirth > today) {
        errors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai';
        isValid = false;
      }
      
      // Kiểm tra tuổi (ví dụ: trên 18 tuổi)
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
      if (dateOfBirth > eighteenYearsAgo) {
        errors.dateOfBirth = 'Bạn phải trên 18 tuổi để đăng ký';
        isValid = false;
      }
    }
    
    if (!isValid) {
      // Hiển thị lỗi đầu tiên
      const firstError = Object.values(errors)[0];
      Alert.alert('Lỗi', firstError);
    }
    
    return isValid;
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Format date as YYYY-MM-DD (with hyphens)
      const formatDateForApi = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const registerData = {
        name: name.trim(),
        surname: surname.trim(),
        gender,
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: formatDateForApi(dateOfBirth),
        userName: username.trim(),
        emailAddress: email.trim(),
        password,
        confirmPassword,
      };
      
      console.log('Registration data:', JSON.stringify(registerData)); // Log the request data
      
      const result = await AccountService.register(registerData);
      
      setIsLoading(false);
      
      if (result && result.canLogin) {
        Alert.alert(
          'Đăng ký thành công',
          'Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.',
          [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('LoginScreen'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Đăng ký thành công',
          'Tài khoản của bạn đã được tạo, nhưng cần được xác nhận trước khi đăng nhập.'
        );
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Registration error:', err);
      
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau.';
      
      if (err.response && err.response.data) {
        if (err.response.data.error && err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Kiểm tra một số lỗi cụ thể
      if (errorMessage.includes('email') || errorMessage.toLowerCase().includes('email')) {
        errorMessage = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
      } else if (errorMessage.includes('username') || errorMessage.toLowerCase().includes('tên đăng nhập')) {
        errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
      }
      
      Alert.alert('Lỗi đăng ký', errorMessage);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          Đăng ký
        </Text>

        <View style={styles.nameContainer}>
          <View style={styles.nameField}>
            <InputField
              label={'Tên'}
              value={name}
              onChangeText={setName}
              icon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={{marginRight: 5}}
                />
              }
            />
          </View>
          
          <View style={styles.nameField}>
            <InputField
              label={'Họ'}
              value={surname}
              onChangeText={setSurname}
              icon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={{marginRight: 5}}
                />
              }
            />
          </View>
        </View>

        <InputField
          label={'Tên đăng nhập'}
          value={username}
          onChangeText={setUsername}
          icon={
            <Ionicons
              name="at-outline"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
          }
        />

        <InputField
          label={'Email'}
          value={email}
          onChangeText={setEmail}
          icon={
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
          }
          keyboardType="email-address"
        />

        <InputField
          label={'Số điện thoại'}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          icon={
            <Ionicons
              name="call-outline"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
          }
          keyboardType="phone-pad"
        />

        <View style={styles.genderContainer}>
          <Text style={styles.genderLabel}>Giới tính:</Text>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'M' && styles.selectedGender,
            ]}
            onPress={() => setGender('M')}>
            <Text
              style={[
                styles.genderText,
                gender === 'M' && styles.selectedGenderText,
              ]}>
              Nam
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'F' && styles.selectedGender,
            ]}
            onPress={() => setGender('F')}>
            <Text
              style={[
                styles.genderText,
                gender === 'F' && styles.selectedGenderText,
              ]}>
              Nữ
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            paddingBottom: 8,
            marginBottom: 30,
          }}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#666"
            style={{marginRight: 5}}
          />
          <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
            <Text style={{color: '#666', marginLeft: 5, marginTop: 5}}>
              {dobLabel !== 'Ngày sinh' ? formatDate(dateOfBirth) : dobLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          open={datePickerOpen}
          date={dateOfBirth}
          mode={'date'}
          maximumDate={new Date('2005-01-01')}
          minimumDate={new Date('1940-01-01')}
          onConfirm={date => {
            setDatePickerOpen(false);
            setDateOfBirth(date);
            setDobLabel(formatDate(date));
          }}
          onCancel={() => {
            setDatePickerOpen(false);
          }}
        />

        <InputField
          label={'Mật khẩu'}
          value={password}
          onChangeText={setPassword}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
          }
          inputType="password"
        />

        <InputField
          label={'Xác nhận mật khẩu'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
          }
          inputType="password"
        />

        <CustomButton 
          label={isLoading ? 'Đang xử lý...' : 'Đăng ký'} 
          onPress={handleRegister}
          disabled={isLoading} 
        />
        {isLoading && (
          <ActivityIndicator 
            size="large" 
            color={Colors.primary} 
            style={styles.loadingIndicator}
          />
        )}

        <View style={styles.loginTextContainer}>
          <Text>Bạn đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}> Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    paddingHorizontal: 25,
  },
  imageContainer: {
    alignItems: 'center', 
    marginVertical: 20,
  },
  logo: {
    height: Dimensions.get('window').width * 0.4,
    width: Dimensions.get('window').width * 0.4,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 28,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 30,
    textAlign:'center'
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    width: '48%',
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  genderLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#666',
  },
  genderOption: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedGender: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    color: '#666',
  },
  selectedGenderText: {
    color: '#fff',
  },
  loadingIndicator: {
    marginTop: 10, 
    marginBottom: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    borderColor: Colors.border,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
    backgroundColor: Colors.background,
  },
  orText: {
    textAlign: 'center', 
    color: Colors.text.secondary, 
    marginBottom: 30,
  },
  loginTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: Colors.primary, 
    fontWeight: '700',
  },
});

export default RegisterScreen;
