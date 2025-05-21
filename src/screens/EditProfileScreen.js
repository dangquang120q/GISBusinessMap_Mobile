import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SessionService from '../services/SessionService';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // User data state
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    emailAddress: '',
    phoneNumber: '',
    timeZone: null,
    avatar: null,
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch current user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const loginInfo = await SessionService.getCurrentLoginInformations();
      if (loginInfo && loginInfo.user) {
        const { user } = loginInfo;
        setUserData({
          name: user.name || '',
          surname: user.surname || '',
          emailAddress: user.emailAddress || '',
          phoneNumber: user.phoneNumber || '',
          timeZone: user.timeZone || null,
          avatar: user.avatarUrl || null,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // Validate fields
    if (!userData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return;
    }
    
    if (!userData.surname.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ');
      return;
    }
    
    if (!userData.emailAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Create profile update data object matching UserProfileDto schema
      const profileData = {
        name: userData.name,
        surname: userData.surname,
        emailAddress: userData.emailAddress,
        phoneNumber: userData.phoneNumber,
        timeZone: userData.timeZone,
      };
      
      // Call API to update profile
      await SessionService.updateProfile(profileData);
      
      Alert.alert(
        'Thành công',
        'Thông tin hồ sơ đã được cập nhật',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle opening the image picker modal
  const handleChangeAvatar = () => {
    setShowImagePickerModal(true);
  };

  // Handle taking a photo with camera
  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      saveToPhotos: true,
      includeBase64: false,
      cameraType: 'front',
    };

    // Check permissions on Android
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera to take profile picture",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
    
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.error('Camera Error: ', response.errorMessage);
        Alert.alert('Lỗi', 'Không thể mở máy ảnh. Vui lòng thử lại sau.');
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0];
        setSelectedImage({
          uri: source.uri,
          width: source.width,
          height: source.height,
          type: source.type,
        });
        setShowCropModal(true);
      }
    });
  };

  // Handle choosing from gallery
  const handleChooseFromLibrary = () => {
    setShowImagePickerModal(false);
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
      selectionLimit: 1,
    };
    
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại sau.');
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0];
        setSelectedImage({
          uri: source.uri,
          width: source.width,
          height: source.height,
          type: source.type,
        });
        setShowCropModal(true);
      }
    });
  };

  // Apply cropped image
  const handleApplyCrop = () => {
    if (selectedImage) {
      // Set the cropped image as avatar
      setUserData({
        ...userData,
        avatar: selectedImage.uri
      });
      
      // TODO: Upload the cropped image to server
      // This would involve creating a new API endpoint or using an existing one
      setShowCropModal(false);
    }
  };

  // Cancel crop
  const handleCancelCrop = () => {
    setSelectedImage(null);
    setShowCropModal(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
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
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{userData.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.changeAvatarButton} onPress={handleChangeAvatar}>
            <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={userData.name}
            onChangeText={(text) => setUserData({...userData, name: text})}
            placeholder="Nhập tên"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={userData.surname}
            onChangeText={(text) => setUserData({...userData, surname: text})}
            placeholder="Nhập họ"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={userData.emailAddress}
            onChangeText={(text) => setUserData({...userData, emailAddress: text})}
            placeholder="Nhập email"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={userData.phoneNumber}
            onChangeText={(text) => setUserData({...userData, phoneNumber: text})}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for image picker options */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#085924" />
              <Text style={styles.modalOptionText}>Chụp ảnh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleChooseFromLibrary}>
              <Ionicons name="image" size={24} color="#085924" />
              <Text style={styles.modalOptionText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowImagePickerModal(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for image cropping */}
      <Modal
        visible={showCropModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelCrop}
      >
        <View style={styles.cropModalContainer}>
          <View style={styles.cropModalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa ảnh đại diện</Text>
            
            <View style={styles.cropPreviewContainer}>
              {selectedImage && (
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.cropPreview}
                  resizeMode="contain"
                />
              )}
              <View style={styles.cropGuide} />
            </View>
            
            <Text style={styles.cropInstructions}>
              Di chuyển và phóng to/thu nhỏ ảnh để đặt khuôn mặt trong vòng tròn
            </Text>
            
            <View style={styles.cropButtonsContainer}>
              <TouchableOpacity style={styles.cropCancelButton} onPress={handleCancelCrop}>
                <Text style={styles.cropCancelText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cropApplyButton} onPress={handleApplyCrop}>
                <Text style={styles.cropApplyText}>Áp dụng</Text>
              </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#085924',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    padding: 5,
  },
  changeAvatarText: {
    fontSize: 14,
    color: '#085924',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#085924',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#84b594',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // Crop modal styles
  cropModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cropModalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cropPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cropPreview: {
    width: '100%',
    height: '100%',
  },
  cropGuide: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
  },
  cropInstructions: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  cropButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cropCancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '48%',
    alignItems: 'center',
  },
  cropCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cropApplyButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#085924',
    width: '48%',
    alignItems: 'center',
  },
  cropApplyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen; 