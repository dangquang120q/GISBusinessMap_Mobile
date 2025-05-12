# GIS Business Map Setup Instructions

This document provides instructions for setting up the GIS Business Map functionality in your mobile app.

## Required Packages

The following packages are required:

1. `react-native-webview` - For embedding the Leaflet map
   ```
   npm install react-native-webview --save
   ```

2. Ensure `react-native-vector-icons` is installed (should already be in your project)

## Map Implementation

This implementation uses:
- OpenStreetMap as the map provider
- Leaflet.js for map interaction, embedded in a WebView
- Custom colored markers for different business types
- Interactive popups for business information and actions

## Setup

No API keys are required since we're using OpenStreetMap, which is freely available.

### Android Setup

1. For proper WebView support, ensure your `android/app/src/main/AndroidManifest.xml` has internet permission:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```

### iOS Setup

1. For iOS, in your `Info.plist`, add:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>We need your location to show you on the map</string>
   ```

## How It Works

The app embeds a WebView that loads a Leaflet map. Communication between the React Native layer and the WebView happens through:

1. **React Native to WebView**: Using `webViewRef.current.injectJavaScript()` to call JavaScript functions
2. **WebView to React Native**: Using `window.ReactNativeWebView.postMessage()` to send data back

## Customizing Map Appearance

To customize the map appearance:

1. Edit the Leaflet HTML template in `HomeScreen.js`
2. Modify marker styles by editing the `createIcon` function
3. Change the initial map view by updating `initialCenter` coordinates and zoom

## API Configuration

Update the API_BASE_URL in `HomeScreen.js` to point to your actual backend service.

Current mock URL: `https://your-api-base-url.com`

The app expects the following API endpoints to be available:

- `GET /api/services/app/Facility/GetList` - Get all facilities
- `POST /api/services/app/Facility/Create` - Create a new facility
- `GET /api/services/app/Review/GetListByFacilityId?facilityId={id}` - Get reviews for a facility
- `POST /api/services/app/Review/Create` - Add a new review 