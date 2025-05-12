import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

// Demo API URL - replace with your actual API URL
// import {API_URL} from '../config/api';

// Mock facility types and their icons
// const FACILITY_TYPES = {
//   'Nhà hàng': require('../assets/images/restaurant_icon.png'),
//   'Khách sạn': require('../assets/images/hotel_icon.png'),
//   'Cửa hàng': require('../assets/images/shop_icon.png'),
// };

export default function HomeScreen() {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initial map center point
  const initialCenter = {
    latitude: 20.44879,
    longitude: 106.34259,
    zoom: 15
  };
  
  // States for facilities
  const [facilities, setFacilities] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  
  // States for modals
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewListVisible, setIsReviewListVisible] = useState(false);
  
  // States for filters
  const [filters, setFilters] = useState({
    restaurant: true,
    hotel: true,
    shop: true,
  });
  
  // State for new facility
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: 'Nhà hàng',
    address: '',
    latitude: 0,
    longitude: 0,
  });
  
  // State for reviews
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    reviewerName: '',
    rating: 5,
    content: '',
  });

  // HTML for the leaflet map
  const leafletHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Leaflet Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map').setView([${initialCenter.latitude}, ${initialCenter.longitude}], ${initialCenter.zoom});
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        // Create custom icons
        const createIcon = (type) => {
          let iconUrl;
          let iconColor;
          
          switch(type) {
            case 'Nhà hàng':
              iconColor = '#FF5252';
              break;
            case 'Khách sạn':
              iconColor = '#2979FF';
              break;
            case 'Cửa hàng':
              iconColor = '#00C853';
              break;
            default:
              iconColor = '#9C27B0';
          }
          
          return L.divIcon({
            className: 'custom-marker',
            html: \`<div style="background-color:\${iconColor};border-radius:50%;width:20px;height:20px;"></div>\`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
          });
        };
        
        // Handle map click events
        let tempMarker = null;
        map.on('click', function(e) {
          if (tempMarker) {
            map.removeLayer(tempMarker);
          }
          
          tempMarker = L.marker(e.latlng).addTo(map);
          tempMarker.bindPopup(
            '<div><strong>Thêm mới</strong><br>' +
            '<button onclick="addFacility(' + e.latlng.lat + ', ' + e.latlng.lng + ')">Thêm cơ sở kinh doanh</button><br>' +
            '<button onclick="cancelMarker()">Hủy</button></div>'
          ).openPopup();
          
           window.ReactNativeWebView.postMessage(JSON.stringify({
             type: 'mapClick',
             latitude: e.latlng.lat,
             longitude: e.latlng.lng
           }));
        });
        
        // Function to add facility (called from popup)
        window.addFacility = function(lat, lng) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'addFacility',
            latitude: lat,
            longitude: lng
          }));
        };
        
        // Function to cancel temp marker
        window.cancelMarker = function() {
          if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
          }
            // window.ReactNativeWebView.postMessage(JSON.stringify({
            //   type: 'cancelMarker'
            // }));
        };
        
        // Function to add markers (called from React Native)
        window.addMarkers = function(markersData) {
          const markers = JSON.parse(markersData);
          
          // Clear existing markers first
          if (window.markersLayer) {
            map.removeLayer(window.markersLayer);
          }
          
          window.markersLayer = L.layerGroup().addTo(map);
          
          markers.forEach(marker => {
            const leafletMarker = L.marker(
              [marker.latitude, marker.longitude],
              { icon: createIcon(marker.type) }
            ).addTo(window.markersLayer);
            
            leafletMarker.bindPopup(
              '<div><strong>' + marker.name + '</strong><br>' +
              'Loại hình: ' + marker.type + '<br>' +
              'Địa chỉ: ' + marker.address + '<br><br>' +
              '<button onclick="reviewFacility(' + marker.id + ')">Đánh giá</button> ' +
              '<button onclick="viewReviews(' + marker.id + ')">Xem đánh giá</button></div>'
            );
          });
        };
        
        // Function to review facility
        window.reviewFacility = function(facilityId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'reviewFacility',
            facilityId: facilityId
          }));
        };
        
        // Function to view reviews
        window.viewReviews = function(facilityId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'viewReviews',
            facilityId: facilityId
          }));
        };
        
        // Function to focus on a specific facility
        window.focusOnFacility = function(lat, lng, zoom) {
          map.setView([lat, lng], zoom || 18);
        };
        
        // Send message when map is ready
        window.onload = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapLoaded'
          }));
        };
      </script>
    </body>
    </html>
  `;

  useEffect(() => {
    // Load facilities from API
    loadFacilities();
  }, []);

  useEffect(() => {
    // Update markers when filters change
    if (mapLoaded && facilities.length > 0) {
      updateMapMarkers();
    }
  }, [filters, facilities, mapLoaded]);

  useEffect(() => {
    // Filter facilities based on search keyword
    if (searchKeyword.trim() === '') {
      setFilteredFacilities([]);
      return;
    }

    const normalizedKeyword = removeVietnameseTones(searchKeyword.toLowerCase().trim());
    const filtered = facilities.filter(facility => {
      const normalizedName = removeVietnameseTones(facility.name.toLowerCase());
      return normalizedName.includes(normalizedKeyword);
    });
    
    setFilteredFacilities(filtered);
  }, [searchKeyword, facilities]);

  const loadFacilities = async () => {
    try {
      // In a real app, replace this with actual API call
      // const response = await fetch(`${API_URL}/api/services/app/Facility/GetList`);
      // const data = await response.json();
      // setFacilities(data.result);
      
      // For now, using mock data
      const mockFacilities = [
        {
          id: 1,
          name: 'Nhà hàng ABC',
          type: 'Nhà hàng',
          address: '123 Đường ABC, Thái Bình',
          latitude: 20.44879,
          longitude: 106.34259,
        },
        {
          id: 2,
          name: 'Khách sạn XYZ',
          type: 'Khách sạn',
          address: '456 Đường XYZ, Thái Bình',
          latitude: 20.45000,
          longitude: 106.34400,
        },
        {
          id: 3,
          name: 'Cửa hàng 123',
          type: 'Cửa hàng',
          address: '789 Đường 123, Thái Bình',
          latitude: 20.44700,
          longitude: 106.34100,
        },
      ];
      
      setFacilities(mockFacilities);
    } catch (error) {
      console.error('Error loading facilities:', error);
    }
  };

  const updateMapMarkers = () => {
    if (!webViewRef.current) return;
    
    // Filter facilities based on current filters
    const filteredMarkers = facilities.filter(facility => shouldShowFacility(facility));
    
    // Pass filtered markers to WebView
    webViewRef.current.injectJavaScript(`
      window.addMarkers('${JSON.stringify(filteredMarkers)}');
      true;
    `);
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapLoaded':
          setMapLoaded(true);
          break;
          
        case 'mapClick':
          setTempMarker({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          
          setNewFacility({
            ...newFacility,
            latitude: data.latitude,
            longitude: data.longitude,
          });
          break;
          
        case 'addFacility':
          setIsAddModalVisible(true);
          break;
          
        case 'cancelMarker':
          setTempMarker(null);
          break;
          
        case 'reviewFacility':
          const facilityToReview = facilities.find(f => f.id === data.facilityId);
          if (facilityToReview) {
            setSelectedFacility(facilityToReview);
            setIsReviewModalVisible(true);
          }
          break;
          
        case 'viewReviews':
          const facilityToView = facilities.find(f => f.id === data.facilityId);
          if (facilityToView) {
            handleViewReviews(facilityToView);
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const removeVietnameseTones = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const handleAddFacility = () => {
    setIsAddModalVisible(false);
    
    // In a real app, make an API call to add the facility
    // For now, add to local state
    const newFacilityObj = {
      id: facilities.length + 1,
      ...newFacility,
    };
    
    setFacilities([...facilities, newFacilityObj]);
    setTempMarker(null);
    setNewFacility({
      name: '',
      type: 'Nhà hàng',
      address: '',
      latitude: 0,
      longitude: 0,
    });
    
    // Clear temporary marker on the map
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.cancelMarker();
        true;
      `);
    }
  };

  const handleAddReview = () => {
    if (!selectedFacility) return;
    
    setIsReviewModalVisible(false);
    
    // In a real app, make an API call to add the review
    console.log('Review added:', {
      facilityId: selectedFacility.id,
      ...newReview,
    });
    
    setNewReview({
      reviewerName: '',
      rating: 5,
      content: '',
    });
  };

  const handleViewReviews = (facility) => {
    setSelectedFacility(facility);
    
    // In a real app, fetch reviews for this facility
    // For now, using mock data
    const mockReviews = [
      {
        id: 1,
        reviewerName: 'Người dùng 1',
        rating: 5,
        content: 'Rất tuyệt vời!',
      },
      {
        id: 2,
        reviewerName: 'Người dùng 2',
        rating: 4,
        content: 'Dịch vụ tốt.',
      },
    ];
    
    setReviews(mockReviews);
    setIsReviewListVisible(true);
  };

  const focusFacility = (facility) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.focusOnFacility(${facility.latitude}, ${facility.longitude}, 18);
        true;
      `);
    }
    
    setSearchKeyword('');
    setFilteredFacilities([]);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  const shouldShowFacility = (facility) => {
    switch (facility.type.toLowerCase()) {
      case 'nhà hàng':
        return filters.restaurant;
      case 'khách sạn':
        return filters.hotel;
      case 'cửa hàng':
        return filters.shop;
      default:
        return false;
    }
  };

  // Render the star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFD700"
          style={{marginRight: 2}}
        />
      );
    }
    return <View style={{flexDirection: 'row'}}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GIS Business Map</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cơ sở..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        </View>
        
        {/* Search Results */}
        {filteredFacilities.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={filteredFacilities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => focusFacility(item)}>
                  <Ionicons name="location" size={16} color="#AD40AF" />
                  <Text style={styles.searchResultText}>
                    {item.name} — {item.address}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      
      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <View style={styles.filterOption}>
          <Text style={styles.filterLabel}>Nhà hàng</Text>
          <Switch
            value={filters.restaurant}
            onValueChange={(value) => handleFilterChange('restaurant', value)}
            thumbColor={filters.restaurant ? '#AD40AF' : '#f4f3f4'}
            trackColor={{false: '#767577', true: '#e0b0e0'}}
          />
        </View>
        
        <View style={styles.filterOption}>
          <Text style={styles.filterLabel}>Khách sạn</Text>
          <Switch
            value={filters.hotel}
            onValueChange={(value) => handleFilterChange('hotel', value)}
            thumbColor={filters.hotel ? '#AD40AF' : '#f4f3f4'}
            trackColor={{false: '#767577', true: '#e0b0e0'}}
          />
        </View>
        
        <View style={styles.filterOption}>
          <Text style={styles.filterLabel}>Cửa hàng</Text>
          <Switch
            value={filters.shop}
            onValueChange={(value) => handleFilterChange('shop', value)}
            thumbColor={filters.shop ? '#AD40AF' : '#f4f3f4'}
            trackColor={{false: '#767577', true: '#e0b0e0'}}
          />
        </View>
      </View>
      
      {/* Map View */}
       <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
      />
      
      {/* Add Facility Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm cơ sở kinh doanh</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên cơ sở:</Text>
                <TextInput
                  style={styles.input}
                  value={newFacility.name}
                  onChangeText={(text) => setNewFacility({...newFacility, name: text})}
                  placeholder="Nhập tên cơ sở"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Loại hình:</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newFacility.type === 'Nhà hàng' && styles.pickerItemActive,
                    ]}
                    onPress={() => setNewFacility({...newFacility, type: 'Nhà hàng'})}>
                    <Text 
                      style={[
                        styles.pickerText,
                        newFacility.type === 'Nhà hàng' && styles.pickerTextActive,
                      ]}>
                      Nhà hàng
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newFacility.type === 'Khách sạn' && styles.pickerItemActive,
                    ]}
                    onPress={() => setNewFacility({...newFacility, type: 'Khách sạn'})}>
                    <Text 
                      style={[
                        styles.pickerText,
                        newFacility.type === 'Khách sạn' && styles.pickerTextActive,
                      ]}>
                      Khách sạn
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newFacility.type === 'Cửa hàng' && styles.pickerItemActive,
                    ]}
                    onPress={() => setNewFacility({...newFacility, type: 'Cửa hàng'})}>
                    <Text 
                      style={[
                        styles.pickerText,
                        newFacility.type === 'Cửa hàng' && styles.pickerTextActive,
                      ]}>
                      Cửa hàng
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Địa chỉ:</Text>
                <TextInput
                  style={styles.input}
                  value={newFacility.address}
                  onChangeText={(text) => setNewFacility({...newFacility, address: text})}
                  placeholder="Nhập địa chỉ"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tọa độ:</Text>
                <View style={styles.coordinateContainer}>
                  <View style={styles.coordinate}>
                    <Text style={styles.coordinateLabel}>Kinh độ:</Text>
                    <Text style={styles.coordinateValue}>
                      {newFacility.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordinate}>
                    <Text style={styles.coordinateLabel}>Vĩ độ:</Text>
                    <Text style={styles.coordinateValue}>
                      {newFacility.latitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddFacility}>
                <Text style={styles.submitButtonText}>Lưu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Gửi đánh giá cho {selectedFacility?.name}
              </Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Người đánh giá:</Text>
                <TextInput
                  style={styles.input}
                  value={newReview.reviewerName}
                  onChangeText={(text) => setNewReview({...newReview, reviewerName: text})}
                  placeholder="Tên bạn"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Đánh giá (1-5 sao):</Text>
                <View style={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewReview({...newReview, rating: star})}>
                      <Ionicons
                        name={star <= newReview.rating ? 'star' : 'star-outline'}
                        size={30}
                        color="#FFD700"
                        style={{marginRight: 10}}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bình luận:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newReview.content}
                  onChangeText={(text) => setNewReview({...newReview, content: text})}
                  placeholder="Nhập bình luận của bạn"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddReview}>
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* View Reviews Modal */}
      <Modal
        visible={isReviewListVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Đánh giá cho {selectedFacility?.name}
              </Text>
              <TouchableOpacity onPress={() => setIsReviewListVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                      <View style={styles.reviewRating}>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text style={styles.reviewContent}>{review.content}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>Chưa có đánh giá nào.</Text>
              )}
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  setIsReviewListVisible(false);
                  setIsReviewModalVisible(true);
                }}>
                <Text style={styles.submitButtonText}>Thêm đánh giá</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    marginRight: 30,
  },
  searchContainer: {
    padding: 10,
    position: 'relative',
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  searchResults: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 5,
    maxHeight: 200,
    zIndex: 100,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 5,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: 5,
    fontSize: 14,
    color: '#333',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 2,
  },
  pickerItemActive: {
    backgroundColor: '#AD40AF',
    borderColor: '#AD40AF',
  },
  pickerText: {
    color: '#333',
  },
  pickerTextActive: {
    color: '#fff',
  },
  coordinateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinate: {
    flex: 1,
    marginHorizontal: 5,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#666',
  },
  coordinateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#AD40AF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  reviewItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewContent: {
    fontSize: 14,
    color: '#666',
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
});
