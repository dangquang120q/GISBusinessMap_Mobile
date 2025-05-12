import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [locationServices, setLocationServices] = React.useState(true);

  const renderSettingItem = (icon, title, rightElement) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#AD40AF" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {rightElement}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem(
          'notifications-outline',
          'Notifications',
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{false: '#767577', true: '#AD40AF'}}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />,
        )}
        {renderSettingItem(
          'moon-outline',
          'Dark Mode',
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{false: '#767577', true: '#AD40AF'}}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />,
        )}
        {renderSettingItem(
          'location-outline',
          'Location Services',
          <Switch
            value={locationServices}
            onValueChange={setLocationServices}
            trackColor={{false: '#767577', true: '#AD40AF'}}
            thumbColor={locationServices ? '#fff' : '#f4f3f4'}
          />,
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem(
          'person-outline',
          'Account Information',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
        )}
        {renderSettingItem(
          'lock-closed-outline',
          'Privacy & Security',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
        )}
        {renderSettingItem(
          'card-outline',
          'Payment Methods',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderSettingItem(
          'help-circle-outline',
          'Help Center',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
        )}
        {renderSettingItem(
          'information-circle-outline',
          'About',
          <Ionicons name="chevron-forward" size={24} color="#666" />,
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;