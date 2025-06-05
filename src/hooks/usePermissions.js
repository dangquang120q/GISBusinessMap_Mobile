import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import LocationService from '../services/LocationService';

export const usePermissions = () => {
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const granted = await LocationService.requestLocationPermission();
      setLocationPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  // Kiểm tra quyền truy cập vị trí khi component mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const fineLocation = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          const coarseLocation = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          );
          setLocationPermissionGranted(fineLocation && coarseLocation);
        } catch (error) {
          console.error('Error checking location permission:', error);
        }
      } else {
        // iOS: Sẽ yêu cầu quyền khi sử dụng
        setLocationPermissionGranted(false);
      }
    };

    checkLocationPermission();
  }, []);

  return {
    locationPermissionGranted,
    requestLocationPermission,
  };
}; 