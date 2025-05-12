import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  
  // Sample user data - replace with actual user data from your context/API
  const [userData, setUserData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '0123456789',
    location: 'TP Hồ Chí Minh',
    bio: 'Tôi yêu thích được trải nghiệm những địa điểm mới và thưởng thức ẩm thực địa phương.',
    profileImage: 'https://via.placeholder.com/150',
  });

  const [isEditing, setIsEditing] = useState({
    fullName: false,
    email: false,
    phone: false,
    location: false,
    bio: false,
  });

  const handleSave = () => {
    // Here you would make an API call to update the user's profile
    // For example: updateUserProfile(userData);
    
    Alert.alert(
      'Thành công',
      'Thông tin cá nhân đã được cập nhật',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderEditableField = (field, label, icon, multiline = false) => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <Ionicons name={icon} size={20} color="#AD40AF" />
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        
        {isEditing[field] ? (
          <View style={styles.editInputContainer}>
            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              value={userData[field]}
              onChangeText={(text) => setUserData({...userData, [field]: text})}
              multiline={multiline}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setIsEditing({...isEditing, [field]: false})}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.valueContainer}>
            <Text style={[styles.fieldValue, multiline && styles.multilineValue]}>
              {userData[field]}
            </Text>
            <TouchableOpacity onPress={() => setIsEditing({...isEditing, [field]: true})}>
              <Ionicons name="create-outline" size={20} color="#AD40AF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        </View>

        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{uri: userData.profileImage}}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.photoEditButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
        </View>

        <View style={styles.formSection}>
          {renderEditableField('fullName', 'Họ và tên', 'person-outline')}
          {renderEditableField('email', 'Email', 'mail-outline')}
          {renderEditableField('phone', 'Số điện thoại', 'call-outline')}
          {renderEditableField('location', 'Địa chỉ', 'location-outline')}
          {renderEditableField('bio', 'Giới thiệu', 'information-circle-outline', true)}
        </View>

        <TouchableOpacity style={styles.saveAllButton} onPress={handleSave}>
          <Text style={styles.saveAllButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#AD40AF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImageSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#AD40AF',
  },
  photoEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#AD40AF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: '#AD40AF',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  multilineValue: {
    lineHeight: 22,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#AD40AF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveAllButton: {
    backgroundColor: '#AD40AF',
    margin: 16,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    marginBottom: 30,
  },
  saveAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 