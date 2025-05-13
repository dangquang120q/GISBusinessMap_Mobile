import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Dữ liệu mẫu cho cơ sở
const MOCK_FACILITIES = [
  {
    id: '1',
    name: 'Siêu thị Vinmart Hải Phòng',
    address: '384 Đường Lạch Tray, Đằng Giang, Ngô Quyền, Hải Phòng',
    phone: '0225 3831 685',
    latitude: 20.849717,
    longitude: 106.688983,
    averageRating: 4.5,
    reviewCount: 28,
    type: 'Cửa hàng'
  },
  {
    id: '2',
    name: 'Nhà hàng Hải Sản Biển Đông',
    address: '25 Lê Hồng Phong, Đông Khê, Ngô Quyền, Hải Phòng',
    phone: '0225 3551 234',
    latitude: 20.856982,
    longitude: 106.692443,
    averageRating: 4.2,
    reviewCount: 45,
    type: 'Nhà hàng'
  },
  {
    id: '3',
    name: 'Cà phê Highland Coffee Trần Phú',
    address: '20 Trần Phú, Hoàng Văn Thụ, Hồng Bàng, Hải Phòng',
    phone: '0225 3842 345',
    latitude: 20.857883,
    longitude: 106.683621,
    averageRating: 4.0,
    reviewCount: 31,
    type: 'Nhà hàng'
  },
  {
    id: '4',
    name: 'Cửa hàng điện thoại FPT Shop',
    address: '116 Lạch Tray, Lạch Tray, Ngô Quyền, Hải Phòng',
    phone: '0225 3626 789',
    latitude: 20.853197,
    longitude: 106.687158,
    averageRating: 3.8,
    reviewCount: 16,
    type: 'Cửa hàng'
  },
  {
    id: '5',
    name: 'Khách sạn Vin Pearl Hải Phòng',
    address: '229 Lê Lợi, Máy Tơ, Ngô Quyền, Hải Phòng',
    phone: '0225 3823 456',
    latitude: 20.851329,
    longitude: 106.695369,
    averageRating: 4.3,
    reviewCount: 22,
    type: 'Khách sạn'
  }
];

// Dữ liệu mẫu cho đánh giá
const MOCK_REVIEWS = {
  '1': [
    {
      id: '101',
      reviewerName: 'Nguyễn Văn A',
      rating: 5,
      content: 'Siêu thị rộng rãi, sạch sẽ, hàng hóa đa dạng và giá cả hợp lý. Nhân viên phục vụ tận tình.',
      date: '15/07/2023'
    },
    {
      id: '102',
      reviewerName: 'Trần Thị B',
      rating: 4,
      content: 'Siêu thị đầy đủ các mặt hàng, giá cả phải chăng. Chỉ tiếc là hơi đông vào cuối tuần.',
      date: '20/08/2023'
    },
  ],
  '2': [
    {
      id: '201',
      reviewerName: 'Phạm Thị D',
      rating: 5,
      content: 'Hải sản tươi ngon, giá hợp lý. Đặc biệt món cua sốt ớt rất ngon.',
      date: '10/06/2023'
    },
    {
      id: '202',
      reviewerName: 'Đỗ Văn E',
      rating: 3,
      content: 'Đồ ăn ngon nhưng phục vụ hơi chậm vào giờ cao điểm. Cần cải thiện thêm.',
      date: '25/07/2023'
    }
  ],
  '3': [
    {
      id: '301',
      reviewerName: 'Hoàng Thị F',
      rating: 4,
      content: 'Không gian đẹp, đồ uống ngon. Wifi mạnh, phù hợp để làm việc.',
      date: '05/08/2023'
    }
  ],
  '4': [
    {
      id: '401',
      reviewerName: 'Lý Văn G',
      rating: 3,
      content: 'Nhân viên tư vấn nhiệt tình, giá hơi cao so với mặt bằng chung.',
      date: '10/09/2023'
    }
  ],
  '5': [
    {
      id: '501',
      reviewerName: 'Trương Thị H',
      rating: 4,
      content: 'Khách sạn sạch sẽ, nhân viên chuyên nghiệp. Vị trí thuận tiện để đi tham quan.',
      date: '30/08/2023'
    }
  ]
};

