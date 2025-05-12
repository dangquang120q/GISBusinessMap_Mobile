import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const ReviewHistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  // Sample data - replace with your actual API call
  const sampleReviews = [
    {
      id: '1',
      facilityName: 'Nhà hàng ABC',
      facilityType: 'Nhà hàng',
      rating: 4,
      content: 'Đồ ăn ngon, phục vụ tốt.',
      date: '2023-12-05',
    },
    {
      id: '2',
      facilityName: 'Khách sạn XYZ',
      facilityType: 'Khách sạn',
      rating: 5,
      content: 'Phòng sạch sẽ, nhân viên thân thiện.',
      date: '2023-11-28',
    },
    {
      id: '3',
      facilityName: 'Cửa hàng LMN',
      facilityType: 'Cửa hàng',
      rating: 3,
      content: 'Sản phẩm đa dạng, giá khá cao.',
      date: '2023-11-15',
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchReviews = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setReviews(data);
        
        // Using sample data for now
        setTimeout(() => {
          setReviews(sampleReviews);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reviewItem}
      onPress={() => {
        navigation.navigate('ReviewDetail', { reviewId: item.id });
      }}
    >
      <View style={styles.reviewHeader}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.facilityType}>{item.facilityType}</Text>
      {renderStars(item.rating)}
      <Text style={styles.content}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đánh giá</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AD40AF" />
        </View>
      ) : reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có đánh giá nào</Text>
        </View>
      )}
    </SafeAreaView>
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
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  reviewItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  facilityType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ReviewHistoryScreen; 