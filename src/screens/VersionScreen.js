import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const VersionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phiên bản ứng dụng</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>GIS_BUSINESS</Text>
          <Text style={styles.version}>Phiên bản 1.0.0</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin phiên bản</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phiên bản hiện tại:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày phát hành:</Text>
              <Text style={styles.infoValue}>21/05/2025</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nhà phát triển:</Text>
              <Text style={[styles.infoValue, styles.developerValue]}>CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ GIẢI PHÁP TƯƠNG LAI</Text>
            </View>
          </View>

          <View style={styles.changelogSection}>
            <Text style={styles.sectionTitle}>Nhật ký thay đổi</Text>
            <Text style={styles.changelogTitle}>Phiên bản 1.0.0 (21/05/2025)</Text>
            <Text style={styles.changelogItem}>• Phát hành phiên bản đầu tiên</Text>
            <Text style={styles.changelogItem}>• Tính năng đánh giá cơ sở kinh doanh</Text>
            <Text style={styles.changelogItem}>• Tính năng phản hồi từ cơ quan chức năng</Text>
            <Text style={styles.changelogItem}>• Tính năng thông báo</Text>
            <Text style={styles.changelogItem}>• Tính năng quản lý tài khoản</Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
            <Text style={styles.contactText}>
              Nếu bạn gặp vấn đề với ứng dụng hoặc có góp ý, vui lòng liên hệ với chúng tôi:
            </Text>
            <Text style={styles.contactEmail}>Email: info@msf.vn</Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  developerValue: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 10,
  },
  changelogSection: {
    marginBottom: 30,
  },
  changelogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  changelogItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 15,
  },
  contactSection: {
    marginBottom: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  contactEmail: {
    fontSize: 14,
    color: '#085924',
    fontWeight: '500',
  },
});

export default VersionScreen; 