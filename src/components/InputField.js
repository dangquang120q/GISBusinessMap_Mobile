import React from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  fieldButtonIcon,
  value,
  onChangeText,
  editable,
  showPassword,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
      }}>
      {icon}
      {inputType == 'password' ? (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0}}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0}}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      )}
      {fieldButtonIcon ? (
        fieldButtonIcon
      ) : fieldButtonLabel ? (
        <TouchableOpacity onPress={fieldButtonFunction}>
          <Text style={{color: '#085924', fontWeight: '700'}}>{fieldButtonLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