export default function GuestHomeScreen() {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [facilities, setFacilities] = useState(MOCK_FACILITIES);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isReviewListVisible, setIsReviewListVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  // State for filters
  const [filters, setFilters] = useState({
    restaurant: true,
    hotel: true,
    shop: true,
  });
  
  // Initial map center point
  const initialCenter = {
    latitude: 20.852,
    longitude: 106.688,
    zoom: 14
  };

  useEffect(() => {
    // Effect to update filtered facilities based on search text
    if (searchText.trim() === '') {
      setFilteredFacilities([]);
      return;
    }

    const normalizedKeyword = searchText.toLowerCase().trim();
    const filtered = facilities.filter(facility => 
      facility.name.toLowerCase().includes(normalizedKeyword) ||
      facility.address.toLowerCase().includes(normalizedKeyword)
    );
    
    setFilteredFacilities(filtered);
  }, [searchText]);

  useEffect(() => {
    // Update map markers when filters change or map loads
    if (mapLoaded) {
      updateMapMarkers();
    }
  }, [filters, mapLoaded]);

  // HTML for the leaflet map
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style>
          body, html, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          
          .custom-popup .leaflet-popup-content-wrapper {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            overflow: hidden;
          }
          
          .custom-popup .leaflet-popup-content {
            margin: 14px 14px;
            font-family: 'Arial', sans-serif;
            min-width: 240px;
          }
          
          .custom-popup .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.98);
          }
          
          .facility-image {
            width: 100%;
            height: 120px;
            background-color: #f0f0f0;
            background-size: cover;
            background-position: center;
            margin-bottom: 10px;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .facility-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .facility-title {
            font-weight: bold;
            font-size: 16px;
            color: #333;
            margin-bottom: 5px;
          }
          
          .facility-info {
            margin-bottom: 12px;
            font-size: 14px;
            color: #555;
          }
          
          .facility-actions {
            display: flex;
            justify-content: space-between;
          }
          
          .action-button {
            background-color: #085924;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .action-button:hover {
            background-color: #085924;
          }
          
          .action-button.secondary {
            background-color: #6c757d;
          }
          
          .action-button.secondary:hover {
            background-color: #5a6268;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map
          var map = L.map('map').setView([${initialCenter.latitude}, ${initialCenter.longitude}], ${initialCenter.zoom});
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);
          
          // Layer for markers
          var markersLayer = L.layerGroup().addTo(map);
          
          // Function for custom icons based on type
          function getCustomIcon(type) {
            let iconName, iconColor;
            
            switch(type) {
              case 'Nhà hàng':
                iconName = 'fa-utensils';
                iconColor = '#FF5252';
                break;
              case 'Khách sạn':
                iconName = 'fa-bed';
                iconColor = '#2979FF';
                break;
              case 'Cửa hàng':
                iconName = 'fa-store';
                iconColor = '#00C853';
                break;
              default:
                iconName = 'fa-building';
                iconColor = '#085924';
            }
            
            return L.divIcon({
              className: 'custom-marker',
              html: \`<div style="display:flex;justify-content:center;align-items:center;width:40px;height:40px;background-color:white;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.3);">
                <i class="fas \${iconName}" style="color:\${iconColor};font-size:20px;"></i>
              </div>\`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20]
            });
          }
          
          // Add markers to the map
          function addMarkers(facilities) {
            markersLayer.clearLayers();
            
            facilities.forEach(facility => {
              const marker = L.marker(
                [facility.latitude, facility.longitude],
                { icon: getCustomIcon(facility.type) }
              ).addTo(markersLayer);
              
              marker.bindPopup(
                '<div class="facility-header">' +
                '<div class="facility-title">' + facility.name + '</div>' +
                '</div>' +
                '<div class="facility-image" style="background-image: url(\'https://via.placeholder.com/300x150?text=' + encodeURIComponent(facility.name) + '\')"></div>' +
                '<div class="facility-info">' +
                '<strong>Loại hình:</strong> ' + facility.type + '<br>' +
                '<strong>Địa chỉ:</strong> ' + facility.address +
                '</div>' +
                '<div class="facility-actions">' +
                '<button class="action-button" onclick="login()">Đánh giá</button> ' +
                '<button class="action-button secondary" onclick="viewReviews(\'' + facility.id + '\')">Xem đánh giá</button>' +
                '</div>',
                { className: 'custom-popup' }
              );
            });
          }
          
          // Send facility ID to React Native for reviews
          function viewReviews(facilityId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewReviews',
              facilityId: facilityId
            }));
          }
          
          // Send login request to React Native
          function login() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'login'
            }));
          }
          
          // Focus on a specific facility
          function focusOnFacility(lat, lng) {
            map.setView([lat, lng], 18);
          }
          
          // Inform React Native that map is loaded
          window.onload = function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          };
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapLoaded') {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        updateMapMarkers();
      } else if (data.type === 'viewReviews' && data.facilityId) {
        const facility = facilities.find(f => f.id === data.facilityId);
        if (facility) {
          setSelectedFacility(facility);
          setReviews(MOCK_REVIEWS[data.facilityId] || []);
          setIsReviewListVisible(true);
        }
      } else if (data.type === 'login') {
        handleLogin();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const updateMapMarkers = () => {
    if (webViewRef.current) {
      // Filter facilities based on current filters
      const filteredMarkers = facilities.filter(facility => {
        if (!facility.type) return true;
        
        switch(facility.type.toLowerCase()) {
          case 'nhà hàng':
            return filters.restaurant;
          case 'khách sạn':
            return filters.hotel;
          case 'cửa hàng':
            return filters.shop;
          default:
            return true;
        }
      });
      
      webViewRef.current.injectJavaScript(`
        try {
          addMarkers(${JSON.stringify(filteredMarkers)});
        } catch (e) {
          console.error('Error updating markers:', e);
        }
        true;
      `);
    }
  };

  const focusFacility = (facility) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        focusOnFacility(${facility.latitude}, ${facility.longitude});
        true;
      `);
    }
    
    setSearchText('');
    setFilteredFacilities([]);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  const handleLogin = () => {
    navigation.navigate('LoginScreen', { screen: 'Login' });
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
        onError={(e) => console.error('WebView error:', e.nativeEvent)}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#085924" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cơ sở..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#085924" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Controls */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filters.restaurant && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange('restaurant', !filters.restaurant)}
          >
            <Ionicons 
              name="restaurant" 
              size={18} 
              color={filters.restaurant ? "#fff" : "#666"} 
              style={styles.filterButtonIcon}
            />
            <Text style={[
              styles.filterButtonText,
              filters.restaurant && styles.filterButtonTextActive
            ]}>Nhà hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filters.hotel && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange('hotel', !filters.hotel)}
          >
            <Ionicons 
              name="bed" 
              size={18} 
              color={filters.hotel ? "#fff" : "#666"}
              style={styles.filterButtonIcon}
            />
            <Text style={[
              styles.filterButtonText,
              filters.hotel && styles.filterButtonTextActive
            ]}>Khách sạn</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filters.shop && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange('shop', !filters.shop)}
          >
            <Ionicons 
              name="cart" 
              size={18} 
              color={filters.shop ? "#fff" : "#666"}
              style={styles.filterButtonIcon}
            />
            <Text style={[
              styles.filterButtonText,
              filters.shop && styles.filterButtonTextActive
            ]}>Cửa hàng</Text>
          </TouchableOpacity>
        </ScrollView>
        
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
                  <View style={styles.searchResultIconContainer}>
                    <Ionicons 
                      name={
                        item.type === 'Nhà hàng' ? "restaurant" : 
                        item.type === 'Khách sạn' ? "bed" : "cart"
                      } 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.searchResultTextContainer}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultAddress}>{item.address}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#085924" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      
      {/* Login Notice Banner */}
      <View style={styles.loginBanner}>
        <Text style={styles.loginText}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
      
      {/* Reviews List Modal */}
      <Modal
        visible={isReviewListVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReviewListVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá về cơ sở</Text>
              <TouchableOpacity onPress={() => setIsReviewListVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedFacility && (
                <View style={styles.selectedFacilityInfo}>
                  <Text style={styles.selectedFacilityName}>{selectedFacility.name}</Text>
                  <Text style={styles.selectedFacilityAddress}>{selectedFacility.address}</Text>
                </View>
              )}
              
              {reviews.length > 0 ? (
                <FlatList
                  data={reviews}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) => (
                    <View style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                              {item.reviewerName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                            <Text style={styles.reviewDate}>{item.date}</Text>
                          </View>
                        </View>
                        <View style={styles.ratingRow}>
                          {renderStars(item.rating)}
                        </View>
                      </View>
                      <Text style={styles.reviewContent}>{item.content}</Text>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
                  style={styles.reviewsList}
                />
              ) : (
                <View style={styles.emptyReviews}>
                  <Ionicons name="star-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
                  <TouchableOpacity 
                    style={styles.addReviewButton}
                    onPress={() => {
                      setIsReviewListVisible(false);
                      handleLogin();
                    }}>
                    <Text style={styles.addReviewButtonText}>Đăng nhập để đánh giá</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  filterScrollView: {
    marginTop: 10,
    marginBottom: 5,
    height: 45,
  },
  filterScrollContent: {
    paddingHorizontal: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#085924',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterButtonIcon: {
    marginRight: 5,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
    zIndex: 100,
    position: 'absolute',
    top: 105,
    left: 0,
    right: 0,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#085924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  searchResultName: {
    fontSize: 14,
    color: '#333',
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#666',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loginBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: '#085924',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Modal Styles
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
  selectedFacilityInfo: {
    marginBottom: 15,
  },
  selectedFacilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedFacilityAddress: {
    fontSize: 14,
    color: '#666',
  },
  reviewsList: {
    maxHeight: '80%',
  },
  reviewItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#085924',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
  },
  reviewContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyReviewsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  addReviewButton: {
    backgroundColor: '#085924',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 