import { useConfiguration } from '../context/ConfigurationContext';

/**
 * Custom hook for accessing app configuration data
 * Provides structured access to different parts of the configuration
 */
const useAppConfiguration = () => {
  const { configuration, loading, error, reloadConfiguration } = useConfiguration();

  return {
    // Base properties
    configuration,
    loading,
    error,
    reloadConfiguration,
    
    // Localization
    localization: {
      currentLanguage: configuration?.localization?.currentLanguage,
      languages: configuration?.localization?.languages || [],
      isRightToLeft: configuration?.localization?.currentLanguage?.isRightToLeft || false,
      values: configuration?.localization?.values || {},
    },
    
    // Session info
    session: {
      userId: configuration?.session?.userId,
      tenantId: configuration?.session?.tenantId,
      multiTenancySide: configuration?.session?.multiTenancySide,
      isAuthenticated: !!configuration?.session?.userId,
    },
    
    // Multi-tenancy info
    multiTenancy: {
      isEnabled: configuration?.multiTenancy?.isEnabled || false,
      sides: configuration?.multiTenancy?.sides || {},
    },
    
    // Permissions
    permissions: {
      all: configuration?.auth?.allPermissions || {},
      granted: configuration?.auth?.grantedPermissions || {},
      
      // Helper method to check if user has a specific permission
      hasPermission: (permissionName) => {
        if (!configuration?.auth?.grantedPermissions) return false;
        return !!configuration.auth.grantedPermissions[permissionName];
      },
    },
    
    // Settings
    settings: {
      values: configuration?.setting?.values || {},
      
      // Helper method to get a setting value with optional default
      getValue: (key, defaultValue = null) => {
        if (!configuration?.setting?.values) return defaultValue;
        return configuration.setting.values[key] || defaultValue;
      },
    },
    
    // Timing & clock
    timing: {
      timeZone: configuration?.timing?.timeZoneInfo,
      currentOffsetInMilliseconds: configuration?.timing?.timeZoneInfo?.windows?.currentUtcOffsetInMilliseconds,
    },
    
    // Feature checks
    features: {
      allFeatures: configuration?.features?.allFeatures || {},
      
      // Helper method to check if a feature is enabled
      isEnabled: (featureName) => {
        if (!configuration?.features?.allFeatures) return false;
        return !!configuration.features.allFeatures[featureName];
      },
    },
    
    // Custom data
    custom: configuration?.custom || {},
  };
};

export default useAppConfiguration; 