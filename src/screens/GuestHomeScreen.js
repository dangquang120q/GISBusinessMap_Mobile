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
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function GuestHomeScreen() {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initial map center point
  const initialCenter = {
    latitude: 20.852,
    longitude: 106.688,
    zoom: 14
  };

  // HTML for the leaflet map (simplified version for guest users)
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          var map = L.map('map').setView([${initialCenter.latitude}, ${initialCenter.longitude}], ${initialCenter.zoom});
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);
          
          // Simple markers for testing
          const testMarkers = [
            { lat: 20.849717, lng: 106.688983, name: 'Siêu thị Vinmart' },
            { lat: 20.856982, lng: 106.692443, name: 'Nhà hàng Hải Sản' },
            { lat: 20.857883, lng: 106.683621, name: 'Cà phê Highland' },
          ];
          
          // Add test markers
          testMarkers.forEach(point => {
            L.marker([point.lat, point.lng])
              .addTo(map)
              .bindPopup(point.name);
          });
          
          // Inform React Native that map is loaded
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          }, 1000);
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
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('LoginScreen', { screen: 'Login' });
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
        onHttpError={(e) => console.error('WebView HTTP error:', e.nativeEvent)}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#AD40AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cơ sở..."
            editable={false}
            placeholderTextColor="#888"
          />
        </View>
      </View>
      
      {/* Login Notice Banner */}
      <View style={styles.loginBanner}>
        <Text style={styles.loginText}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#AD40AF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 