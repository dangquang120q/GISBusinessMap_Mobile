import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import useAppConfiguration from '../hooks/useAppConfiguration';

/**
 * Component that displays current configuration information
 * This is a sample component showing how to use the configuration context
 */
const ConfigurationDisplay = () => {
  const config = useAppConfiguration();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language</Text>
        <Text style={styles.value}>
          {config.localization.currentLanguage?.displayName} ({config.localization.currentLanguage?.name})
        </Text>
        <Text style={styles.label}>Right to Left:</Text>
        <Text style={styles.value}>{config.localization.isRightToLeft ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{config.session.userId || 'Not logged in'}</Text>
        <Text style={styles.label}>Tenant ID:</Text>
        <Text style={styles.value}>{config.session.tenantId || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Languages</Text>
        {config.localization.languages.map((lang) => (
          <View key={lang.name} style={styles.languageItem}>
            <Text style={styles.languageName}>{lang.displayName}</Text>
            <Text style={styles.languageCode}>({lang.name})</Text>
            {lang.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions Example</Text>
        <Text style={styles.label}>Has Admin Permission:</Text>
        <Text style={styles.value}>
          {config.permissions.hasPermission('Administration') ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.label}>Default Language:</Text>
        <Text style={styles.value}>
          {config.settings.getValue('Abp.Localization.DefaultLanguageName', 'Not set')}
        </Text>
        <Text style={styles.label}>UI Theme:</Text>
        <Text style={styles.value}>
          {config.settings.getValue('App.UiTheme', 'Default')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  defaultBadge: {
    fontSize: 12,
    color: 'white',
    backgroundColor: '#0066cc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
});

export default ConfigurationDisplay; 