import api from './api';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
  }

  async requestLocationPermission() {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          return true;
        }
      } catch (error) {
        console.error('Error requesting iOS location permission:', error);
      }
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return (
        granted === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Error requesting Android location permission:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            this.currentLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };
            resolve(this.currentLocation);
          },
          (error) => {
            console.error('Error getting current location:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
            distanceFilter: 0,
            forceRequestLocation: true,
          }
        );
      });
    } catch (error) {
      console.error('Error in getCurrentLocation:', error);
      throw error;
    }
  }

  startLocationTracking(onLocationUpdate) {
    if (this.watchId !== null) {
      return;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        onLocationUpdate(this.currentLocation);
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest update interval
        forceRequestLocation: true,
      }
    );
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get list of country
  async getCountries() {
    try {
      const response = await api.get('/api/services/app/Countries/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Get list of cities/provinces
  async getCities() {
    try {
      const response = await api.get('/api/services/app/Cities/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  // Get districts by provinceId
  async getDistricts(provinceId) {
    try {
      const response = await api.get('/api/services/app/Districts/GetList', {
        params: {
          provinceId
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // Get wards by districtId
  async getWards(districtId) {
    try {
      const response = await api.get('/api/services/app/Wards/GetList', {
        params: {
          districtId
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
}

export default new LocationService(); 