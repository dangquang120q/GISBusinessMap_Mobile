import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const ConfirmationPopup = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonStyle,
  cancelButtonStyle,
  confirmTextStyle,
  cancelTextStyle,
  isDestructive = false
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Confirmation Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{title || 'Xác nhận'}</Text>
          </View>
          
          {/* Confirmation Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message || 'Bạn có muốn thực hiện thao tác này?'}</Text>
          </View>
          
          {/* Confirmation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, cancelButtonStyle]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText, cancelTextStyle]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                isDestructive ? styles.destructiveButton : styles.confirmButton, 
                confirmButtonStyle
              ]} 
              onPress={onConfirm}
            >
              <Text style={[
                styles.buttonText, 
                isDestructive ? styles.destructiveButtonText : styles.confirmButtonText, 
                confirmTextStyle
              ]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    borderRightWidth: 0.5,
    borderRightColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: 'white',
  },
  destructiveButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    backgroundColor: '#F05454',
  },
  destructiveButtonText: {
    color: 'white',
  }
});

export default ConfirmationPopup; 