import React, { useState } from 'react';
import { Image, View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import Colors from '../constants/Colors';

/**
 * A component for displaying images with proper styling and aspect ratio
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.source - Image source (require or uri)
 * @param {string} props.type - Image type: 'cover', 'contain', 'stretch' (default: 'cover')
 * @param {number} props.aspectRatio - Aspect ratio for the image (default: 16/9)
 * @param {Object} props.style - Additional style for the container
 * @param {number} props.borderRadius - Border radius for the image (default: 8)
 * @param {boolean} props.showShadow - Whether to show shadow effect (default: true)
 * @param {number} props.width - Custom width for the image (default: screen width - 40)
 * @param {string} props.placeholderText - Text to show when image fails to load
 */
const ImageViewer = ({
  source,
  type = 'cover',
  aspectRatio = 16/9,
  style = {},
  borderRadius = 8,
  showShadow = true,
  width,
  placeholderText = 'Image',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = width || screenWidth - 40;
  const imageHeight = imageWidth / aspectRatio;

  const isUriSource = typeof source === 'object' && source.uri;
  
  const resizeMode = {
    'cover': 'cover',
    'contain': 'contain',
    'stretch': 'stretch',
  }[type] || 'cover';
  
  const containerStyle = [
    styles.container,
    {
      width: imageWidth,
      height: imageHeight,
      borderRadius,
    },
    showShadow && styles.shadow,
    style,
  ];
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setLoading(false);
    setError(true);
  };
  
  return (
    <View style={containerStyle}>
      {!error && (
        <Image
          source={source}
          style={styles.image}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{placeholderText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ImageViewer; 