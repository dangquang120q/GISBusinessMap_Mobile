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

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.headerTitle}>Chính sách quyền riêng tư</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Cập nhật lần cuối: 21/05/2025</Text>
          
          <Text style={styles.paragraph}>
            Chính sách quyền riêng tư này mô tả các chính sách và quy trình của chúng tôi về việc thu thập, sử dụng và tiết lộ thông tin của bạn khi bạn sử dụng Dịch vụ và cho bạn biết về quyền riêng tư của bạn và cách pháp luật bảo vệ bạn.
          </Text>

          <Text style={styles.paragraph}>
            Chúng tôi sử dụng Dữ liệu cá nhân của bạn để cung cấp và cải thiện Dịch vụ. Bằng cách sử dụng Dịch vụ, bạn đồng ý với việc thu thập và sử dụng thông tin theo Chính sách quyền riêng tư này.
          </Text>

          <Text style={styles.sectionTitle}>Giải thích và Định nghĩa</Text>
          
          <Text style={styles.subTitle}>Giải thích</Text>
          <Text style={styles.paragraph}>
            Các từ có chữ cái đầu viết hoa có ý nghĩa được định nghĩa theo các điều kiện sau. Các định nghĩa sau đây sẽ có cùng ý nghĩa bất kể chúng xuất hiện ở số ít hay số nhiều.
          </Text>

          <Text style={styles.subTitle}>Định nghĩa</Text>
          <Text style={styles.paragraph}>
            Để phục vụ cho Chính sách quyền riêng tư này:
          </Text>

          <Text style={styles.bulletPoint}>• Tài khoản nghĩa là tài khoản duy nhất được tạo cho bạn để truy cập Dịch vụ của chúng tôi hoặc các phần của Dịch vụ của chúng tôi.</Text>
          
          <Text style={styles.bulletPoint}>• Công ty (được gọi là "Công ty", "Chúng tôi", "Chúng tôi" hoặc "Của chúng tôi" trong Thỏa thuận này) đề cập đến CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ GIẢI PHÁP TƯƠNG LAI, Số 37, ngách 99/110/79, phố Định Công Hạ, Phường Định Công, Quận Hoàng Mai, Thành phố Hà Nội, Việt Nam.</Text>
          
          <Text style={styles.bulletPoint}>• Quốc gia đề cập đến: Việt Nam</Text>
          
          <Text style={styles.bulletPoint}>• Thiết bị nghĩa là bất kỳ thiết bị nào có thể truy cập Dịch vụ như máy tính, điện thoại di động hoặc máy tính bảng kỹ thuật số.</Text>
          
          <Text style={styles.bulletPoint}>• Dữ liệu cá nhân là bất kỳ thông tin nào liên quan đến một cá nhân được xác định hoặc có thể xác định được.</Text>
          
          <Text style={styles.bulletPoint}>• Dịch vụ đề cập đến Ứng dụng.</Text>
          
          <Text style={styles.bulletPoint}>• Nhà cung cấp dịch vụ nghĩa là bất kỳ cá nhân hoặc pháp nhân nào xử lý dữ liệu thay mặt cho Công ty.</Text>
          
          <Text style={styles.bulletPoint}>• Dữ liệu sử dụng đề cập đến dữ liệu được thu thập tự động, được tạo ra bởi việc sử dụng Dịch vụ hoặc từ cơ sở hạ tầng Dịch vụ.</Text>
          
          <Text style={styles.bulletPoint}>• Bạn nghĩa là cá nhân đang truy cập hoặc sử dụng Dịch vụ, hoặc công ty, hoặc pháp nhân khác đang truy cập hoặc sử dụng Dịch vụ thay mặt cho cá nhân đó.</Text>

          <Text style={styles.sectionTitle}>Thu thập và Sử dụng Dữ liệu Cá nhân của Bạn</Text>
          
          <Text style={styles.subTitle}>Các loại dữ liệu được thu thập</Text>
          
          <Text style={styles.subTitle}>Dữ liệu cá nhân</Text>
          <Text style={styles.paragraph}>
            Trong khi sử dụng Dịch vụ của chúng tôi, chúng tôi có thể yêu cầu bạn cung cấp cho chúng tôi một số thông tin nhận dạng cá nhân có thể được sử dụng để liên hệ hoặc xác định bạn. Thông tin nhận dạng cá nhân có thể bao gồm, nhưng không giới hạn ở:
          </Text>
          
          <Text style={styles.bulletPoint}>• Địa chỉ email</Text>
          <Text style={styles.bulletPoint}>• Tên và họ</Text>
          <Text style={styles.bulletPoint}>• Số điện thoại</Text>
          <Text style={styles.bulletPoint}>• Dữ liệu sử dụng</Text>

          <Text style={styles.subTitle}>Dữ liệu sử dụng</Text>
          <Text style={styles.paragraph}>
            Dữ liệu sử dụng được thu thập tự động khi sử dụng Dịch vụ.
          </Text>
          <Text style={styles.paragraph}>
            Dữ liệu sử dụng có thể bao gồm thông tin như địa chỉ Giao thức Internet của thiết bị của bạn (ví dụ: địa chỉ IP), loại trình duyệt, phiên bản trình duyệt, các trang của Dịch vụ của chúng tôi mà bạn truy cập, thời gian và ngày truy cập của bạn, thời gian dành cho các trang đó, định danh thiết bị duy nhất và dữ liệu chẩn đoán khác.
          </Text>

          <Text style={styles.sectionTitle}>Sử dụng Dữ liệu Cá nhân của Bạn</Text>
          <Text style={styles.paragraph}>
            Công ty có thể sử dụng Dữ liệu cá nhân cho các mục đích sau:
          </Text>
          
          <Text style={styles.bulletPoint}>• Để cung cấp và duy trì Dịch vụ của chúng tôi, bao gồm việc giám sát việc sử dụng Dịch vụ của chúng tôi.</Text>
          <Text style={styles.bulletPoint}>• Để quản lý Tài khoản của bạn: để quản lý đăng ký của bạn với tư cách là người dùng của Dịch vụ.</Text>
          <Text style={styles.bulletPoint}>• Để liên hệ với bạn: Để liên hệ với bạn qua email, cuộc gọi điện thoại, SMS hoặc các hình thức liên lạc điện tử tương đương khác.</Text>
          <Text style={styles.bulletPoint}>• Để cung cấp cho bạn tin tức, ưu đãi đặc biệt và thông tin chung về các hàng hóa, dịch vụ và sự kiện khác mà chúng tôi cung cấp.</Text>
          <Text style={styles.bulletPoint}>• Để quản lý yêu cầu của bạn: Để tham dự và quản lý yêu cầu của bạn đối với chúng tôi.</Text>

          <Text style={styles.sectionTitle}>Bảo mật Dữ liệu Cá nhân của Bạn</Text>
          <Text style={styles.paragraph}>
            Bảo mật Dữ liệu cá nhân của bạn rất quan trọng đối với chúng tôi, nhưng hãy nhớ rằng không có phương thức truyền tải qua Internet hoặc phương thức lưu trữ điện tử nào an toàn 100%. Mặc dù chúng tôi cố gắng sử dụng các phương tiện được chấp nhận về mặt thương mại để bảo vệ Dữ liệu cá nhân của bạn, chúng tôi không thể đảm bảo tính bảo mật tuyệt đối của nó.
          </Text>

          <Text style={styles.sectionTitle}>Quyền riêng tư của Trẻ em</Text>
          <Text style={styles.paragraph}>
            Dịch vụ của chúng tôi không nhắm đến bất kỳ ai dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin nhận dạng cá nhân từ bất kỳ ai dưới 13 tuổi. Nếu bạn là cha mẹ hoặc người giám hộ và bạn biết rằng con bạn đã cung cấp cho chúng tôi Dữ liệu cá nhân, vui lòng liên hệ với chúng tôi.
          </Text>

          <Text style={styles.sectionTitle}>Liên kết đến các trang web khác</Text>
          <Text style={styles.paragraph}>
            Dịch vụ của chúng tôi có thể chứa các liên kết đến các trang web khác không được vận hành bởi chúng tôi. Nếu bạn nhấp vào liên kết của bên thứ ba, bạn sẽ được chuyển hướng đến trang web của bên thứ ba đó. Chúng tôi khuyên bạn nên xem xét Chính sách quyền riêng tư của mọi trang web bạn truy cập.
          </Text>

          <Text style={styles.sectionTitle}>Thay đổi Chính sách quyền riêng tư này</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể cập nhật Chính sách quyền riêng tư của chúng tôi theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng Chính sách quyền riêng tư mới trên trang này.
          </Text>

          <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có bất kỳ câu hỏi nào về Chính sách quyền riêng tư này, bạn có thể liên hệ với chúng tôi:
          </Text>
          <Text style={styles.paragraph}>
            Qua email: info@msf.vn
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
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 15,
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

export default PrivacyPolicyScreen; 