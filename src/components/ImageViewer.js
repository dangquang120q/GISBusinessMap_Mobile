import React from 'react';
import { Image, View, StyleSheet, Dimensions } from 'react-native';

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
 */
const ImageViewer = ({
  source,
  type = 'cover',
  aspectRatio = 16/9,
  style = {},
  borderRadius = 8,
  showShadow = true,
  width,
}) => {
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
  
  return (
    <View style={containerStyle}>
      <Image
        source={isUriSource ? source : source}
        style={styles.image}
        resizeMode={resizeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
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
});

export default ImageViewer; 