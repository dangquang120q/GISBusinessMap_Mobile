import React, {useContext, useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GoogleSVG from '../../assets/images/misc/google.svg';
import FacebookSVG from '../../assets/images/misc/facebook.svg';

import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';

import {AuthContext} from '../../context/AuthContext';

const LoginScreen = ({navigation}) => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mounted, setMounted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('citizen'); // Default role is citizen

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppScreens' }],
      });
    }
  }, [isAuthenticated, navigation]);

  const validateEmail = (text) => {
    // if (!text.trim()) {
    //   setEmailError('Vui lòng nhập email');
    //   return false;
    // }
    // const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    // if (!emailRegex.test(text)) {
    //   setEmailError('Email không hợp lệ');
    //   return false;
    // }
    setEmailError('');
    return true;
  };

  const validatePassword = (text) => {
    if (!text.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (text.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Memoized input handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((text) => {
    setEmail(text);
    setError('');
    validateEmail(text);
  }, []);
  
  const handlePasswordChange = useCallback((text) => {
    setPassword(text);
    setError('');
    validatePassword(text);
  }, []);
  
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      console.log('Starting login process...');
      setIsLoading(true);
      setError('');
      
      // Call login function with email and password
      const result = await login(email, password);
      
      if (!mounted) {
        console.log('Component unmounted, stopping login process');
        return;
      }

      // Check for login success/failure
      if (!result || !result.success) {
        // Handle login failure
        console.error('Login failed with error:', result?.error);
        
        let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
        
        // Extract detailed error message if available
        if (result?.error?.response) {
          if (result.error.response.status === 500) {
            errorMessage = 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.';
          } else if (result.error.response.data?.error?.message) {
            errorMessage = result.error.response.data.error.message;
          }
        } else if (result?.message) {
          errorMessage = result.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
        // We stay on the login screen - do not navigate anywhere
      } else {
        // Login succeeded, effect will handle navigation based on isAuthenticated
        console.log('Login successful, waiting for isAuthenticated state to update');
      }
    } catch (err) {
      if (!mounted) {
        console.log('Component unmounted during error handling');
        return;
      }
      
      console.error('Login error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        setError(`Lỗi server: ${err.response.data?.error?.message || 'Vui lòng thử lại sau'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.log('No response received:', err.request);
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request:', err.message);
        setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Main')}
      >
        <Ionicons name="arrow-back" size={24} color="#085924" />
        <Text style={styles.backButtonText}>Quay lại bản đồ</Text>
      </TouchableOpacity>

      <View style={{paddingHorizontal: 25}}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          Đăng nhập
        </Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Role Selection */}
        {/* <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Chọn vai trò:</Text>
          <View style={styles.roleButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'citizen' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('citizen')}
              disabled={isLoading}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={selectedRole === 'citizen' ? '#fff' : '#085924'}
              />
              <Text style={[
                styles.roleButtonText,
                selectedRole === 'citizen' && styles.roleButtonTextActive,
              ]}>
                Người dân
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'business' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('business')}
              disabled={isLoading}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={selectedRole === 'business' ? '#fff' : '#085924'}
              />
              <Text style={[
                styles.roleButtonText,
                selectedRole === 'business' && styles.roleButtonTextActive,
              ]}>
                Doanh nghiệp
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

        <View>
          <InputField
            label={'Email'}
            icon={
              <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
            }
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmailChange}
            editable={!isLoading}
          />
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </View>

        <View>
          <InputField
            label={'Mật khẩu'}
            icon={
              <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{marginRight: 5}}
            />
            }
            inputType="password"
            value={password}
            onChangeText={handlePasswordChange}
            editable={!isLoading}
            showPassword={showPassword}
            fieldButtonIcon={
              <TouchableOpacity onPress={toggleShowPassword}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666"
                />
              </TouchableOpacity>
            }
          />
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        </View>
        
        <CustomButton 
          label={isLoading ? "Đang đăng nhập..." : "Đăng nhập"} 
          onPress={handleLogin}
          disabled={isLoading}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#085924" />
          </View>
        )}

        <Text style={styles.orText}>
          Hoặc, đăng nhập bằng ...
        </Text>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            onPress={() => {}}
            style={[styles.socialButton, isLoading && styles.disabledButton]}
            disabled={isLoading}>
            <GoogleSVG height={24} width={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={[styles.socialButton, isLoading && styles.disabledButton]}
            disabled={isLoading}>
            <FacebookSVG height={24} width={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.registerContainer}>
          <Text>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}>
            <Text style={styles.registerText}> Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#085924',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    color: '#085924',
    marginBottom: 30,
    textAlign: 'center'
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#085924',
    borderRadius: 8,
    width: '48%',
  },
  roleButtonActive: {
    backgroundColor: '#085924',
  },
  roleButtonText: {
    marginLeft: 8,
    color: '#085924',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  orText: {
    textAlign: 'center', 
    color: '#666', 
    marginBottom: 20,
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  socialButton: {
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  registerText: {
    color: '#085924',
    fontWeight: '700'
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: 12,
    marginLeft: 10,
    marginTop: -20,
    marginBottom: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default LoginScreen;
