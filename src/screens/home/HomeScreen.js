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
import { AuthContext } from '../../context/AuthContext';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MultiSelectDropdown, REPORT_TYPE_OPTIONS } from '../../components/MultiSelectDropdown';
import BusinessBranchService from '../../services/BusinessBranchService';
import BusinessTypeCatalogService from '../../services/BusinessTypeCatalogService';
// Demo API URL - replace with your actual API URL
// import {API_URL} from '../config/api';

// Mock facility types and their icons
// const FACILITY_TYPES = {
//   'Nhà hàng': require('../assets/images/restaurant_icon.png'),
//   'Khách sạn': require('../assets/images/hotel_icon.png'),
//   'Cửa hàng': require('../assets/images/shop_icon.png'),
// };

// Add helper functions for business type mapping

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
  const [filters, setFilters] = useState({});
  
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
  
  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Add state for business types
  const [businessTypes, setBusinessTypes] = useState([]);
  
  // Fetch all facilities once when component mounts
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchBusinessTypes = async () => {
      try {
        if (!isMounted) return;
        
        const response = await BusinessTypeCatalogService.getList(controller.signal);
        
        if (!isMounted) return;
        
        let typesArray = [];
        if (response && response.result && Array.isArray(response.result)) {
          typesArray = response.result;
        } else if (response && Array.isArray(response)) {
          // In case the API returns an array directly
          typesArray = response;
        } else {
          console.warn('Business types API returned unexpected format');
        }
        
        // Update business types
        setBusinessTypes(typesArray);        
        // Initialize filters with all business types active
        const initialFilters = {};
        if (typesArray.length > 0) {
          typesArray.forEach(type => {
            // Store as number ids to ensure consistent type checking
            initialFilters[type.id] = true;
          });
        } else {
          // Fallback to default filters if no business types are returned
          initialFilters[1] = true; // Default ID for restaurant
          initialFilters[2] = true; // Default ID for hotel
          initialFilters[3] = true; // Default ID for shop
        }
        setFilters(initialFilters);
        
      } catch (error) {
        console.error('Error fetching business types:', error);
        // Fallback to default filters if error
        setFilters({
          1: true, // Default ID for restaurant
          2: true, // Default ID for hotel
          3: true, // Default ID for shop
        });
      }
    };
    
    const fetchAllData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        
        // First fetch business types
        await fetchBusinessTypes();
        
        const response = await BusinessBranchService.getAll({}, controller.signal);
        
        if (!isMounted) return;
        
        if (response && Array.isArray(response)) {
          // Map API response to our facility format based on actual API structure
          const mappedFacilities = response.map(item => {
            // Find matching business type
            // Determine business type for icon and display
            return {
              id: item.id,
              name: item.branchName || 'Không có tên',
              type: item.businessTypeName || 'Không xác định',
              rawType: item.businessTypeName,
              iconName: item.businessTypeIcon,
              iconColor: item.color,
              businessTypeId: item.businessTypeId,
              address: item.addressDetail || 'Không có địa chỉ',
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
              phone: item.phoneNumber || '',
              email: item.email || '',
              facebook: item.socialMediaUrl || '',
              website: item.website || '',
              openHours: '',
              description: `${item.organizationName || ''} ${item.organizationName && item.representativeName ? '-' : ''} ${item.representativeName || ''}`,
              status: item.status || '',
            };
          });
          if (isMounted) {
            setAllFacilities(mappedFacilities);
          }
        } else {
          console.warn('API returned unexpected format, using fallback data');
          if (isMounted) {
            useFallbackData();
          }
        }
      } catch (error) {
        console.error('Error loading all facilities:', error);
        if (isMounted) {
          useFallbackData();
        }
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
    if (!isMountedRef.current) return;
    // Apply type filters
    const filteredData = data.filter(facility => {
      // Convert businessTypeId to number for consistent comparison
      const typeId = typeof facility.businessTypeId === 'string' ? 
        parseInt(facility.businessTypeId, 10) : facility.businessTypeId;
      // Check if this business type is active in filters
      return currentFilters[typeId] === true;
    });
    
    if (isMountedRef.current) {
      setFacilities(filteredData);
    }
  };

  // Update displayed facilities when filters change
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (allFacilities.length > 0) {
      applyFilters(allFacilities, filters);
    }
  }, [filters, allFacilities]);

  // Filter facilities based on search keyword
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (searchKeyword.trim() === '') {
      setFilteredFacilities([]);
      return;
    }

    const normalizedKeyword = removeVietnameseTones(searchKeyword.toLowerCase().trim());
    const filtered = allFacilities.filter(facility => {
      const normalizedName = removeVietnameseTones(facility.name.toLowerCase());
      return normalizedName.includes(normalizedKeyword);
    });
    
    if (isMountedRef.current) {
      setFilteredFacilities(filtered);
    }
  }, [searchKeyword, allFacilities]);

  // Map markers are updated when filtered facilities change
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (mapLoaded && facilities.length > 0) {
      updateMapMarkers();
    }
  }, [facilities, mapLoaded]);

  // Use a simplified fallback for demo data
  const useFallbackData = () => {
    const mockFacilities = [];
      
    setAllFacilities(mockFacilities);
    // The useEffect will handle applying filters
  };

  const updateMapMarkers = () => {
    if (!webViewRef.current) {
      console.error('WebView reference is not available');
      return;
    }
    
    console.log('Updating map markers with facilities:', facilities.length);
    
    if (facilities.length === 0) {
      console.log('No facilities to display on map');
      return;
    }
    
    try {
      // Ensure all facility IDs are properly converted to strings for comparison
      const facilitiesWithStringIds = facilities.map(facility => {
        if (!facility) return null;
        
        // Make sure the id is always a string to avoid type comparison issues
        const id = String(facility.id || '');
        
        return {
          id: id,
          name: String(facility.name || ''),
          type: String(facility.type || 'Không xác định'),
          iconName: String(facility.iconName || 'business'),
          iconColor: String(facility.iconColor || '#9C27B0'),
          latitude: Number(facility.latitude || 0),
          longitude: Number(facility.longitude || 0),
          status: String(facility.status || ''),
          businessTypeId: Number(facility.businessTypeId || 0)
        };
      }).filter(Boolean); // Remove any null entries
      
      // Properly escape the JSON string for safe injection into JavaScript
      const jsonString = JSON.stringify(facilitiesWithStringIds)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      
      console.log(`Sending ${facilitiesWithStringIds.length} markers to map`);
      
      // Pass filtered facilities to WebView using a safe approach
      const jsCode = `
        (function() {
          try {
            const markersJSON = "${jsonString}";
            const markers = JSON.parse(markersJSON);
            console.log('Received markers in WebView:', markers.length);
            if (typeof window.addMarkers === 'function') {
              window.addMarkers(markers);
            } else {
              console.error('addMarkers function not defined in WebView');
            }
            return true;
          } catch(e) {
            console.error('Error adding markers:', e);
            return false;
          }
        })();
      `;
      
      webViewRef.current.injectJavaScript(jsCode);
    } catch (error) {
      console.error('Error preparing markers for map:', error);
    }
  };

  // Simplified filter change handler
  const handleFilterChange = (businessTypeId) => {
    // Ensure businessTypeId is a number for consistency
    const typeId = typeof businessTypeId === 'string' ? 
      parseInt(businessTypeId, 10) : businessTypeId;
    
    // Update the filter
    setFilters(prev => ({
      ...prev,
      [typeId]: !prev[typeId],
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
        const createIcon = (businessTypeId, zoom, isSelected = false, iconName = 'business', status = '', iconColor = '#9C27B0') => {
          const icon = iconName || 'business';
          
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
                  '<span class="material-icons" style="color:#FF5252; font-size:' + (iconSize-6) + 'px;z-index:1;position:relative;">' + icon + '</span>' +
                '</div>',
              iconSize: [iconSize + 8, iconSize + 8],
              iconAnchor: [(iconSize + 8)/2, iconSize + 2], // anchor at the tip
              popupAnchor: [0, -iconSize]
            });
          }
          
          // Add status indicator
          const statusBadge = status ? 
            '<div style="position:absolute; top:-3px; right:-3px; width:10px; height:10px; border-radius:50%; background-color:' + 
            (status === 'A' ? '#085924' : '#f39c12') + 
            '; border: 1px solid white;"></div>' : '';
          
          return L.divIcon({
            className: 'custom-marker',
            html: '<div class="facility-marker" style="width: ' + (iconSize + 8) + 'px; height: ' + (iconSize + 8) + 'px;">' +
                  '<span class="material-icons" style="color: ' + iconColor + '; font-size: ' + iconSize + 'px;">' + icon + '</span>' +
                  statusBadge +
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
              { icon: createIcon(marker.businessTypeId, currentZoom, isSelected, marker.iconName, marker.status, marker.iconColor) }
            ).addTo(window.markersLayer);
            
            // Add tooltips for showing business names when zoom level is >= 20
            if (currentZoom >= 16) {
              // Use the marker's iconColor directly
              const iconColor = marker.iconColor || '#9C27B0';
              
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
              try {
                // Update selected facility
                window.selectedFacilityId = marker.id;
                
                // Update all markers to reflect selection
                updateMarkers(window.markersData);
                
                console.log('Marker clicked, sending facility ID:', marker.id);
                
                // Send message to React Native - ensure marker.id is treated as a string
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'viewFacility',
                  facilityId: String(marker.id)
                }));
              } catch (e) {
                console.error('Error in marker click handler:', e);
              }
            });
          });
        }
        
        // Function to add markers (called from React Native)
        window.addMarkers = function(markersData) {
          try {
            // Parse the JSON data safely
            let markers;
            if (typeof markersData === 'string') {
              markers = JSON.parse(markersData);
              console.log('Parsed markers from string:', markers.length);
            } else {
              markers = markersData;
              console.log('Using markers object directly:', markers.length);
            }
            
            if (!Array.isArray(markers)) {
              console.error('Markers data is not an array:', markers);
              return;
            }
            
            // Ensure all marker IDs are strings for consistent comparison
            markers.forEach(marker => {
              if (marker.id !== undefined && marker.id !== null) {
                marker.id = String(marker.id);
              }
            });
            
            console.log('Processed markers:', markers.length);
            window.markersData = markers; // Save for zoom updates
            updateMarkers(markers);
          } catch (error) {
            console.error('Error parsing markers data:', error);
            console.error('Raw markers data:', markersData);
          }
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
    if (!isMountedRef.current || !event || !event.nativeEvent) return;
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', data);
      
      // Ensure data.type exists
      if (!data || !data.type) {
        console.error('Invalid WebView message format:', data);
        return;
      }
      
      switch (data.type) {
        case 'mapLoaded':
          setMapLoaded(true);
          break;
          
        case 'mapClick':
          if (data.latitude && data.longitude) {
            setSelectedFacility({
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
            });
          }
          break;
          
        case 'reviewFacility':
          if (!data.facilityId) {
            console.error('Missing facilityId in reviewFacility message');
            return;
          }
          
          const facilityToReview = facilities.find(f => String(f.id) === String(data.facilityId));
          if (facilityToReview && isMountedRef.current) {
            setSelectedFacility(facilityToReview);
            setIsReviewModalVisible(true);
          } else {
            console.error('Facility not found for review:', data.facilityId);
          }
          break;
          
        case 'viewReviews':
          if (!data.facilityId) {
            console.error('Missing facilityId in viewReviews message');
            return;
          }
          
          const facilityToView = facilities.find(f => String(f.id) === String(data.facilityId));
          if (facilityToView && isMountedRef.current) {
            handleViewFacilityDetails(facilityToView);
            setActiveTab('reviews');
          } else {
            console.error('Facility not found for viewing reviews:', data.facilityId);
          }
          break;
          
        case 'viewFacility':
          try {
            if (!data.facilityId) {
              console.error('Missing facilityId in viewFacility message');
              return;
            }
            
            console.log('Finding facility with ID:', data.facilityId);
            
            if (!facilities || facilities.length === 0) {
              console.error('No facilities available');
              return;
            }
            
            console.log('Available facilities:', facilities.map(f => f.id));
            
            const facilityId = String(data.facilityId);
            const facilityToShow = facilities.find(f => String(f.id) === facilityId);
            console.log('Found facility:', facilityToShow);
            
            if (facilityToShow && isMountedRef.current) {
              console.log('Opening bottom sheet for facility:', facilityToShow.name);
              handleViewFacilityDetails(facilityToShow);
            } else {
              console.error('Facility not found for ID:', facilityId);
            }
          } catch (viewError) {
            console.error('Error in viewFacility handler:', viewError);
          }
          break;
          
        default:
          console.log('Unhandled WebView message type:', data.type);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error parsing WebView message:', error);
        console.error('Original message:', event.nativeEvent.data);
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
    if (!isMountedRef.current || !facility) {
      console.error('Cannot view facility details:', facility ? 'isMounted is false' : 'facility is null');
      return;
    }
    
    console.log('Showing facility details:', facility.id, facility.name);
    
    try {
      // Ensure all facility properties have default values to avoid rendering issues
      const safetyFacility = {
        id: facility.id || 0,
        name: facility.name || 'Không có tên',
        type: facility.type || 'Không xác định',
        iconName: facility.iconName || 'business',
        iconColor: facility.iconColor || '#9C27B0',
        address: facility.address || 'Không có địa chỉ',
        latitude: facility.latitude || 0,
        longitude: facility.longitude || 0,
        phone: facility.phone || '',
        email: facility.email || '',
        facebook: facility.facebook || '',
        website: facility.website || '',
        openHours: facility.openHours || '',
        description: facility.description || 'Chưa có thông tin chi tiết về cơ sở này.',
        status: facility.status || '',
        businessTypeId: facility.businessTypeId || 0
      };
      
      // Set the facility data
      setSelectedFacility(safetyFacility);
      setSelectedMarkerId(String(safetyFacility.id));
      
      // Show the bottom sheet immediately
      setBottomSheetVisible(true);
      setIsBottomSheetExpanded(false);
      bottomSheetAnim.setValue(minHeight);
      setActiveTab('overview');
      
      // Set empty reviews to avoid any rendering issues
      setReviews([]);
      
      // After a short delay, load mock reviews
      setTimeout(() => {
        if (isMountedRef.current) {
          const mockReviews = [
            {
              id: 1,
              reviewerName: 'Nguyễn Văn A',
              rating: 5,
              title: 'Dịch vụ xuất sắc!',
              content: 'Dịch vụ rất tuyệt vời!',
              date: '15/08/2023',
              likes: 2,
              replies: 0,
            },
            {
              id: 2,
              reviewerName: 'Trần Thị B',
              rating: 4,
              title: 'Tốt nhưng vẫn có thể cải thiện',
              content: 'Dịch vụ tốt, giá cả phải chăng.',
              date: '20/07/2023',
              likes: 0,
              replies: 1,
            },
          ];
          setReviews(mockReviews);
        }
      }, 500);
    } catch (error) {
      console.error('Error showing facility details:', error);
    }
  };

  const focusFacility = (facility) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.focusOnFacility(${Number(facility.latitude)}, ${Number(facility.longitude)}, 18);
        true;
      `);
    }
    
    setSearchKeyword('');
    setFilteredFacilities([]);
  };


  // Render the star rating
  const renderStars = (rating) => {
    // Ensure rating is a valid number
    const validRating = typeof rating === 'number' ? rating : 0;
    
    // Create an array to hold star icons
    const stars = [];
    
    // Add star icons to the array
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <View key={i}>
          <Ionicons
            name={i <= validRating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
            style={{marginRight: 2}}
          />
        </View>
      );
    }
    
    // Return stars in a row
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {stars}
      </View>
    );
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
    // Safety check for null/undefined selectedFacility
    if (!selectedFacility) {
      return (
        <View style={styles.emptyContent}>
          <Text>Không có dữ liệu</Text>
        </View>
      );
    }
    
    // Simple section component to ensure consistent structure
    const InfoSection = ({ title, icon, text, color }) => (
      <>
        <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>{title}</Text>
        <View style={styles.infoRow}>
          <View style={{marginRight: 10}}>
            <View>
              <Ionicons name={icon} size={20} color={color || "#085924"} />
            </View>
          </View>
          <Text style={[styles.infoText, color ? {color} : null]}>
            {text}
          </Text>
        </View>
      </>
    );
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 10}}>
        {/* Address section */}
        <InfoSection 
          title="Địa chỉ"
          icon="location-outline"
          text={selectedFacility.address || 'Chưa có thông tin'}
        />
        
        {/* Location section */}
        {selectedFacility.latitude ? (
          <InfoSection 
            title="Vị trí"
            icon="locate-outline"
            text={`[${String(selectedFacility.latitude || 0)},${String(selectedFacility.longitude || 0)}]`}
          />
        ) : null}
        
        {/* Type section */}
        <InfoSection 
          title="Loại hình"
          icon={
            selectedFacility.type === 'Nhà hàng' ? 'restaurant-outline' : 
            selectedFacility.type === 'Khách sạn' ? 'bed-outline' : 'cart-outline'
          }
          text={selectedFacility.type || 'Chưa phân loại'}
        />
        
        {/* Status section */}
        <InfoSection 
          title="Trạng thái"
          icon={selectedFacility.status === 'A' ? 'checkmark-circle-outline' : 'time-outline'}
          color={selectedFacility.status === 'A' ? "#085924" : "#f39c12"}
          text={selectedFacility.status === 'A' ? 'Đã duyệt' : 'Chờ duyệt'}
        />
        
        {/* Contact section */}
        {selectedFacility.phone ? (
          <InfoSection 
            title="Liên hệ"
            icon="call-outline"
            text={selectedFacility.phone}
          />
        ) : null}
        
        {/* Links section */}
        <Text style={[styles.infoTitle, {fontSize: 18, fontWeight: 'bold'}]}>Liên kết</Text>
        <View style={styles.socialLinks}>
          {selectedFacility.facebook ? (
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View>
                  <Ionicons name="logo-facebook" size={20} color="#fff" />
                </View>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          
          {selectedFacility.website ? (
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View>
                  <Ionicons name="globe-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.socialButtonText}>Website</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          
          {!selectedFacility.facebook && !selectedFacility.website ? (
            <Text style={styles.noDataText}>Chưa có liên kết</Text>
          ) : null}
        </View>
        
        {/* Action buttons */}
        {isAuthenticated ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#e74c3c'}]}
              onPress={() => setIsReportModalVisible(true)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View>
                  <Ionicons name="warning-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Phản ánh lên cơ quan chức năng</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
        
        <View style={styles.sectionDivider} />

        {/* Description section */}
        <Text style={[styles.sectionTitle, {fontSize: 18, fontWeight: 'bold'}]}>Giới thiệu</Text>
        <Text style={styles.descriptionText}>
          {selectedFacility.description || "Chưa có thông tin chi tiết về cơ sở này."}
        </Text>
      </ScrollView>
    );
  };

  const renderAboutTab = () => {
    if (!selectedFacility) {
      return (
        <View style={styles.tabContent}>
          <Text>Không có dữ liệu</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{paddingBottom: 10}}>
        <Text style={styles.aboutTitle}>Thông tin chi tiết</Text>
        <Text style={styles.aboutDescription}>
          {selectedFacility.description || "Chưa có thông tin chi tiết về cơ sở này."}
        </Text>
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
    // Safety check for null selectedFacility
    if (!selectedFacility) {
      return (
        <View style={styles.tabContent}>
          <Text>Không có dữ liệu</Text>
        </View>
      );
    }
    
    // If no reviews or invalid reviews array
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return (
        <ScrollView style={styles.tabContent}>
          <View style={styles.emptyReviews}>
            <View style={{alignItems: 'center', marginBottom: 10}}>
              <View>
                <Ionicons name="star-outline" size={50} color="#ccc" />
              </View>
            </View>
            <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.addReviewButton}
                onPress={() => setIsReviewModalVisible(true)}
              >
                <Text style={styles.addReviewButtonText}>Thêm đánh giá đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      );
    }

    // Render reviews with simplified structure
    return (
      <ScrollView style={styles.tabContent}>
        <View style={{padding: 15}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>
            Đánh giá ({reviews.length})
          </Text>
          
          {reviews.map((item, index) => (
            <View key={index} style={{marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10}}>
              <Text style={{fontWeight: 'bold'}}>
                {item.reviewerName || 'Ẩn danh'}
              </Text>
              
              <View style={{flexDirection: 'row', marginVertical: 5}}>
                {renderStars(item.rating || 0)}
              </View>
              
              {item.title && (
                <Text style={{fontWeight: 'bold', marginBottom: 5}}>
                  {item.title}
                </Text>
              )}
              
              <Text>
                {item.content || 'Không có nội dung'}
              </Text>
            </View>
          ))}
          
          {isAuthenticated && (
            <TouchableOpacity
              style={{backgroundColor: '#085924', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10}}
              onPress={() => setIsReviewModalVisible(true)}
            >
              <Text style={{color: '#fff'}}>Thêm đánh giá mới</Text>
            </TouchableOpacity>
          )}
        </View>
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
              <View>
                <Ionicons name="close" size={24} color="#333" />
              </View>
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
                    <View>
                      <Ionicons
                        name={star <= newReview.rating ? "star" : "star-outline"}
                        size={30}
                        color="#FFD700"
                      />
                    </View>
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
                        <View>
                          <Ionicons name="close-circle" size={24} color="#e74c3c" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addMediaButton}
                    onPress={() => handleMediaPicker('review')}
                  >
                    <View>
                      <Ionicons name="add-circle-outline" size={40} color="#085924" />
                    </View>
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
              <View>
                <Ionicons name="close" size={24} color="#085924" />
              </View>
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
                        <View>
                          <Ionicons name="close-circle" size={24} color="#e74c3c" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addMediaButton}
                    onPress={() => handleMediaPicker('report')}
                  >
                    <View>
                      <Ionicons name="add-circle-outline" size={40} color="#085924" />
                    </View>
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
      webViewRef.current.injectJavaScript(`
        window.selectedFacilityId = ${selectedMarkerId ? `"${selectedMarkerId}"` : 'null'}; 
        if(window.markersData) updateMarkers(window.markersData); 
        true;
      `);
    }
  }, [selectedMarkerId]);

  // Chỉ xin quyền khi người dùng nhấn Thêm media
  const requestMediaPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission constants are defined correctly
        if (!PermissionsAndroid.PERMISSIONS) {
          console.error('PermissionsAndroid.PERMISSIONS is undefined');
          return 'denied';
        }

        const permissions = Platform.Version >= 33 
          ? [
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, 
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
            ]
          : [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];

        // Verify if permissions are defined before proceeding
        if (Platform.Version >= 33) {
          if (!PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES || 
              !PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO) {
            console.error('Media permission constants are undefined');
            return 'denied';
          }
        } else {
          if (!PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE) {
            console.error('Storage permission constant is undefined');
            return 'denied';
          }
        }

        // Request permissions
        let result;
        if (Platform.Version >= 33) {
          result = await PermissionsAndroid.requestMultiple(permissions);
        } else {
          result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

        // Handle null/undefined result
        if (!result) {
          console.warn('Permission result is null or undefined');
          return 'denied';
        }

        // Check result format and process accordingly
        if (Platform.Version >= 33) {
          // For multiple permissions, check if the result is an object
          if (typeof result !== 'object') {
            console.warn(`Unexpected result type: ${typeof result}`);
            return 'denied';
          }
          
          // Check for NEVER_ASK_AGAIN
          if (Object.values(result).some(r => 
              r === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
            return 'never_ask_again';
          }
          
          // Check if all permissions are granted
          return Object.values(result).every(r => 
              r === PermissionsAndroid.RESULTS.GRANTED)
            ? 'granted'
            : 'denied';
        } else {
          // For single permission
          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            return 'never_ask_again';
          }
          return result === PermissionsAndroid.RESULTS.GRANTED
            ? 'granted'
            : 'denied';
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return 'denied';
      }
    }
    
    return 'granted'; // iOS automatically handles permissions
  };

  const handleMediaPicker = async (type) => {
    try {
      if (Platform.OS === 'android') {
        const permission = await requestMediaPermission();
        
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
          Alert.alert(
            'Cần quyền truy cập',
            'Ứng dụng cần quyền truy cập media để hoạt động chính xác',
            [{ text: 'Đã hiểu', style: 'cancel' }]
          );
          return;
        }
      }

      // Continue with image picker if permission granted
      const options = {
        mediaType: 'mixed',
        selectionLimit: 5,
        quality: 1,
        includeBase64: false,
        saveToPhotos: false,
        presentationStyle: 'pageSheet',
      };

      try {
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
      } catch (imagePickerError) {
        console.error('Error in image picker:', imagePickerError);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn media. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error in handleMediaPicker:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý quyền truy cập. Vui lòng thử lại sau.');
    }
  };

  // Xin quyền media duy nhất 1 lần khi mở app lần đầu sau khi cài đặt
  useEffect(() => {
    const checkAndRequestFirstTime = async () => {
      try {
        // Check if we've already requested permissions
        const requested = await AsyncStorage.getItem('media_permission_requested');
        if (!requested) {
          // Log that we're making the initial permission request
          console.log('Making initial permission request');
          
          // Use a timeout to ensure the app is fully loaded before requesting permissions
          setTimeout(async () => {
            try {
              const result = await requestMediaPermission();
              console.log('Initial permission request result:', result);
              await AsyncStorage.setItem('media_permission_requested', 'true');
            } catch (error) {
              console.error('Error in delayed permission request:', error);
            }
          }, 2000);
        } else {
          console.log('Permissions were previously requested');
        }
      } catch (e) {
        console.warn('Error checking/storing media permission flag:', e);
      }
    };
    
    checkAndRequestFirstTime();
  }, []);

  // Update map markers when business types change or when facilities change
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (mapLoaded && facilities.length > 0 && businessTypes.length > 0) {
      console.log('Refreshing map due to business types or facilities update');
      updateMapMarkers();
    }
  }, [businessTypes, facilities, mapLoaded]);

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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
        }}
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
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleEditReview(selectedReview)}
            >
              <View>
                <Ionicons name="create-outline" size={20} color="#333" />
              </View>
              <Text style={styles.menuItemText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleDeleteReview(selectedReview)}
            >
              <View>
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </View>
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
        <View>
          <Ionicons name="layers-outline" size={24} color="#333" />
        </View>
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
              <View style={styles.mapTypeOptionIcon}>
                <Ionicons 
                  name="map-outline" 
                  size={24} 
                  color={mapType === 'default' ? "#085924" : "#333"} 
                />
              </View>
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
              <View style={styles.mapTypeOptionIcon}>
                <Ionicons 
                  name="globe-outline" 
                  size={24} 
                  color={mapType === 'satellite' ? "#085924" : "#333"} 
                />
              </View>
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
              <View style={styles.mapTypeOptionIcon}>
                <Ionicons 
                  name="trail-sign-outline" 
                  size={24} 
                  color={mapType === 'terrain' ? "#085924" : "#333"} 
                />
              </View>
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
          <View>
            <Ionicons name="search" size={20} color="#085924" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#888"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <View>
                <Ionicons name="close-circle" size={20} color="#085924" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Controls - Dynamic based on businessTypes */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          {businessTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                filters[type.id] && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(type.id)}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={filters[type.id] ? "#fff" : "#666"} style={styles.filterButtonIcon} />
              ) : (
                <View>
                  <Ionicons 
                    name={type.businessTypeIcon || 'business'} 
                    size={18} 
                    color={filters[type.id] ? "#fff" : "#666"} 
                  />
                </View>
              )}
              <Text style={[
                styles.filterButtonText,
                filters[type.id] && styles.filterButtonTextActive,
              ]}>{type.businessTypeName || 'Không xác định'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Search Results */}
        {filteredFacilities.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={filteredFacilities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => {
                // Convert businessTypeId to number for proper comparison
                const typeId = typeof item.businessTypeId === 'string' ? 
                  parseInt(item.businessTypeId, 10) : item.businessTypeId;
                
                // Find matching business type
                const businessType = businessTypes.find(type => type.id === typeId) || {};
                
                return (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => focusFacility(item)}>
                    <View style={styles.searchResultIconContainer}>
                      <View>
                        <Ionicons 
                          name={businessType.businessTypeIcon || 'business'} 
                          size={16} 
                          color="#fff" 
                        />
                      </View>
                    </View>
                    <View style={styles.searchResultTextContainer}>
                      <Text style={styles.searchResultName}>
                        {item.name}
                        {item.status && (
                          <Text style={{
                            fontSize: 12,
                            color: item.status === 'A' ? '#085924' : '#f39c12',
                            marginLeft: 5
                          }}>
                            {' '}{item.status === 'A' ? '✓' : '⏱️'}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.searchResultAddress}>{item.address}</Text>
                    </View>
                    <View>
                      <Ionicons name="chevron-forward" size={16} color="#085924" />
                    </View>
                  </TouchableOpacity>
                );
              }}
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
      {bottomSheetVisible && selectedFacility ? (
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
              {selectedFacility.name || 'Không có tên'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setBottomSheetVisible(false)}
            >
              <View>
                <Ionicons name="close" size={24} color="#333" />
              </View>
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
            {activeTab === 'overview' && selectedFacility && renderOverviewTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
            {activeTab === 'about' && selectedFacility && renderAboutTab()}
          </View>
        </Animated.View>
      ) : null}
      
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
                <View>
                  <Ionicons name="close" size={24} color="#333" />
                </View>
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
                              <Text style={styles.reviewDate}>{item.date || ''}</Text>
                              <View style={styles.ratingRow}>
                                {renderStars(item.rating || 0)}
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
                                    <View>
                                      <Ionicons name="play" size={24} color="#fff" />
                                    </View>
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
                        <TouchableOpacity 
                          style={styles.reviewAction}
                          onPress={() => {/* handle action */}}
                        >
                          <View>
                            <Ionicons name="thumbs-up-outline" size={18} color="#666" />
                          </View>
                          <Text style={styles.reviewActionText}>{item.likes || 0}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.reviewAction}
                          onPress={() => {/* handle action */}}
                        >
                          <View>
                            <Ionicons name="chatbubble-outline" size={18} color="#666" />
                          </View>
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
                  <View style={{alignItems: 'center', marginBottom: 10}}>
                    <View>
                      <Ionicons name="star-outline" size={50} color="#ccc" />
                    </View>
                  </View>
                  <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
                  {isAuthenticated && (
                    <TouchableOpacity 
                      style={styles.addReviewButton}
                      onPress={() => setIsReviewModalVisible(true)}
                    >
                      <Text style={styles.addReviewButtonText}>Thêm đánh giá đầu tiên</Text>
                    </TouchableOpacity>
                  )}
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
            <TouchableOpacity 
              style={styles.menuModalItem}
              onPress={() => handleEditReview(selectedReview)}
            >
              <View>
                <Ionicons name="create-outline" size={20} color="#333" />
              </View>
              <Text style={styles.menuModalItemText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuModalItem}
              onPress={() => handleDeleteReview(selectedReview)}
            >
              <View>
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </View>
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
                <View>
                  <Ionicons name="close" size={24} color="#333" />
                </View>
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
                      <View>
                        <Ionicons
                          name={star <= newReview.rating ? "star" : "star-outline"}
                          size={30}
                          color="#FFD700"
                        />
                      </View>
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