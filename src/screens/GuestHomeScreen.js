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
import styles from './GuestHomeScreenStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Demo API URL - replace with your actual API URL
// import {API_URL} from '../config/api';

// Mock facility types and their icons
// const FACILITY_TYPES = {
//   'Nhà hàng': require('../assets/images/restaurant_icon.png'),
//   'Khách sạn': require('../assets/images/hotel_icon.png'),
//   'Cửa hàng': require('../assets/images/shop_icon.png'),
// };

export default function GuestHomeScreen() {
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
    // Track selected marker for map
    const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  // States for modals
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewListVisible, setIsReviewListVisible] = useState(false);
  const [isMapTypeModalVisible, setIsMapTypeModalVisible] = useState(false);
  
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

  // Add a mounted ref to track component mount state
  const isMountedRef = useRef(true);

  // Thêm state cho bottom sheet và các tab
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const bottomSheetRef = useRef(null);
  const minHeight = 200;
  const maxHeight = Dimensions.get('window').height * 0.9;
  const bottomSheetAnim = useRef(new Animated.Value(minHeight)).current;
  
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

  // Cập nhật UI khi bottomSheetHeight thay đổi
  useEffect(() => {
    // Đặt lại animated value khi bottomSheetHeight thay đổi
    bottomSheetAnim.setValue(minHeight);
  }, []);

  // States for map type
  const [mapType, setMapType] = useState('default');

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
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
          bottom: 120px;
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
        
        .map-type-control {
          position: absolute;
          right: 15px;
          top: 80px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          display: none; /* Hide by default */
        }
        
        .map-type-button {
          padding: 8px 12px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          display: flex;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .map-type-button:last-child {
          border-bottom: none;
        }
        
        .map-type-button:hover {
          background-color: #f4f4f4;
        }
        
        .map-type-button.active {
          background-color: #e9f5eb;
          color: #085924;
          font-weight: bold;
        }
        
        .map-type-icon {
          margin-right: 8px;
          width: 16px;
          height: 16px;
          background-size: contain;
          background-repeat: no-repeat;
        }
        
        .map-type-toggle {
          position: absolute;
          right: 15px;
          bottom: 180px;
          background-color: white;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          z-index: 1000;
        }
          
        .custom-tooltip {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 3px 8px;
          font-weight: 500;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .custom-tooltip:before {
          display: none;
        }

        .facility-marker {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .facility-marker.selected {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }

        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="zoom-controls">
        <div class="zoom-button" id="zoom-in">+</div>
        <div class="zoom-button" id="zoom-out">-</div>
      </div>
      
      <div class="map-type-toggle" id="map-type-toggle">
        <i class="fas fa-layer-group"></i>
      </div>
      
      <div class="map-type-control" id="map-type-control">
        <div class="map-type-button active" id="map-type-default">
          <i class="fas fa-map"></i> Mặc định
        </div>
        <div class="map-type-button" id="map-type-satellite">
          <i class="fas fa-satellite"></i> Vệ tinh
        </div>
        <div class="map-type-button" id="map-type-terrain">
          <i class="fas fa-mountain"></i> Địa hình
        </div>
      </div>
      
      <script>
        // Initialize map
        const map = L.map('map', {
          zoomControl: false // Disable default zoom controls
        }).setView([${initialCenter.latitude}, ${initialCenter.longitude}], ${initialCenter.zoom});
        
        // Define tile layers
        const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        });
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: ''
        });
        
        const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: ''
        });
        
        // Add default layer to map
        defaultLayer.addTo(map);
        
        // Variables to track current layer
        let currentLayer = defaultLayer;
        let currentLayerId = 'map-type-default';
        
        // Create custom icons based on zoom level
        const createIcon = (type, zoom, isSelected = false) => {
          let iconName;
          let iconColor;
          
          // Determine icon and color based on facility type
          switch(type) {
            case 'Nhà hàng':
              iconName = 'restaurant';
              iconColor = '#FF5252';
              break;
            case 'Khách sạn':
              iconName = 'hotel';
              iconColor = '#2979FF';
              break;
            case 'Cửa hàng':
              iconName = 'store';
              iconColor = '#00C853';
              break;
            default:
              iconName = 'business';
              iconColor = '#9C27B0';
          }
          
          // Determine size based on zoom level
let iconSize;
          if (zoom >= 25) {
            iconSize = 34;
          } else if (zoom >= 23) {
            iconSize = 26;
          } else if (zoom >= 21) {
            iconSize = 22;
          } else if (zoom >= 19) {
            iconSize = 18;
          } else {
            iconSize = 16;
          }

          if (isSelected) {
            // Google Maps style red marker with icon inside
            return L.divIcon({
              className: 'custom-marker selected',
              html:
                '<div style="width:' + (iconSize + 8) + 'px;height:' + (iconSize + 8) + 'px;display:flex;align-items:center;justify-content:center;position:relative;">' +
                  '<svg width="' + (iconSize + 8) + '" height="' + (iconSize + 8) + '" viewBox="0 0 40 40" style="position:absolute;top:0;left:0;">' +
                    '<path d="M20 2C11 2 4 9.16 4 18.08c0 7.13 7.13 15.13 14.13 19.13a2.5 2.5 0 0 0 3.74 0C28.87 33.21 36 25.21 36 18.08 36 9.16 29 2 20 2z" fill="#FF5252"/>' +
                    '<circle cx="20" cy="18" r="6" fill="#fff"/>' +
                  '</svg>' +
                  '<span class="material-icons" style="color:#FF5252; font-size:' + (iconSize-6) + 'px;z-index:1;position:relative;">' + iconName + '</span>' +
                '</div>',
              iconSize: [iconSize + 8, iconSize + 8],
              iconAnchor: [(iconSize + 8)/2, iconSize + 2], // anchor at the tip
              popupAnchor: [0, -iconSize]
            });
          }

          return L.divIcon({
            className: 'custom-marker',
            html: '<div class="facility-marker" style="width: ' + (iconSize + 8) + 'px; height: ' + (iconSize + 8) + 'px;">' +
                  '<span class="material-icons" style="color: ' + iconColor + '; font-size: ' + iconSize + 'px;">' + iconName + '</span>' +
                  '</div>',
            iconSize: [iconSize + 8, iconSize + 8],
            iconAnchor: [(iconSize + 8)/2, (iconSize + 8)/2],
            popupAnchor: [0, -((iconSize + 8)/2)]
          });
        };
        
        // Function to switch map type
        function switchMapType(layerId) {
          // Remove active class from all buttons
          document.querySelectorAll('.map-type-button').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Add active class to selected button
          document.getElementById(layerId).classList.add('active');
          
          // Remove current layer
          map.removeLayer(currentLayer);
          
          // Add selected layer
          switch(layerId) {
            case 'map-type-satellite':
              currentLayer = satelliteLayer;
              break;
            case 'map-type-terrain':
              currentLayer = terrainLayer;
              break;
            default:
              currentLayer = defaultLayer;
          }
          
          currentLayer.addTo(map);
          currentLayerId = layerId;
          
          // Re-add markers if available
          if (window.markersData && window.markersData.length > 0) {
            updateMarkers(window.markersData);
          }
        }
        
        // Add event listeners to map type buttons
        document.getElementById('map-type-default').addEventListener('click', () => {
          switchMapType('map-type-default');
        });
        
        document.getElementById('map-type-satellite').addEventListener('click', () => {
          switchMapType('map-type-satellite');
        });
        
        document.getElementById('map-type-terrain').addEventListener('click', () => {
          switchMapType('map-type-terrain');
        });
        
        // Toggle map type control visibility
        document.getElementById('map-type-toggle').addEventListener('click', () => {
          const mapTypeControl = document.getElementById('map-type-control');
          if (mapTypeControl.style.display === 'block') {
            mapTypeControl.style.display = 'none';
          } else {
            mapTypeControl.style.display = 'block';
          }
        });
        
        // Hide map type control when clicking elsewhere on the map
        map.addEventListener('click', () => {
          document.getElementById('map-type-control').style.display = 'none';
        });
        
        // Function to create marker with label
        const createMarkerWithLabel = (marker, zoom, isSelected = false) => {
          const markerIcon = createIcon(marker.type, zoom, isSelected);
          const markerInstance = L.marker([marker.latitude, marker.longitude], { icon: markerIcon });
          
          // Add label when zoom level is >= 15
          if (currentZoom >= 16) {
              let iconColor;
              switch(marker.type) {
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
              
            const tooltipOptions = { 
              permanent: true, 
              direction: 'right',
              className: 'custom-tooltip',
              offset: [3, 0]  // Reduced offset to bring text closer to icon
            };
            markerInstance.bindTooltip(
              '<span style="color: ' + iconColor + '; font-weight: 700; font-size: 13px;">' + marker.name + '</span>', 
              tooltipOptions
            );
          }
          
          // Add click event directly
          markerInstance.on('click', function() {
              // Update selected facility
              window.selectedFacilityId = marker.id;
              
              // Update all markers to reflect selection
              updateMarkers(window.markersData);
              
              // Send message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewFacility',
              facilityId: marker.id
            }));
          });
          
          return markerInstance;
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
          
          // Don't show markers below zoom level 15
          if (currentZoom < 15) return;
          
          markers.forEach(marker => {
            const isSelected = window.selectedFacilityId === marker.id;
            const leafletMarker = createMarkerWithLabel(marker, currentZoom, isSelected);
            leafletMarker.addTo(window.markersLayer);
          });
        }
        
        // Function to add markers (called from React Native)
        window.addMarkers = function(markersData) {
          try {
            const markers = JSON.parse(markersData);
            window.markersData = markers; // Save for zoom updates
            updateMarkers(markers);
          } catch (error) {
            console.error('Error adding markers:', error);
          }
        };
        
        // Function to change map type (called from React Native)
        window.changeMapType = function(mapType) {
          switchMapType('map-type-' + mapType);
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

        // Thêm hàm viewFacility ở đây
        window.viewFacility = function(facilityId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'viewFacility',
            facilityId: facilityId
          }));
        };
      </script>
    </body>
    </html>
  `;

  // Add cleanup to useEffect hooks
  useEffect(() => {
    // Load facilities from API
    let isCancelled = false;
    
    const loadData = async () => {
      try {
        const mockFacilities = [
          {
            id: 1,
            name: 'Nhà hàng ABC',
            type: 'Nhà hàng',
            iconName: 'restaurant',
            iconColor: '#FF5252',
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
            iconName: 'hotel',
            iconColor: '#2979FF',
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
            iconName: 'store',
            iconColor: '#00C853',
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
        
        if (!isCancelled && isMountedRef.current) {
          setFacilities(mockFacilities);
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Update markers when filters change
    if (!isMountedRef.current) return;
    
    if (mapLoaded && facilities.length > 0) {
      // Call updateMapMarkers immediately
      updateMapMarkers();
    }
  }, [filters, facilities, mapLoaded]);

  useEffect(() => {
    // Filter facilities based on search keyword
    if (!isMountedRef.current) return;
    
    if (searchKeyword.trim() === '') {
      setFilteredFacilities([]);
      return;
    }

    // Use a timeout to debounce the search
    const debounceTimeout = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const normalizedKeyword = removeVietnameseTones(searchKeyword.toLowerCase().trim());
      const filtered = facilities.filter(facility => {
        const normalizedName = removeVietnameseTones(facility.name.toLowerCase());
        return normalizedName.includes(normalizedKeyword);
      });
      
      if (isMountedRef.current) {
        setFilteredFacilities(filtered);
      }
    }, 300); // 300ms debounce
    
    // Clear timeout on cleanup
    return () => clearTimeout(debounceTimeout);
  }, [searchKeyword, facilities]);

  const loadFacilities = async () => {
    // This function will be called only inside a useEffect that already has cleanup
    try {
      // Mock data already loaded in the useEffect, so this is now just a placeholder
      // In a real app, you'd make the API call here
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error loading facilities:', error);
      }
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

  // Thêm function để xử lý sự kiện khi nhấn vào marker
  const handleViewFacilityDetails = (facility) => {
    if (!isMountedRef.current) return;
        
    // Đặt facility từ dữ liệu gốc để đảm bảo có đủ thông tin
    const fullFacility = facilities.find(f => f.id === facility.id) || facility;
    
    setSelectedFacility(fullFacility);
    setSelectedMarkerId(facility.id); // Set selected marker
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
        },
        {
          id: 4,
          reviewerName: 'Phạm Thị D',
          rating: 5,
          title: 'Đáng đồng tiền bát gạo!',
          content: 'Tôi rất hài lòng với trải nghiệm tại đây. Đồ ăn ngon, nhân viên thân thiện và không gian thoáng mát. Đặc biệt là các món đặc sản địa phương rất ngon và được trình bày đẹp mắt. Giá cả hợp lý cho chất lượng mà bạn nhận được. Chắc chắn sẽ quay lại!',
          date: '10/05/2023',
          likes: 20,
          replies: 5
        }
      ];
      setReviews(mockReviews);
    }
  };

  // Cập nhật hàm xử lý message từ WebView để hiển thị bottom sheet khi nhấn vào marker
  const handleWebViewMessage = (event) => {
    if (!isMountedRef.current) return;
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapLoaded':
          setMapLoaded(true);
          // Update markers immediately when map is loaded
          setTimeout(() => {
            if (isMountedRef.current && facilities.length > 0) {
              updateMapMarkers();
            }
          }, 300);
          break;
          
        case 'mapClick':
          setSelectedFacility({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          break;
          
        case 'reviewFacility':
          // Hiển thị thông báo yêu cầu đăng nhập
          Alert.alert(
            "Cần đăng nhập",
            "Bạn cần đăng nhập để đánh giá cơ sở này.",
            [
              { 
                text: "Đăng nhập", 
                onPress: () => {
                  if (isMountedRef.current) {
                    navigation.navigate('LoginScreen', { screen: 'Login' });
                  }
                }
              },
              {
                text: "Hủy",
                style: "cancel"
              }
            ]
          );
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
    if (!isMountedRef.current || !selectedFacility) return;
    
    setIsReviewModalVisible(false);
    
    // In a real app, make an API call to add the review
    console.log('Review added:', {
      facilityId: selectedFacility.id,
      ...newReview,
    });
    
    if (isMountedRef.current) {
      setNewReview({
        reviewerName: '',
        rating: 5,
        content: '',
      });
    }
  };

  const focusFacility = (facility) => {
    if (!isMountedRef.current) return;
    
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.focusOnFacility(${facility.latitude}, ${facility.longitude}, 18);
        true;
      `);
    }
    
    if (isMountedRef.current) {
      setSearchKeyword('');
      setFilteredFacilities([]);
    }
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

  const handleLogin = () => {
    if (!isMountedRef.current) return;
    navigation.navigate('LoginScreen', { screen: 'Login' });
  };
  
  // Thêm các hàm xử lý sự kiện cho bottom sheet
  const handleTouchStart = (e) => {
    setStartY(e.nativeEvent.pageY);
    setCurrentY(e.nativeEvent.pageY);
  };

  const handleTouchMove = (e) => {
    setCurrentY(e.nativeEvent.pageY);
    const deltaY = startY - currentY;
    let newHeight = bottomSheetHeight + deltaY;
    
    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;
    
    setBottomSheetHeight(newHeight);
    setStartY(currentY);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  // Thêm logs để debug
  useEffect(() => {
    if (selectedFacility) {
      // You can add any side effects when selected facility changes
    }
  }, [selectedFacility, bottomSheetVisible, activeTab]);

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
        {selectedFacility.latitude && (
          <>
            <Text style={styles.infoTitle}>Vị trí</Text>
            <View style={styles.infoRow}>
              <Ionicons name="locate-outline" size={20} color="#085924" style={styles.infoIcon} />
              <Text style={styles.infoText}>[{selectedFacility.latitude},{selectedFacility.longitude}]</Text>
            </View>
          </>
        )}
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
        <View style={styles.sectionDivider} />

        {/* Thêm phần Bài đánh giá */}
        <Text style={[styles.sectionTitle, {fontSize: 18, fontWeight: 'bold'}]}>Bài đánh giá</Text>
        {renderReviewsTab()}

        {/* Thêm phần Giới thiệu */}
        <View style={styles.sectionDivider} />
        <Text style={[styles.sectionTitle, {fontSize: 18, fontWeight: 'bold'}]}>Giới thiệu</Text>
        {renderAboutTab()}
        
        {/* <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Cần đăng nhập",
                "Bạn cần đăng nhập để đánh giá cơ sở này.",
                [
                  { 
                    text: "Đăng nhập", 
                    onPress: () => {
                      if (isMountedRef.current) {
                        navigation.navigate('LoginScreen', { screen: 'Login' });
                      }
                    }
                  },
                  {
                    text: "Hủy",
                    style: "cancel"
                  }
                ]
              );
            }}
          >
            <Ionicons name="star-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đánh giá</Text>
          </TouchableOpacity>
        </View> */}
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
            <Text style={styles.ratingCountText}>(28)</Text>
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
          <Text style={styles.reviewsHeaderText}>Đánh giá</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Cần đăng nhập",
                "Bạn cần đăng nhập để đánh giá cơ sở này.",
                [
                  { 
                    text: "Đăng nhập", 
                    onPress: () => {
                      if (isMountedRef.current) {
                        navigation.navigate('LoginScreen', { screen: 'Login' });
                      }
                    }
                  },
                  {
                    text: "Hủy",
                    style: "cancel"
                  }
                ]
              );
            }}
          >
            <Text style={styles.writeReviewLink}>
              <Ionicons name="create-outline" size={18} color="#085924"/>
              {'  '}Viết đánh giá
            </Text>
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
                        <View style={styles.reviewMetaContainer}>
                          <View style={styles.ratingRow}>
                            {renderStars(item.rating)}
                          </View>
                          <Text style={styles.reviewDate}>{item.date}</Text>
                        </View>
                      </View>
                  </View>
                  <View style={styles.reviewHeaderRight}>
                      <View style={[
                        styles.statusBadge,
                        item.status === 'approved' ? styles.statusApproved : styles.statusPending
                      ]}>
                        <Text style={styles.statusText}>
                          {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                        </Text>
                      </View>
                    </View>
                </View>
                
                <Text style={styles.reviewTitle}>{item.title}</Text>
                <Text style={styles.reviewContent}>{item.content}</Text>
                
                <View style={styles.reviewActions}>
                  <TouchableOpacity style={styles.reviewAction} onPress={() => handleLogin()}>
                    <Ionicons name="thumbs-up-outline" size={18} color="#666" />
                    <Text style={styles.reviewActionText}>{item.likes}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.reviewAction} onPress={() => handleLogin()}>
                    <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    <Text style={styles.reviewActionText}>{item.replies}</Text>
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
              onPress={() => {
                setIsReviewListVisible(false);
                setIsReviewModalVisible(true);
              }}>
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
          {selectedFacility.description}
        </Text>
      </ScrollView>
    );
  };
  
  const changeMapType = (type) => {
    if (!webViewRef.current) return;
    
    setMapType(type);
    webViewRef.current.injectJavaScript(`
      window.changeMapType('${type}');
      true;
    `);
  };

  // When closing bottom sheet, reset selected marker
  useEffect(() => {
    if (!bottomSheetVisible) {
      setSelectedMarkerId(null);
      // Remove selection on map
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript('window.selectedFacilityId = null; if(window.markersData) updateMarkers(window.markersData); true;');
      }
    }
  }, [bottomSheetVisible]);

  // Pass selectedMarkerId to WebView when it changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.selectedFacilityId = ' + (selectedMarkerId ? selectedMarkerId : 'null') + '; if(window.markersData) updateMarkers(window.markersData); true;');
    }
  }, [selectedMarkerId]);
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
      
      {/* Map Type Floating Button */}
      <TouchableOpacity
        style={styles.mapTypeButton}
        onPress={() => setIsMapTypeModalVisible(true)}
      >
        <Ionicons name="layers-outline" size={24} color="#333" />
      </TouchableOpacity>
      
      {/* Map Type Modal */}
      <Modal
        visible={isMapTypeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMapTypeModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.mapTypeModalOverlay}
          activeOpacity={1}
          onPress={() => setIsMapTypeModalVisible(false)}
        >
          <View style={styles.mapTypeModalContainer}>
            <TouchableOpacity
              style={[
                styles.mapTypeOption,
                mapType === 'default' && styles.mapTypeOptionActive
              ]}
              onPress={() => {
                changeMapType('default');
                setIsMapTypeModalVisible(false);
              }}
            >
              <Ionicons 
                name="map-outline" 
                size={24} 
                color={mapType === 'default' ? "#085924" : "#333"} 
                style={styles.mapTypeOptionIcon}
              />
              <Text style={[
                styles.mapTypeOptionText,
                mapType === 'default' && styles.mapTypeOptionTextActive
              ]}>Mặc định</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.mapTypeOption,
                mapType === 'satellite' && styles.mapTypeOptionActive
              ]}
              onPress={() => {
                changeMapType('satellite');
                setIsMapTypeModalVisible(false);
              }}
            >
              <Ionicons 
                name="globe-outline" 
                size={24} 
                color={mapType === 'satellite' ? "#085924" : "#333"} 
                style={styles.mapTypeOptionIcon}
              />
              <Text style={[
                styles.mapTypeOptionText,
                mapType === 'satellite' && styles.mapTypeOptionTextActive
              ]}>Vệ tinh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.mapTypeOption,
                mapType === 'terrain' && styles.mapTypeOptionActive
              ]}
              onPress={() => {
                changeMapType('terrain');
                setIsMapTypeModalVisible(false);
              }}
            >
              <Ionicons 
                name="trail-sign-outline" 
                size={24} 
                color={mapType === 'terrain' ? "#085924" : "#333"} 
                style={styles.mapTypeOptionIcon}
              />
              <Text style={[
                styles.mapTypeOptionText,
                mapType === 'terrain' && styles.mapTypeOptionTextActive
              ]}>Địa hình</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#085924" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
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
      
      {/* Login Notice Banner */}
      <View style={styles.loginBanner}>
        <Text style={styles.loginText}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
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
                      <Text style={styles.reviewTitle}>{item.title}</Text>
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
              {/* <Text style={styles.dragIndicatorText}>
                {isBottomSheetExpanded ? "Kéo xuống để thu gọn" : "Kéo lên để xem thêm"}
              </Text> */}
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
              onPress={handleCloseBottomSheet}
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
    </SafeAreaView>
  );
}
