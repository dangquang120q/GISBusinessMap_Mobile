import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const TermOfUseScreen = () => {
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
        <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Cập nhật lần cuối: 21/05/2025</Text>
          
          <Text style={styles.paragraph}>
            Xin vui lòng đọc kỹ các điều khoản sử dụng này trước khi sử dụng ứng dụng GIS_BUSINESS của chúng tôi.
          </Text>

          <Text style={styles.sectionTitle}>1. Chấp nhận điều khoản</Text>
          <Text style={styles.paragraph}>
            Bằng việc truy cập và sử dụng ứng dụng này, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng ứng dụng của chúng tôi.
          </Text>

          <Text style={styles.sectionTitle}>2. Giấy phép sử dụng</Text>
          <Text style={styles.paragraph}>
            Chúng tôi cấp cho bạn giấy phép hạn chế, không độc quyền, không thể chuyển nhượng và có thể thu hồi để sử dụng ứng dụng GIS_BUSINESS cho mục đích cá nhân, phi thương mại.
          </Text>

          <Text style={styles.sectionTitle}>3. Tài khoản người dùng</Text>
          <Text style={styles.paragraph}>
            Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của bạn.
          </Text>

          <Text style={styles.sectionTitle}>4. Nội dung người dùng</Text>
          <Text style={styles.paragraph}>
            Bạn giữ mọi quyền đối với nội dung bạn đăng lên ứng dụng. Bằng cách đăng nội dung, bạn cấp cho chúng tôi quyền sử dụng, lưu trữ và hiển thị nội dung đó trong ứng dụng.
          </Text>

          <Text style={styles.sectionTitle}>5. Hạn chế sử dụng</Text>
          <Text style={styles.paragraph}>
            Bạn không được phép:
          </Text>
          <Text style={styles.bulletPoint}>• Sử dụng ứng dụng cho bất kỳ mục đích bất hợp pháp nào</Text>
          <Text style={styles.bulletPoint}>• Vi phạm bất kỳ luật pháp địa phương, quốc gia hoặc quốc tế nào</Text>
          <Text style={styles.bulletPoint}>• Xâm phạm quyền sở hữu trí tuệ của chúng tôi hoặc của bên thứ ba</Text>
          <Text style={styles.bulletPoint}>• Phá hoại hoặc làm gián đoạn hoạt động của ứng dụng</Text>

          <Text style={styles.sectionTitle}>6. Sở hữu trí tuệ</Text>
          <Text style={styles.paragraph}>
            Ứng dụng và nội dung của nó, bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, biểu tượng, hình ảnh, phần mềm và thiết kế, được bảo vệ bởi luật bản quyền và các quyền sở hữu trí tuệ khác.
          </Text>

          <Text style={styles.sectionTitle}>7. Giới hạn trách nhiệm</Text>
          <Text style={styles.paragraph}>
            Ứng dụng được cung cấp "nguyên trạng" và "có sẵn". Chúng tôi không đảm bảo rằng ứng dụng sẽ không bị gián đoạn hoặc không có lỗi.
          </Text>

          <Text style={styles.sectionTitle}>8. Thay đổi điều khoản</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có quyền sửa đổi các điều khoản này vào bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng các điều khoản mới trên ứng dụng.
          </Text>

          <Text style={styles.sectionTitle}>9. Liên hệ</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua email: info@msf.vn
          </Text>
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
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 15,
  },
});

export default TermOfUseScreen; 