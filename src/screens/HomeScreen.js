import React, {useState, useEffect, useRef, useContext, useMemo} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
  Image,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import styles from './HomeScreenStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MultiSelectDropdown, REPORT_TYPE_OPTIONS } from '../components/MultiSelectDropdown';
import BusinessBranchService from '../services/BusinessBranchService';

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
  const { isAuthenticated } = useContext(AuthContext);
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initial map center point
  const initialCenter = {
    latitude: 20.44879,
    longitude: 106.34259,
    zoom: 15
  };
  
  // States for facilities
  const [allFacilities, setAllFacilities] = useState([]); // Store all facilities from API
  const [facilities, setFacilities] = useState([]); // Store filtered facilities
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for modals
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isReviewListVisible, setIsReviewListVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
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
    title: '',
    rating: 5,
    content: '',
    media: [],
  });

  // State for reports
  const [reportData, setReportData] = useState({
    reporterName: '',
    phone: '',
    reportTypes: [], // Array để lưu nhiều loại phản ánh
    content: '',
    media: [],
  });

  // Thêm state cho bottom sheet với 2 nấc
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const bottomSheetRef = useRef(null);
  const minHeight = 200;
  const maxHeight = Dimensions.get('window').height * 0.9;
  const bottomSheetAnim = useRef(new Animated.Value(minHeight)).current;
  const isMountedRef = useRef(true);
  
  // Add new states for menu and edit modal
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditReviewModalVisible, setIsEditReviewModalVisible] = useState(false);
  
  // Add new state for review tab
  const [reviewTab, setReviewTab] = useState('all'); // 'all' or 'my'
  
  // Use individual loading states instead of a single global loading state
  const [loadingState, setLoadingState] = useState({
    restaurant: false,
    hotel: false, 
    shop: false,
    global: false
  });
  
  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch all facilities once when component mounts
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching all facilities data...');
        
        const response = await BusinessBranchService.getAll({
          maxResultCount: 1000, // Get a large number of results
          isGetTotalCount: true
        }, controller.signal);
        
        if (!isMounted) return;
        
        if (response && Array.isArray(response.items)) {
          console.log(`Received ${response.items.length} total facilities from API`);
          
          // Map API response to our facility format
          const mappedFacilities = response.items.map(item => ({
            id: item.id,
            name: item.name || 'Không có tên',
            type: mapBusinessTypeToDisplayType(item.type),
            rawType: item.type, // Store the original type
            iconName: mapBusinessTypeToIconName(item.type),
            iconColor: mapBusinessTypeToColor(item.type),
            address: item.address || 'Không có địa chỉ',
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            phone: item.phone || '',
            email: item.email || '',
            facebook: item.facebook || '',
            website: item.website || '',
            openHours: item.openHours || '',
            description: item.description || '',
          }));
          
          // Store all facilities
          setAllFacilities(mappedFacilities);
          
          // Apply initial filters
          applyFilters(mappedFacilities, filters);
        } else {
          console.warn('API returned unexpected format, using fallback data');
          useFallbackData();
        }
      } catch (error) {
        console.error('Error loading all facilities:', error);
        useFallbackData();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAllData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Function to apply filters to the data
  const applyFilters = (data, currentFilters) => {
    // Apply type filters
    const filteredData = data.filter(facility => {
      // Check if the facility type matches any of the active filters
      if (facility.rawType === 'restaurant' && currentFilters.restaurant) return true;
      if (facility.rawType === 'hotel' && currentFilters.hotel) return true;
      if (facility.rawType === 'shop' && currentFilters.shop) return true;
      return false;
    });
    
    setFacilities(filteredData);
    console.log(`Applied filters, showing ${filteredData.length} facilities`);
  };

  // Update displayed facilities when filters change
  useEffect(() => {
    if (allFacilities.length > 0) {
      applyFilters(allFacilities, filters);
    }
  }, [filters, allFacilities]);

  // Filter facilities based on search keyword
  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredFacilities([]);
      return;
    }

    const normalizedKeyword = removeVietnameseTones(searchKeyword.toLowerCase().trim());
    const filtered = allFacilities.filter(facility => {
      const normalizedName = removeVietnameseTones(facility.name.toLowerCase());
      return normalizedName.includes(normalizedKeyword);
    });
    
    setFilteredFacilities(filtered);
  }, [searchKeyword, allFacilities]);

  // Map markers are updated when filtered facilities change
  useEffect(() => {
    if (mapLoaded && facilities.length > 0) {
      updateMapMarkers();
    }
  }, [facilities, mapLoaded]);

  // Use a simplified fallback for demo data
  const useFallbackData = () => {
    const mockFacilities = [
      {
        id: 1,
        name: 'Nhà hàng ABC',
        type: 'Nhà hàng',
        rawType: 'restaurant',
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
        description: 'Nhà hàng ABC là một trong những nhà hàng nổi tiếng tại Thái Bình với các món ăn đặc sản địa phương.',
      },
      {
        id: 2,
        name: 'Khách sạn XYZ',
        type: 'Khách sạn',
        rawType: 'hotel',
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
        description: 'Khách sạn XYZ là khách sạn 4 sao với 100 phòng nghỉ tiện nghi.',
      },
      {
        id: 3,
        name: 'Cửa hàng 123',
        type: 'Cửa hàng',
        rawType: 'shop',
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
        description: 'Cửa hàng 123 chuyên kinh doanh các sản phẩm địa phương chất lượng cao.',
      },
    ];
      
    setAllFacilities(mockFacilities);
    applyFilters(mockFacilities, filters);
  };

  const updateMapMarkers = () => {
    if (!webViewRef.current) return;
    
    // Pass filtered facilities to WebView
    webViewRef.current.injectJavaScript(`
      window.addMarkers('${JSON.stringify(facilities)}');
      true;
    `);
  };

  // Simplified filter change handler without API calls
  const handleFilterChange = (filterType, value) => {
    console.log(`Filter ${filterType} clicked, setting to ${value}`);
    
    // Update the filter
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    
    // Filters will be applied in the useEffect
  };
  
  // Filter facilities based on search keyword
  useEffect(() => {
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
          bottom: 140px;
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
            const leafletMarker = L.marker(
              [marker.latitude, marker.longitude],
              { icon: createIcon(marker.type, currentZoom, isSelected) }
            ).addTo(window.markersLayer);
            
            // Add tooltips for showing business names when zoom level is >= 20
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
              leafletMarker.bindTooltip(
                '<span style="color: ' + iconColor + '; font-weight: 700; font-size: 13px;">' + marker.name + '</span>', 
                tooltipOptions
              );
            }
            
            // Add click event directly
            leafletMarker.on('click', function() {
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
          });
        }
        
        // Function to add markers (called from React Native)
        window.addMarkers = function(markersData) {
          const markers = JSON.parse(markersData);
          window.markersData = markers; // Save for zoom updates
          updateMarkers(markers);
        };
        
        // Function to change map type (called from React Native)
        window.changeMapType = function(mapType) {
          switchMapType('map-type-' + mapType);
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
    if (!isAuthenticated) {
      Alert.alert(
        'Cần đăng nhập',
        'Bạn cần đăng nhập để sử dụng chức năng này.',
        [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('LoginScreen') },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }
    if (!selectedFacility) return;
    
    setIsReviewModalVisible(false);
    
    // In a real app, make an API call to add the review
    console.log('Review added:', {
      facilityId: selectedFacility.id,
      ...newReview,
    });
    
    setNewReview({
      title: '',
      rating: 5,
      content: '',
      media: [],
    });
  };

  const handleViewFacilityDetails = (facility) => {
    if (!isMountedRef.current) return;
    
    setSelectedFacility(facility);
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
          replies: 3,
          status: 'pending', // 'approved' or 'pending'
          media: [
            {
              type: 'image',
              url: 'https://example.com/image1.jpg'
            },
            {
              type: 'video',
              url: 'https://example.com/video1.mp4',
              thumbnail: 'https://example.com/thumbnail1.jpg'
            }
          ]
        },
        {
          id: 2,
          reviewerName: 'Trần Thị B',
          rating: 4,
          title: 'Tốt nhưng vẫn có thể cải thiện',
          content: 'Dịch vụ tốt, giá cả phải chăng. Tuy nhiên, thời gian chờ đợi hơi lâu vào giờ cao điểm. Nhân viên thân thiện nhưng đôi khi phục vụ chậm. Không gian thoáng đãng, sạch sẽ. Sẽ quay lại nếu có cơ hội.',
          date: '20/07/2023',
          likes: 5,
          replies: 1,
          status: 'pending',
          media: [
            {
              type: 'image',
              url: 'https://example.com/image2.jpg'
            }
          ]
        },
        {
          id: 3,
          reviewerName: 'Lê Văn C',
          rating: 3,
          title: 'Trải nghiệm trung bình',
          content: 'Chất lượng dịch vụ ở mức trung bình. Cần cải thiện thêm về thái độ phục vụ của một số nhân viên. Đồ ăn ngon nhưng phần hơi nhỏ so với giá tiền. Vị trí thuận tiện, dễ tìm.',
          date: '05/06/2023',
          likes: 2,
          replies: 0,
          status: 'approved',
          media: []
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

  const shouldShowFacility = (facility) => {
    const facilityType = facility.type.toLowerCase();
    
    if (facilityType.includes('nhà hàng') || facilityType === 'restaurant') {
      return filters.restaurant;
    }
    
    if (facilityType.includes('khách sạn') || facilityType === 'hotel') {
      return filters.hotel;
    }
    
    if (facilityType.includes('cửa hàng') || facilityType === 'shop') {
      return filters.shop;
    }
    
    return false;
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
    if (!isAuthenticated) {
      Alert.alert(
        'Cần đăng nhập',
        'Bạn cần đăng nhập để sử dụng chức năng này.',
        [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('LoginScreen') },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }
    if (!selectedFacility) return;
    
    if (!reportData.phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại');
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
      reportTypes: [], // Array để lưu nhiều loại phản ánh
      content: '',
      media: [],
    });
  };

  // Thêm component cho tab content
  const renderOverviewTab = () => {
    if (!selectedFacility) {
      return <View style={styles.emptyContent}><Text>Không có dữ liệu</Text></View>;
    }
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 10}}>
        <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Địa chỉ</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#085924" style={styles.infoIcon} />
          <Text style={styles.infoText}>{selectedFacility.address || 'Chưa có thông tin'}</Text>
        </View>
        {selectedFacility.latitude && (
          <>
            <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Vị trí</Text>
            <View style={styles.infoRow}>
              <Ionicons name="locate-outline" size={20} color="#085924" style={styles.infoIcon} />
              <Text style={styles.infoText}>[{selectedFacility.latitude},{selectedFacility.longitude}]</Text>
            </View>
          </>
        )}

        <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Loại hình</Text>
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
            <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Liên hệ</Text>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#085924" style={styles.infoIcon} />
              <Text style={styles.infoText}>{selectedFacility.phone}</Text>
            </View>
          </>
        )}
        
        <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Liên kết</Text>
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
        
        {isAuthenticated && <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: '#e74c3c'}]}
            onPress={() => setIsReportModalVisible(true)}
          >
            <Ionicons name="warning-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Phản ánh lên cơ quan chức năng</Text>
          </TouchableOpacity>
        </View>
        }
        <View style={styles.sectionDivider} />

        {/* Thêm phần Bài đánh giá */}
        <Text style={[styles.sectionTitle, {fontSize: 18, fontWeight: 'bold'}]}>Bài đánh giá</Text>
        {renderReviewsTab()}

        {/* Thêm phần Giới thiệu */}
        <View style={styles.sectionDivider} />
        <Text style={[styles.sectionTitle, {fontSize: 18, fontWeight: 'bold'}]}>Giới thiệu</Text>
        {renderAboutTab()}
      </ScrollView>
    );
  };

  // Add function to handle menu press
  const handleMenuPress = (event, review) => {
    event.stopPropagation();
    setSelectedReview(review);
    
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({
          x: pageX - 115,
          y: pageY + height - 30
        });
        setMenuVisible(true);
      });
    }
  };

  // Add function to handle edit review
  const handleEditReview = (review) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Cần đăng nhập',
        'Bạn cần đăng nhập để sử dụng chức năng này.',
        [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('LoginScreen') },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }
    setMenuVisible(false);
    setNewReview({
      title: review.title,
      rating: review.rating,
      content: review.content,
      media: review.media,
    });
    setIsEditReviewModalVisible(true);
  };

  // Add function to handle delete review
  const handleDeleteReview = (review) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Cần đăng nhập',
        'Bạn cần đăng nhập để sử dụng chức năng này.',
        [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('LoginScreen') },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }
    setMenuVisible(false);
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài đánh giá này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            // Handle delete
            console.log('Delete review:', review.id);
          }
        }
      ]
    );
  };

  // Add function to check if user has reviews
  const hasUserReviews = () => {
    return reviews.some(review => review.reviewerName === 'Nguyễn Văn A');
  };

  const renderReviewsTab = () => {
    const isUserReview = (reviewerName) => {
      return reviewerName === 'Nguyễn Văn A';
    };

    // Separate user reviews and other reviews
    const userReviews = reviews.filter(review => isUserReview(review.reviewerName));
    const otherReviews = reviews.filter(review => !isUserReview(review.reviewerName));

    return (
      <ScrollView 
        style={styles.tabContent} 
        contentContainerStyle={{paddingBottom: 30}}
        nestedScrollEnabled={true}
      >
        {/* Rating Overview */}
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

        {/* User's Reviews Section */}
        {userReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderContainer}>
              <Text style={styles.reviewsHeaderText}>Đánh giá của tôi</Text>
            </View>
            
            {userReviews.map(item => (
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
                    
                    <TouchableOpacity 
                      ref={menuButtonRef}
                      style={styles.menuButton}
                      onPress={(event) => handleMenuPress(event, item)}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                <Text style={styles.reviewContent}>{item.content}</Text>
                
                {/* Media Gallery */}
                {item.media && item.media.length > 0 && (
                  <View style={styles.mediaGallery}>
                    {item.media.map((media, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.mediaItem}
                        onPress={() => {
                          if (media.type === 'video') {
                            console.log('Open video:', media.url);
                          } else {
                            console.log('Open image:', media.url);
                          }
                        }}
                      >
                        {media.type === 'video' ? (
                          <View style={styles.videoThumbnail}>
                            <Image 
                              source={{ uri: media.thumbnail }} 
                              style={styles.mediaThumbnail}
                            />
                            <View style={styles.playButton}>
                              <Ionicons name="play" size={24} color="#fff" />
                            </View>
                          </View>
                        ) : (
                          <Image 
                            source={{ uri: media.url }} 
                            style={styles.mediaThumbnail}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* All Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderContainer}>
            <Text style={styles.reviewsHeaderText}>Tất cả đánh giá</Text>
            {isAuthenticated && userReviews.length === 0 && <TouchableOpacity
              onPress={() => setIsReviewModalVisible(true)}
            >
              <Text style={styles.writeReviewLink}>
                <Ionicons name="create-outline" size={18} color="#085924"/>
                {'  '}Viết đánh giá
              </Text>
            </TouchableOpacity>}
          </View>
          
          {otherReviews.length > 0 ? (
            <View>
              {otherReviews.map(item => (
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
                  
                  {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                  <Text style={styles.reviewContent}>{item.content}</Text>
                  
                  {/* Media Gallery */}
                  {item.media && item.media.length > 0 && (
                    <View style={styles.mediaGallery}>
                      {item.media.map((media, index) => (
                        <TouchableOpacity 
                          key={index}
                          style={styles.mediaItem}
                          onPress={() => {
                            if (media.type === 'video') {
                              console.log('Open video:', media.url);
                            } else {
                              console.log('Open image:', media.url);
                            }
                          }}
                        >
                          {media.type === 'video' ? (
                            <View style={styles.videoThumbnail}>
                              <Image 
                                source={{ uri: media.thumbnail }} 
                                style={styles.mediaThumbnail}
                              />
                              <View style={styles.playButton}>
                                <Ionicons name="play" size={24} color="#fff" />
                              </View>
                            </View>
                          ) : (
                            <Image 
                              source={{ uri: media.url }} 
                              style={styles.mediaThumbnail}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
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
        </View>
      </ScrollView>
    );
  };

  const renderAboutTab = () => {
    if (!selectedFacility) return null;
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 10}}>
        <Text style={styles.aboutTitle}>Thông tin chi tiết</Text>
        <Text style={styles.aboutDescription}>
          {selectedFacility.description || "Chưa có thông tin chi tiết về cơ sở này."}
        </Text>
      </ScrollView>
    );
  };

  const [mapType, setMapType] = useState('default'); // Add state for map type

  const changeMapType = (type) => {
    if (!webViewRef.current) return;
    
    setMapType(type);
    webViewRef.current.injectJavaScript(`
      window.changeMapType('${type}');
      true;
    `);
  };

  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const menuButtonRef = useRef(null);

  // Thêm hàm xử lý chọn loại phản ánh
  const handleReportTypeSelect = (type) => {
    const currentTypes = [...reportData.reportTypes];
    const index = currentTypes.indexOf(type);
    
    if (index === -1) {
      currentTypes.push(type);
    } else {
      currentTypes.splice(index, 1);
    }
    
    setReportData({
      ...reportData,
      reportTypes: currentTypes
    });
  };

  // Thêm hàm xử lý thêm media
  const handleAddMedia = (type, media) => {
    if (type === 'review') {
      setNewReview({
        ...newReview,
        media: [...newReview.media, media]
      });
    } else {
      setReportData({
        ...reportData,
        media: [...reportData.media, media]
      });
    }
  };

  // Thêm hàm xử lý xóa media
  const handleRemoveMedia = (type, index) => {
    if (type === 'review') {
      const newMedia = [...newReview.media];
      newMedia.splice(index, 1);
      setNewReview({
        ...newReview,
        media: newMedia
      });
    } else {
      const newMedia = [...reportData.media];
      newMedia.splice(index, 1);
      setReportData({
        ...reportData,
        media: newMedia
      });
    }
  };

  // Cập nhật modal đánh giá
  const renderReviewModal = () => (
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
              <Text style={styles.label}>Tiêu đề: <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={newReview.title}
                onChangeText={(text) => setNewReview({...newReview, title: text})}
                placeholder="Nhập tiêu đề đánh giá"
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
              <Text style={styles.label}>Nội dung đánh giá: <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newReview.content}
                onChangeText={(text) => setNewReview({...newReview, content: text})}
                placeholder="Nhập nội dung đánh giá..."
                multiline={true}
                numberOfLines={5}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hình ảnh/Video:</Text>
              <View style={styles.mediaUploadContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScrollView}
                >
                  {newReview.media.map((media, index) => (
                    <View key={index} style={styles.mediaPreviewContainer}>
                      <Image 
                        source={{uri: media.type === 'video' ? media.thumbnail : media.url}} 
                        style={styles.mediaPreview}
                      />
                      <TouchableOpacity 
                        style={styles.removeMediaButton}
                        onPress={() => handleRemoveMedia('review', index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addMediaButton}
                    onPress={() => handleMediaPicker('review')}
                  >
                    <Ionicons name="add-circle-outline" size={40} color="#085924" />
                    <Text style={styles.addMediaText}>Thêm</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
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
  );

  // Cập nhật modal phản ánh
  const renderReportModal = () => (
    <Modal
      visible={isReportModalVisible}
      transparent={true}
      animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Phản ánh lên cơ quan chức năng</Text>
            <TouchableOpacity onPress={() => setIsReportModalVisible(false)}>
              <Ionicons name="close" size={24} color="#085924" />
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
              <Text style={styles.label}>Số điện thoại: <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={reportData.phone}
                onChangeText={(text) => setReportData({...reportData, phone: text})}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loại phản ánh: <Text style={{color: 'red'}}>*</Text></Text>
              <MultiSelectDropdown
                selectedValues={reportData.reportTypes}
                onChange={types => setReportData({ ...reportData, reportTypes: types })}
              />
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hình ảnh/Video:</Text>
              <View style={styles.mediaUploadContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScrollView}
                >
                  {reportData.media.map((media, index) => (
                    <View key={index} style={styles.mediaPreviewContainer}>
                      <Image 
                        source={{uri: media.type === 'video' ? media.thumbnail : media.url}} 
                        style={styles.mediaPreview}
                      />
                      <TouchableOpacity 
                        style={styles.removeMediaButton}
                        onPress={() => handleRemoveMedia('report', index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addMediaButton}
                    onPress={() => handleMediaPicker('report')}
                  >
                    <Ionicons name="add-circle-outline" size={40} color="#085924" />
                    <Text style={styles.addMediaText}>Thêm</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
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
  );

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

  // Chỉ xin quyền khi người dùng nhấn Thêm media
  const requestMediaPermission = async () => {
    if (Platform.OS === 'android') {
      let result;
      if (Platform.Version >= 33) {
        result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        if (
          Object.values(result).includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
        ) {
          return 'never_ask_again';
        }
        return Object.values(result).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        )
          ? 'granted'
          : 'denied';
      } else {
        result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return 'never_ask_again';
        }
        return result === PermissionsAndroid.RESULTS.GRANTED
          ? 'granted'
          : 'denied';
      }
    }
    return 'granted'; // iOS tự động xin quyền khi cần
  };

  const handleMediaPicker = async (type) => {
    try {
      let permission = 'granted';
      if (Platform.OS === 'android') {
        permission = await requestMediaPermission();
        if (permission === 'never_ask_again') {
          Alert.alert(
            'Cần quyền truy cập',
            'Bạn đã từ chối quyền và chọn không hỏi lại. Vui lòng vào Cài đặt để cấp lại quyền.',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        } else if (permission === 'denied') {
          // Không hiện Alert nữa, chỉ để hệ thống xử lý dialog xin quyền
          return;
        }
      }

      const options = {
        mediaType: 'mixed',
        selectionLimit: 5,
        quality: 1,
        includeBase64: false,
        saveToPhotos: false,
        presentationStyle: 'pageSheet',
      };

      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('User cancelled media picker');
        return;
      }

      if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Lỗi', 'Không thể truy cập thư viện ảnh. Vui lòng thử lại sau.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map(asset => ({
          type: asset.type?.startsWith('video/') ? 'video' : 'image',
          url: asset.uri,
          thumbnail: asset.type?.startsWith('video/') ? asset.uri : asset.uri,
        }));

        handleAddMedia(type, ...newMedia);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn media. Vui lòng thử lại sau.');
    }
  };

  // Xin quyền media duy nhất 1 lần khi mở app lần đầu sau khi cài đặt
  useEffect(() => {
    const checkAndRequestFirstTime = async () => {
      try {
        const requested = await AsyncStorage.getItem('media_permission_requested');
        if (!requested) {
          await requestMediaPermission();
          await AsyncStorage.setItem('media_permission_requested', 'true');
        }
      } catch (e) {
        console.warn('Error checking/storing media permission flag:', e);
      }
    };
    checkAndRequestFirstTime();
  }, []);

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
      
      {/* Menu Tooltip */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={{flex: 1}}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[
            styles.menuTooltip,
            {
              position: 'absolute',
              left: menuPosition.x,
              top: menuPosition.y,
              backgroundColor: '#fff',
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          ]}>
            {selectedReview && selectedReview.status === 'pending' && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleEditReview(selectedReview)}
              >
                <Ionicons name="create-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Sửa</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleDeleteReview(selectedReview)}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              <Text style={[styles.menuItemText, { color: '#e74c3c' }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
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
              filters.restaurant && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('restaurant', !filters.restaurant)}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={filters.restaurant ? "#fff" : "#666"} style={styles.filterButtonIcon} />
            ) : (
              <Ionicons 
                name="restaurant" 
                size={18} 
                color={filters.restaurant ? "#fff" : "#666"} 
                style={styles.filterButtonIcon}
              />
            )}
            <Text style={[
              styles.filterButtonText,
              filters.restaurant && styles.filterButtonTextActive,
            ]}>Nhà hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.hotel && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('hotel', !filters.hotel)}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={filters.hotel ? "#fff" : "#666"} style={styles.filterButtonIcon} />
            ) : (
              <Ionicons 
                name="bed" 
                size={18} 
                color={filters.hotel ? "#fff" : "#666"}
                style={styles.filterButtonIcon}
              />
            )}
            <Text style={[
              styles.filterButtonText,
              filters.hotel && styles.filterButtonTextActive,
            ]}>Khách sạn</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.shop && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('shop', !filters.shop)}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={filters.shop ? "#fff" : "#666"} style={styles.filterButtonIcon} />
            ) : (
              <Ionicons 
                name="cart" 
                size={18} 
                color={filters.shop ? "#fff" : "#666"}
                style={styles.filterButtonIcon}
              />
            )}
            <Text style={[
              styles.filterButtonText,
              filters.shop && styles.filterButtonTextActive,
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
      {isAuthenticated ? null : <View style={styles.loginBanner}>
        <Text style={styles.loginText}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
      }

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
      
      {renderReviewModal()}
      {renderReportModal()}
      
      
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
                            <View style={styles.reviewerNameContainer}>
                              <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                              <View style={[
                                styles.statusBadge,
                                item.status === 'approved' ? styles.statusApproved : styles.statusPending
                              ]}>
                                <Text style={styles.statusText}>
                                  {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.reviewMetaContainer}>
                              <Text style={styles.reviewDate}>{item.date}</Text>
                              <View style={styles.ratingRow}>
                                {renderStars(item.rating)}
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                      
                      {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                      <Text style={styles.reviewContent}>{item.content}</Text>
                      
                      {/* Media Gallery */}
                      {item.media && item.media.length > 0 && (
                        <View style={styles.mediaGallery}>
                          {item.media.map((media, index) => (
                            <TouchableOpacity 
                              key={index}
                              style={styles.mediaItem}
                              onPress={() => {
                                // Handle media preview
                                if (media.type === 'video') {
                                  // Open video player
                                  console.log('Open video:', media.url);
                                } else {
                                  // Open image viewer
                                  console.log('Open image:', media.url);
                                }
                              }}
                            >
                              {media.type === 'video' ? (
                                <View style={styles.videoThumbnail}>
                                  <Image 
                                    source={{ uri: media.thumbnail }} 
                                    style={styles.mediaThumbnail}
                                  />
                                  <View style={styles.playButton}>
                                    <Ionicons name="play" size={24} color="#fff" />
                                  </View>
                                </View>
                              ) : (
                                <Image 
                                  source={{ uri: media.url }} 
                                  style={styles.mediaThumbnail}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      
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
                      
                      {item.id !== reviews[reviews.length - 1].id && (
                        <View style={styles.reviewSeparator} />
                      )}
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
      
      {/* Menu Modal */}
      <Modal
        visible={isMenuModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuModalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuModalVisible(false)}
        >
          <View style={styles.menuModalContent}>
            {selectedReview && selectedReview.status === 'pending' && (
              <TouchableOpacity 
                style={styles.menuModalItem}
                onPress={() => handleEditReview(selectedReview)}
              >
                <Ionicons name="create-outline" size={20} color="#333" />
                <Text style={styles.menuModalItemText}>Sửa</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.menuModalItem}
              onPress={() => handleDeleteReview(selectedReview)}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              <Text style={[styles.menuModalItemText, { color: '#e74c3c' }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Edit Review Modal */}
      <Modal
        visible={isEditReviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditReviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setIsEditReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
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
                onPress={() => {
                  // Handle save edited review
                  console.log('Save edited review:', newReview);
                  setIsEditReviewModalVisible(false);
                }}>
                <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}