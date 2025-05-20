import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const REPORT_TYPE_OPTIONS = [
  { label: 'Vi phạm pháp luật', value: 'vi_pham_phap_luat' },
  { label: 'Phản ánh dịch vụ', value: 'phan_anh_dich_vu' },
  { label: 'Vệ sinh an toàn thực phẩm', value: 've_sinh_attp' },
  { label: 'Khác', value: 'khac' },
];

export function MultiSelectDropdown({ selectedValues, onChange }) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 6,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ flex: 1 }}>
          {selectedValues.length > 0
            ? REPORT_TYPE_OPTIONS.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label).join(', ')
            : 'Chọn loại phản ánh'}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color="#888" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setModalVisible(false)}>
          <View style={{ marginHorizontal: 40, backgroundColor: '#fff', borderRadius: 8, padding: 10, elevation: 5 }}>
            {REPORT_TYPE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' }}
                onPress={() => toggleValue(option.value)}
              >
                <Text style={{ flex: 1 }}>{option.label}</Text>
                {selectedValues.includes(option.value) && (
                  <Text style={{ color: 'green', fontWeight: 'bold' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
} 