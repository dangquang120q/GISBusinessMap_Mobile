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
  
  // States for modals
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewListVisible, setIsReviewListVisible] = useState(false);
  
  // States for filters
  const [filters, setFilters] = useState({
    restaurant: true,
    hotel: true,
    shop: true,
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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>
        body, html, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 3px 14px rgba(0,0,0,0.2);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 12px 12px;
          font-family: 'Arial', sans-serif;
          min-width: 200px;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        
        .facility-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        .facility-title {
          font-weight: bold;
          font-size: 16px;
          color: #333;
          margin-bottom: 3px;
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
          background-color: #AD40AF;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .action-button:hover {
          background-color: #9C27B0;
        }
        
        .action-button.secondary {
          background-color: #6c757d;
        }
        
        .action-button.secondary:hover {
          background-color: #5a6268;
        }
        
        .zoom-controls {
          position: absolute;
          right: 15px;
          bottom: 80px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }
        
        .zoom-button {
          background-color: white;
          border: 2px solid rgba(0,0,0,0.2);
          border-radius: 4px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }
        
        .zoom-button:active {
          background-color: #f4f4f4;
          transform: scale(0.95);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="zoom-controls">
        <div class="zoom-button" id="zoom-in">+</div>
        <div class="zoom-button" id="zoom-out">-</div>
      </div>
      <script>
        // Initialize map
        const map = L.map('map', {
          zoomControl: false // Disable default zoom controls
        }).setView([${initialCenter.latitude}, ${initialCenter.longitude}], ${initialCenter.zoom});
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        // Create custom icons based on zoom level
        const createIcon = (type, zoom) => {
          let iconName;
          let iconColor;
          let iconSize;
          
          // Determine icon and color based on facility type
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
              iconColor = '#9C27B0';
          }
          
          // Determine size based on zoom level
          if (zoom >= 18) {
            iconSize = 32;
          } else if (zoom >= 16) {
            iconSize = 24;
          } else if (zoom >= 14) {
            iconSize = 18;
          } else if (zoom >= 12) {
            iconSize = 14;
          } else {
            iconSize = 10;
          }
          
          return L.divIcon({
            className: 'custom-marker',
            html: \`<div style="display:flex;justify-content:center;align-items:center;width:\${iconSize + 8}px;height:\${iconSize + 8}px;background-color:white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
              <i class="fas \${iconName}" style="color:\${iconColor};font-size:\${iconSize}px;"></i>
            </div>\`,
            iconSize: [iconSize + 8, iconSize + 8],
            iconAnchor: [(iconSize + 8)/2, (iconSize + 8)/2],
            popupAnchor: [0, -((iconSize + 8)/2)]
          });
        };
        
        // Update markers when zoom changes
        map.on('zoomend', function() {
          if (window.markersData && window.markersData.length > 0) {
            updateMarkers(window.markersData);
          }
        });
        
        // Function to update markers based on current zoom level
        function updateMarkers(markers) {
          const currentZoom = map.getZoom();
          
          // Clear existing markers first
          if (window.markersLayer) {
            map.removeLayer(window.markersLayer);
          }
          
          window.markersLayer = L.layerGroup().addTo(map);
          
          // Don't show markers below zoom level 10
          if (currentZoom < 10) return;
          
          markers.forEach(marker => {
            const leafletMarker = L.marker(
              [marker.latitude, marker.longitude],
              { icon: createIcon(marker.type, currentZoom) }
            ).addTo(window.markersLayer);
            
            leafletMarker.bindPopup(
              '<div class="facility-header">' +
              '<div class="facility-title">' + marker.name + '</div>' +
              '</div>' +
              '<div class="facility-info">' +
              '<strong>Loại hình:</strong> ' + marker.type + '<br>' +
              '<strong>Địa chỉ:</strong> ' + marker.address +
              '</div>' +
              '<div class="facility-actions">' +
              '<button class="action-button" onclick="reviewFacility(' + marker.id + ')">Đánh giá</button> ' +
              '<button class="action-button secondary" onclick="viewReviews(' + marker.id + ')">Xem đánh giá</button>' +
              '</div>',
              { className: 'custom-popup' }
            );
          });
        }
        
        // Function to add markers (called from React Native)
        window.addMarkers = function(markersData) {
          const markers = JSON.parse(markersData);
          window.markersData = markers; // Save for zoom updates
          updateMarkers(markers);
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
        
        // Custom zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
          map.zoomIn();
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
          map.zoomOut();
        });
        
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
          setSelectedFacility({
            latitude: data.latitude,
            longitude: data.longitude,
          });
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
        reviewerName: 'Nguyễn Văn A',
        rating: 5,
        content: 'Dịch vụ rất tuyệt vời! Nhân viên phục vụ chuyên nghiệp, không gian sạch sẽ và thoáng mát. Tôi sẽ quay lại vào lần sau.',
        date: '15/08/2023'
      },
      {
        id: 2,
        reviewerName: 'Trần Thị B',
        rating: 4,
        content: 'Dịch vụ tốt, giá cả phải chăng. Tuy nhiên, thời gian chờ đợi hơi lâu vào giờ cao điểm.',
        date: '20/07/2023'
      },
      {
        id: 3,
        reviewerName: 'Lê Văn C',
        rating: 3,
        content: 'Chất lượng dịch vụ ở mức trung bình. Cần cải thiện thêm về thái độ phục vụ của một số nhân viên.',
        date: '05/06/2023'
      },
      {
        id: 4,
        reviewerName: 'Phạm Thị D',
        rating: 5,
        content: 'Rất hài lòng với trải nghiệm tại đây. Không gian thoáng, sạch sẽ và nhân viên rất thân thiện.',
        date: '12/05/2023'
      },
      {
        id: 5,
        reviewerName: 'Hoàng Văn E',
        rating: 2,
        content: 'Không hài lòng lắm. Giá cả hơi cao so với chất lượng dịch vụ. Cần cải thiện nhiều.',
        date: '03/04/2023'
      }
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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#AD40AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cơ sở..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#888"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <Ionicons name="close-circle" size={20} color="#AD40AF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Controls - Google Maps Style */}
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
                  <Ionicons name="chevron-forward" size={16} color="#AD40AF" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      
      
      {/* Add Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá cơ sở</Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedFacility && (
                <View style={styles.selectedFacilityInfo}>
                  <Text style={styles.selectedFacilityName}>{selectedFacility.name}</Text>
                  <Text style={styles.selectedFacilityAddress}>{selectedFacility.address}</Text>
                </View>
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên của bạn:</Text>
                <TextInput
                  style={styles.input}
                  value={newReview.reviewerName}
                  onChangeText={(text) => setNewReview({...newReview, reviewerName: text})}
                  placeholder="Nhập tên của bạn"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Đánh giá (1-5 sao):</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewReview({...newReview, rating: star})}>
                      <Ionicons
                        name={star <= newReview.rating ? "star" : "star-outline"}
                        size={30}
                        color="#FFD700"
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nội dung đánh giá:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newReview.content}
                  onChangeText={(text) => setNewReview({...newReview, content: text})}
                  placeholder="Nhập nội dung đánh giá..."
                  multiline={true}
                  numberOfLines={5}
                />
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddReview}>
                <Text style={styles.submitButtonText}>Thêm đánh giá</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Reviews List Modal */}
      <Modal
        visible={isReviewListVisible}
        transparent={true}
        animationType="slide">
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
                      setIsReviewModalVisible(true);
                    }}>
                    <Text style={styles.addReviewButtonText}>Thêm đánh giá đầu tiên</Text>
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
    backgroundColor: '#AD40AF',
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
    backgroundColor: '#AD40AF',
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
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  starIcon: {
    marginRight: 10,
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#AD40AF',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
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
    backgroundColor: '#AD40AF',
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
    backgroundColor: '#AD40AF',
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
