import React, { useEffect } from 'react';
import { View } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';

const PermissionHandler = () => {
  const { requestLocationPermission } = usePermissions();

  useEffect(() => {
    // Yêu cầu quyền truy cập vị trí khi component mount
    const requestPermissions = async () => {
      try {
        await requestLocationPermission();
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  // Component này không render gì cả, chỉ xử lý logic
  return null;
};

export default PermissionHandler; 