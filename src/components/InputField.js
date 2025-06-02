import React, {memo} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';

const InputField = memo(function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  fieldButtonIcon,
  value,
  onChangeText,
  editable = true,
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
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0}}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          underlineColorAndroid="transparent"
          autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
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
});

export default InputField;
