import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Platform,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import styles from './HomeScreenStyles';

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
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  
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

  // State for reports
  const [reportData, setReportData] = useState({
    reporterName: '',
    phone: '',
    email: '',
    reportType: 'violation',
    content: '',
  });

  // Thêm state cho bottom sheet với 2 nấc
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const bottomSheetRef = useRef(null);
  const minHeight = 200;
  const maxHeight = Dimensions.get('window').height * 0.8;
  const bottomSheetAnim = useRef(new Animated.Value(minHeight)).current;
  const isMountedRef = useRef(true);
  
  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Simplify the panResponder to just detect drag direction
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10; // Only respond to significant vertical movement
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 20) {
          if (gestureState.dy < 0) {
            // Dragged UP - expand
            expandBottomSheet();
          } else {
            // Dragged DOWN - collapse
            collapseBottomSheet();
          }
        }
      }
    })
  ).current;
  
  // Functions to expand/collapse the bottom sheet
  const expandBottomSheet = () => {
    setIsBottomSheetExpanded(true);
    Animated.timing(bottomSheetAnim, {
      toValue: maxHeight,
      duration: 300,
      useNativeDriver: false
    }).start();
  };
  
  const collapseBottomSheet = () => {
    setIsBottomSheetExpanded(false);
    Animated.timing(bottomSheetAnim, {
      toValue: minHeight,
      duration: 300,
      useNativeDriver: false
    }).start();
  };
  
  // Toggle function for the handle bar button
  const toggleBottomSheet = () => {
    if (isBottomSheetExpanded) {
      collapseBottomSheet();
    } else {
      expandBottomSheet();
    }
  };

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
            
            // Add tooltips for showing business names when zoom level is >= 15
            if (currentZoom >= 15) {
              const tooltipOptions = { 
                permanent: true, 
                direction: 'right',
                className: 'custom-tooltip',
                offset: [10, 0]
              };
              leafletMarker.bindTooltip(marker.name, tooltipOptions);
            }
            
            // Add click event directly
            leafletMarker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'viewFacility',
                facilityId: marker.id
              }));
            });
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
        
        // Add custom tooltip styles
        const style = document.createElement('style');
        style.textContent = 
          '.custom-tooltip {' +
          '  background: white;' +
          '  border: none;' +
          '  box-shadow: 0 1px 3px rgba(0,0,0,0.2);' +
          '  border-radius: 4px;' +
          '  padding: 3px 8px;' +
          '  font-weight: 500;' +
          '  font-size: 12px;' +
          '  white-space: nowrap;' +
          '}' +
          '.custom-tooltip:before {' +
          '  display: none;' +
          '}';
        document.head.appendChild(style);
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
          phone: '0987654321',
          email: 'nhahangabc@example.com',
          facebook: 'https://facebook.com/nhahangabc',
          website: 'https://nhahangabc.com',
          openHours: '8:00 - 22:00',
          description: 'Nhà hàng ABC là một trong những nhà hàng nổi tiếng tại Thái Bình với các món ăn đặc sản địa phương. Được thành lập từ năm 2010, nhà hàng đã phục vụ hàng nghìn thực khách trong và ngoài tỉnh. Không gian nhà hàng được thiết kế hiện đại, thoáng mát phù hợp cho cả gia đình.',
        },
        {
          id: 2,
          name: 'Khách sạn XYZ',
          type: 'Khách sạn',
          address: '456 Đường XYZ, Thái Bình',
          latitude: 20.45000,
          longitude: 106.34400,
          phone: '0123456789',
          email: 'hotel@xyz.com',
          facebook: 'https://facebook.com/hotel.xyz',
          website: 'https://hotelxyz.com',
          openHours: '24/7',
          description: 'Khách sạn XYZ là khách sạn 4 sao với 100 phòng nghỉ tiện nghi. Khách sạn có vị trí trung tâm, thuận tiện cho việc di chuyển và tham quan các điểm du lịch. Khách sạn cung cấp dịch vụ đưa đón sân bay, nhà hàng, phòng hội nghị và các tiện nghi cao cấp khác.',
        },
        {
          id: 3,
          name: 'Cửa hàng 123',
          type: 'Cửa hàng',
          address: '789 Đường 123, Thái Bình',
          latitude: 20.44700,
          longitude: 106.34100,
          phone: '0345678912',
          email: 'shop@123.com',
          facebook: 'https://facebook.com/shop.123',
          website: 'https://shop123.com',
          openHours: '7:30 - 21:30',
          description: 'Cửa hàng 123 chuyên kinh doanh các sản phẩm địa phương chất lượng cao. Với 15 năm kinh nghiệm trong ngành bán lẻ, cửa hàng luôn đảm bảo mang đến cho khách hàng những sản phẩm chất lượng với giá cả hợp lý. Cửa hàng thường xuyên có các chương trình khuyến mãi hấp dẫn.',
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
    if (!isMountedRef.current) return;
    
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
          if (facilityToReview && isMountedRef.current) {
            setSelectedFacility(facilityToReview);
            setIsReviewModalVisible(true);
          }
          break;
          
        case 'viewReviews':
          const facilityToView = facilities.find(f => f.id === data.facilityId);
          if (facilityToView && isMountedRef.current) {
            handleViewFacilityDetails(facilityToView);
            setActiveTab('reviews');
          }
          break;
          
        case 'viewFacility':
          const facilityToShow = facilities.find(f => f.id === data.facilityId);
          if (facilityToShow && isMountedRef.current) {
            handleViewFacilityDetails(facilityToShow);
          }
          break;
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error parsing WebView message:', error);
      }
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

  const handleViewFacilityDetails = (facility) => {
    if (!isMountedRef.current) return;
    
    setSelectedFacility(facility);
    setBottomSheetVisible(true);
    setIsBottomSheetExpanded(false);
    bottomSheetAnim.setValue(minHeight);
    setActiveTab('overview');
    
    // Mặc định sẽ load đánh giá khi xem chi tiết
    if (isMountedRef.current) {
      const mockReviews = [
        {
          id: 1,
          reviewerName: 'Nguyễn Văn A',
          rating: 5,
          title: 'Dịch vụ xuất sắc!',
          content: 'Dịch vụ rất tuyệt vời! Nhân viên phục vụ chuyên nghiệp, không gian sạch sẽ và thoáng mát. Tôi sẽ quay lại vào lần sau. Đồ ăn ngon, giá cả phải chăng. Đặc biệt là món đặc sản địa phương rất đáng để thử.',
          date: '15/08/2023',
          likes: 12,
          replies: 3
        },
        {
          id: 2,
          reviewerName: 'Trần Thị B',
          rating: 4,
          title: 'Tốt nhưng vẫn có thể cải thiện',
          content: 'Dịch vụ tốt, giá cả phải chăng. Tuy nhiên, thời gian chờ đợi hơi lâu vào giờ cao điểm. Nhân viên thân thiện nhưng đôi khi phục vụ chậm. Không gian thoáng đãng, sạch sẽ. Sẽ quay lại nếu có cơ hội.',
          date: '20/07/2023',
          likes: 5,
          replies: 1
        },
        {
          id: 3,
          reviewerName: 'Lê Văn C',
          rating: 3,
          title: 'Trải nghiệm trung bình',
          content: 'Chất lượng dịch vụ ở mức trung bình. Cần cải thiện thêm về thái độ phục vụ của một số nhân viên. Đồ ăn ngon nhưng phần hơi nhỏ so với giá tiền. Vị trí thuận tiện, dễ tìm.',
          date: '05/06/2023',
          likes: 2,
          replies: 0
        }
      ];
      setReviews(mockReviews);
    }
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

  // Handle report submission
  const handleReportSubmit = () => {
    if (!selectedFacility) return;
    
    // Validate form
    if (!reportData.reporterName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên người báo cáo');
      return;
    }
    
    if (!reportData.phone.trim() && !reportData.email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại hoặc email');
      return;
    }
    
    if (!reportData.content.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung phản ánh');
      return;
    }
    
    // In a real app, make an API call to submit the report
    console.log('Report submitted:', {
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      ...reportData,
    });
    
    // Close modal and reset form
    setIsReportModalVisible(false);
    
    // Show success message
    Alert.alert(
      'Thành công',
      'Phản ánh của bạn đã được gửi thành công tới cơ quan chức năng',
      [{ text: 'OK' }]
    );
    
    // Reset form data
    setReportData({
      reporterName: '',
      phone: '',
      email: '',
      reportType: 'violation',
      content: '',
    });
  };

  // Thêm component cho tab content
  const renderOverviewTab = () => {
    if (!selectedFacility) {
      return <View style={styles.emptyContent}><Text>Không có dữ liệu</Text></View>;
    }
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 30}}>
        <Text style={styles.infoTitle}>Địa chỉ</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#085924" style={styles.infoIcon} />
          <Text style={styles.infoText}>{selectedFacility.address || 'Chưa có thông tin'}</Text>
        </View>
        
        <Text style={styles.infoTitle}>Loại hình</Text>
        <View style={styles.infoRow}>
          <Ionicons 
            name={
              selectedFacility.type === 'Nhà hàng' ? 'restaurant-outline' : 
              selectedFacility.type === 'Khách sạn' ? 'bed-outline' : 'cart-outline'
            } 
            size={20} 
            color="#085924" 
            style={styles.infoIcon} 
          />
          <Text style={styles.infoText}>{selectedFacility.type || 'Chưa phân loại'}</Text>
        </View>
        
        {selectedFacility.phone && (
          <>
            <Text style={styles.infoTitle}>Liên hệ</Text>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#085924" style={styles.infoIcon} />
              <Text style={styles.infoText}>{selectedFacility.phone}</Text>
            </View>
          </>
        )}
        
        {selectedFacility.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#085924" style={styles.infoIcon} />
            <Text style={styles.infoText}>{selectedFacility.email}</Text>
          </View>
        )}
        
        {selectedFacility.openHours && (
          <>
            <Text style={styles.infoTitle}>Giờ mở cửa</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#085924" style={styles.infoIcon} />
              <Text style={styles.infoText}>{selectedFacility.openHours}</Text>
            </View>
          </>
        )}
        
        <Text style={styles.infoTitle}>Liên kết</Text>
        <View style={styles.socialLinks}>
          {selectedFacility.facebook && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => {
                Alert.alert(
                  "Mở liên kết ngoài",
                  "Bạn muốn mở trang Facebook của cơ sở này?",
                  [
                    { text: "Hủy", style: "cancel" },
                    { text: "Mở", onPress: () => console.log("Mở Facebook:", selectedFacility.facebook) }
                  ]
                );
              }}
            >
              <Ionicons name="logo-facebook" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          )}
          
          {selectedFacility.website && (
            <TouchableOpacity 
              style={[styles.socialButton, {backgroundColor: '#4285F4'}]}
              onPress={() => {
                Alert.alert(
                  "Mở liên kết ngoài",
                  "Bạn muốn mở trang web của cơ sở này?",
                  [
                    { text: "Hủy", style: "cancel" },
                    { text: "Mở", onPress: () => console.log("Mở website:", selectedFacility.website) }
                  ]
                );
              }}
            >
              <Ionicons name="globe-outline" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          
          {!selectedFacility.facebook && !selectedFacility.website && (
            <Text style={styles.noDataText}>Chưa có liên kết</Text>
          )}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          {/* <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsReviewModalVisible(true)}
          >
            <Ionicons name="star-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đánh giá</Text>
          </TouchableOpacity>
           */}
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: '#e74c3c'}]}
            onPress={() => setIsReportModalVisible(true)}
          >
            <Ionicons name="warning-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Phản ánh lên cơ quan chức năng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderReviewsTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent} 
        contentContainerStyle={{paddingBottom: 30}}
        nestedScrollEnabled={true}
      >
        <View style={styles.ratingOverview}>
          <View style={styles.ratingScoreContainer}>
            <Text style={styles.ratingScoreText}>4.2</Text>
            <View style={styles.ratingStarsSmall}>
              {renderStars(4.2)}
            </View>
            <Text style={styles.ratingCountText}>dựa trên 28 đánh giá</Text>
          </View>
          
          <View style={styles.ratingBarsContainer}>
            <View style={styles.ratingBarRow}>
              <Text style={styles.ratingBarLabel}>5</Text>
              <View style={styles.ratingBarBackground}>
                <View style={[styles.ratingBarFill, {width: '65%'}]} />
              </View>
            </View>
            <View style={styles.ratingBarRow}>
              <Text style={styles.ratingBarLabel}>4</Text>
              <View style={styles.ratingBarBackground}>
                <View style={[styles.ratingBarFill, {width: '20%'}]} />
              </View>
            </View>
            <View style={styles.ratingBarRow}>
              <Text style={styles.ratingBarLabel}>3</Text>
              <View style={styles.ratingBarBackground}>
                <View style={[styles.ratingBarFill, {width: '10%'}]} />
              </View>
            </View>
            <View style={styles.ratingBarRow}>
              <Text style={styles.ratingBarLabel}>2</Text>
              <View style={styles.ratingBarBackground}>
                <View style={[styles.ratingBarFill, {width: '3%'}]} />
              </View>
            </View>
            <View style={styles.ratingBarRow}>
              <Text style={styles.ratingBarLabel}>1</Text>
              <View style={styles.ratingBarBackground}>
                <View style={[styles.ratingBarFill, {width: '2%'}]} />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.reviewsHeaderContainer}>
          <Text style={styles.reviewsHeaderText}>Đánh giá gần đây</Text>
          <TouchableOpacity
            onPress={() => setIsReviewModalVisible(true)}
          >
            <Text style={styles.writeReviewLink}>Viết đánh giá</Text>
          </TouchableOpacity>
        </View>
        
        {reviews.length > 0 ? (
          // Use View to render reviews manually to avoid FlatList nesting in ScrollView
          <View>
            {reviews.map(item => (
              <View key={item.id.toString()} style={styles.reviewItem}>
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
                
                {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                <Text style={styles.reviewContent}>{item.content}</Text>
                
                <View style={styles.reviewActions}>
                  <TouchableOpacity style={styles.reviewAction}>
                    <Ionicons name="thumbs-up-outline" size={18} color="#666" />
                    <Text style={styles.reviewActionText}>{item.likes || 0}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.reviewAction}>
                    <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    <Text style={styles.reviewActionText}>{item.replies || 0}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Add separator after each item except the last one */}
                {item.id !== reviews[reviews.length - 1].id && (
                  <View style={styles.reviewSeparator} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReviews}>
            <Ionicons name="star-outline" size={50} color="#ccc" />
            <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
            <TouchableOpacity 
              style={styles.addReviewButton}
              onPress={() => setIsReviewModalVisible(true)}>
              <Text style={styles.addReviewButtonText}>Thêm đánh giá đầu tiên</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderAboutTab = () => {
    if (!selectedFacility) return null;
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 30}}>
        <Text style={styles.aboutTitle}>Thông tin chi tiết</Text>
        <Text style={styles.aboutDescription}>
          {selectedFacility.description || "Chưa có thông tin chi tiết về cơ sở này."}
        </Text>
        
        <Text style={styles.aboutTitle}>Tiện ích</Text>
        <View style={styles.facilitiesContainer}>
          <View style={styles.facilityItem}>
            <Ionicons name="wifi" size={24} color="#085924" />
            <Text style={styles.facilityText}>Wifi miễn phí</Text>
          </View>
          
          <View style={styles.facilityItem}>
            <Ionicons name="car" size={24} color="#085924" />
            <Text style={styles.facilityText}>Bãi đỗ xe</Text>
          </View>
          
          <View style={styles.facilityItem}>
            <Ionicons name="card" size={24} color="#085924" />
            <Text style={styles.facilityText}>Thanh toán thẻ</Text>
          </View>
          
          <View style={styles.facilityItem}>
            <Ionicons name="walk" size={24} color="#085924" />
            <Text style={styles.facilityText}>Lối đi cho người khuyết tật</Text>
          </View>
        </View>
        
        <Text style={styles.aboutTitle}>Vị trí</Text>
        <View style={styles.mapPreviewContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={50} color="#ccc" />
            <Text style={styles.mapPlaceholderText}>Bản đồ chi tiết</Text>
          </View>
        </View>
      </ScrollView>
    );
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
          <Ionicons name="search" size={20} color="#085924" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cơ sở..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#888"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <Ionicons name="close-circle" size={20} color="#085924" />
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
                  <Ionicons name="chevron-forward" size={16} color="#085924" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      
      {/* Bottom Sheet */}
      {bottomSheetVisible && selectedFacility && (
        <Animated.View 
          ref={bottomSheetRef}
          style={[
            styles.bottomSheet,
            { height: bottomSheetAnim }
          ]}
        >
          {/* Handle area */}
          <View style={styles.handleArea}>
            <TouchableOpacity 
              style={styles.handleContainer}
              onPress={toggleBottomSheet}
              activeOpacity={0.7}
            >
              <View style={styles.handleBar} />
            </TouchableOpacity>
            
            {/* Drag overlay */}
            <View
              style={styles.dragOverlay}
              {...panResponder.panHandlers}
            />
          </View>
          
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.facilityName} numberOfLines={1} ellipsizeMode="tail">
              {selectedFacility.name}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setBottomSheetVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Tổng quan
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]} 
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Bài đánh giá
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                Giới thiệu
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContentContainer}>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
            {activeTab === 'about' && renderAboutTab()}
          </View>
        </Animated.View>
      )}
      
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
      
      {/* Add Report Modal */}
      <Modal
        visible={isReportModalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phản ánh lên cơ quan chức năng</Text>
              <TouchableOpacity onPress={() => setIsReportModalVisible(false)}>
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
                <Text style={styles.label}>Họ tên người phản ánh: <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={reportData.reporterName}
                  onChangeText={(text) => setReportData({...reportData, reporterName: text})}
                  placeholder="Nhập họ tên"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Số điện thoại:</Text>
                <TextInput
                  style={styles.input}
                  value={reportData.phone}
                  onChangeText={(text) => setReportData({...reportData, phone: text})}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={styles.input}
                  value={reportData.email}
                  onChangeText={(text) => setReportData({...reportData, email: text})}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Loại phản ánh:</Text>
                <View style={styles.reportTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.reportTypeOption,
                      reportData.reportType === 'violation' && styles.reportTypeOptionActive
                    ]}
                    onPress={() => setReportData({...reportData, reportType: 'violation'})}
                  >
                    <Text style={[
                      styles.reportTypeText,
                      reportData.reportType === 'violation' && styles.reportTypeTextActive
                    ]}>Vi phạm pháp luật</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.reportTypeOption,
                      reportData.reportType === 'service' && styles.reportTypeOptionActive
                    ]}
                    onPress={() => setReportData({...reportData, reportType: 'service'})}
                  >
                    <Text style={[
                      styles.reportTypeText,
                      reportData.reportType === 'service' && styles.reportTypeTextActive
                    ]}>Phản ánh dịch vụ</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.reportTypeOption,
                      reportData.reportType === 'other' && styles.reportTypeOptionActive
                    ]}
                    onPress={() => setReportData({...reportData, reportType: 'other'})}
                  >
                    <Text style={[
                      styles.reportTypeText,
                      reportData.reportType === 'other' && styles.reportTypeTextActive
                    ]}>Khác</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nội dung phản ánh: <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportData.content}
                  onChangeText={(text) => setReportData({...reportData, content: text})}
                  placeholder="Nhập nội dung phản ánh chi tiết..."
                  multiline={true}
                  numberOfLines={5}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.submitButton, {backgroundColor: '#e74c3c'}]}
                onPress={handleReportSubmit}>
                <Text style={styles.submitButtonText}>Gửi phản ánh</Text>
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
