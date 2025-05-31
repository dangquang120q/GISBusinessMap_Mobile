import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function MultiSelectDropdown({ options = [], selectedValues, onChange, placeholder = 'Chọn loại phản hồi' }) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedValue = selectedValues && selectedValues.length > 0 ? selectedValues[0] : null;

  const handleSelect = (value) => {
    onChange([value]);
    setModalVisible(false);
  };

  const getSelectedLabel = () => {
    if (!selectedValue) return placeholder;
    const selectedOption = options.find(opt => opt.value === selectedValue);
    return selectedOption ? selectedOption.label : placeholder;
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
          {getSelectedLabel()}
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
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' }}
                onPress={() => option.disabled ? null : handleSelect(option.value)}
                disabled={option.disabled}
              >
                <Text style={{ flex: 1, color: option.disabled ? '#ccc' : '#000' }}>{option.label}</Text>
                {selectedValue === option.value && (
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