import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { showError, showSuccess, showConfirmation } from '../../utils/PopupUtils';

const RateScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingError, setRatingError] = useState('');

  const handleRating = (value) => {
    setRating(value);
    setRatingError('');
  };

  const handleSubmit = () => {
    if (rating === 0) {
      setRatingError('Vui lòng chọn số sao đánh giá');
      return;
    }

    // Here you would typically send the rating and feedback to your backend
    showConfirmation({
      title: 'Cảm ơn bạn!',
      message: 'Cảm ơn bạn đã đánh giá ứng dụng của chúng tôi.',
      confirmText: 'Đánh giá trên cửa hàng',
      cancelText: 'Đóng',
      onConfirm: () => {
        const storeUrl = Platform.select({
          ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
          android: 'market://details?id=com.msf.gisbusiness',
        });
        const webUrl = Platform.select({
          ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
          android: 'https://play.google.com/store/apps/details?id=com.msf.gisbusiness',
        });
        
        Linking.canOpenURL(storeUrl).then(supported => {
          if (supported) {
            Linking.openURL(storeUrl);
          } else {
            Linking.openURL(webUrl);
          }
        });
      },
      onCancel: () => navigation.goBack()
    });
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#FFD700' : '#ccc'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá ứng dụng</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>GIS_BUSINESS</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Bạn đánh giá ứng dụng của chúng tôi như thế nào?</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={[styles.ratingText, ratingError ? styles.errorText : null]}>
              {ratingError || (rating === 0
                ? 'Vui lòng chọn số sao'
                : rating === 1
                ? 'Rất không hài lòng'
                : rating === 2
                ? 'Không hài lòng'
                : rating === 3
                ? 'Bình thường'
                : rating === 4
                ? 'Hài lòng'
                : 'Rất hài lòng')}
            </Text>
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Góp ý của bạn (không bắt buộc)</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder="Chia sẻ trải nghiệm của bạn với chúng tôi..."
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.storeRatingButton}
            onPress={() => {
              const storeUrl = Platform.select({
                ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
                android: 'market://details?id=com.msf.gisbusiness',
              });
              const webUrl = Platform.select({
                ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
                android: 'https://play.google.com/store/apps/details?id=com.msf.gisbusiness',
              });
              
              Linking.canOpenURL(storeUrl).then(supported => {
                if (supported) {
                  Linking.openURL(storeUrl);
                } else {
                  Linking.openURL(webUrl);
                }
              });
            }}
          >
            <Ionicons name="star" size={20} color="#FFD700" style={styles.storeRatingIcon} />
            <Text style={styles.storeRatingText}>Đánh giá trên {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  feedbackSection: {
    marginBottom: 30,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#085924',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  storeRatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  storeRatingIcon: {
    marginRight: 8,
  },
  storeRatingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default RateScreen; 