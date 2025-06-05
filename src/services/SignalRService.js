import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageCallbacks = new Set();
  }

  async initializeConnection() {
    try {
      // Check if already connected
      if (this.isConnected) {
        console.log('SignalR already connected');
        return;
      }

      // Get the encrypted authentication token from AsyncStorage
      const encryptedAuthToken = await AsyncStorage.getItem('userToken');
      if (!encryptedAuthToken) {
        console.log('No auth token available, skipping SignalR connection');
        return;
      }

      // Ensure the base URL doesn't end with a slash
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/signalr`, {
          transport: 1, // Use WebSockets only
          skipNegotiation: true,
          queryString: `enc_auth_token=${encodeURIComponent(encryptedAuthToken)}`
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Handle connection events
      this.connection.onclose(async (error) => {
        this.isConnected = false;
        console.log('SignalR Connection closed', error);
        await this.tryReconnect();
      });

      this.connection.onreconnecting((error) => {
        this.isConnected = false;
        console.log('SignalR Reconnecting...', error);
      });

      this.connection.onreconnected((connectionId) => {
        this.isConnected = true;
        console.log('SignalR Reconnected', connectionId);
      });

      await this.startConnection();

      // Set up message handlers
      this.setupMessageHandlers();
    } catch (error) {
      console.error('Error initializing SignalR connection:', error);
      throw error;
    }
  }

  setupMessageHandlers() {
    if (!this.connection) return;

    // Handle SOS signals
    this.connection.on('ReceiveSosSignal', (data) => {
      this.messageCallbacks.forEach(callback => callback('sos', data));
    });

    // Handle notifications
    this.connection.on('ReceiveNotification', (data) => {
      this.messageCallbacks.forEach(callback => callback('notification', data));
    });

    // Add more message handlers as needed
  }

  // Subscribe to SignalR messages
  subscribe(callback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  async startConnection() {
    try {
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR Connected');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      await this.tryReconnect();
    }
  }

  async tryReconnect() {
    try {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`SignalR Reconnect attempt ${this.reconnectAttempts}`);
        await this.startConnection();
      } else {
        console.error('SignalR Max reconnection attempts reached');
        // Try to reinitialize the connection
        await this.initializeConnection();
      }
    } catch (error) {
      console.error('Error reconnecting to SignalR:', error);
    }
  }

  async sendSosSignal(location) {
    try {
      if (!this.isConnected) {
        await this.initializeConnection();
      }

      await this.connection.invoke('SendSosSignal', {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending SOS signal:', error);
      throw error;
    }
  }

  // Cleanup method
  async disconnect() {
    if (this.connection) {
      try {
        this.messageCallbacks.clear();
        await this.connection.stop();
        this.isConnected = false;
        console.log('SignalR Disconnected');
      } catch (error) {
        console.error('Error disconnecting from SignalR:', error);
      }
    }
  }
}

export default new SignalRService(); 