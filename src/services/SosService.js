import SignalRService from './SignalRService';
import LocationService from './LocationService';
import { api } from './api';
import { Platform } from 'react-native';

class SosService {
  constructor() {
    this.isTracking = false;
    this.locationUpdateInterval = null;
  }

  async initializeSosTracking() {
    try {
      // Request location permissions
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        if (Platform.OS === 'ios') {
          throw new Error('Vui lòng cấp quyền truy cập vị trí trong Cài đặt để sử dụng tính năng SOS');
        } else {
          throw new Error('Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng SOS');
        }
      }

      // Initialize SignalR connection
      await SignalRService.initializeConnection();

      return true;
    } catch (error) {
      console.error('Error initializing SOS tracking:', error);
      throw error;
    }
  }

  async startSosTracking() {
    try {
      if (this.isTracking) {
        return;
      }

      // Kiểm tra và yêu cầu quyền truy cập
      await this.initializeSosTracking();
      this.isTracking = true;

      // Start location tracking
      LocationService.startLocationTracking(async (location) => {
        try {
          console.log('location', location);
          // Send location update through SignalR
          // await SignalRService.sendSosSignal(location);

          // Also send to REST API for backup
          await this.sendSosToApi(location);
        } catch (error) {
          console.error('Error sending location update:', error);
          // Nếu lỗi liên quan đến quyền truy cập
          if (error.message.includes('permission')) {
            this.stopSosTracking();
            throw new Error('Quyền truy cập vị trí đã bị thu hồi. Vui lòng cấp lại quyền để tiếp tục.');
          }
        }
      });

    } catch (error) {
      this.isTracking = false;
      console.error('Error starting SOS tracking:', error);
      throw error;
    }
  }

  async sendSosToApi(location) {
    try {
      await api.post('/api/services/app/Sos/SendSosSignal', {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending SOS to API:', error);
      throw error;
    }
  }

  stopSosTracking() {
    if (!this.isTracking) {
      return;
    }

    // Stop location tracking
    LocationService.stopLocationTracking();

    // Disconnect SignalR
    SignalRService.disconnect();

    this.isTracking = false;
  }

  // Method to check if SOS tracking is active
  isSOSActive() {
    return this.isTracking;
  }
}

export default new SosService(); 