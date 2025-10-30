// components/OTPInput.js
import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const OTPInput = ({ length = 5, onComplete, onChange }) => {
  const [otp, setOtp] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    const newOtp = otp.split('');
    newOtp[index] = value;
    const updatedOtp = newOtp.join('');
    setOtp(updatedOtp);
    
    onChange?.(updatedOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updatedOtp.length === length) {
      onComplete?.(updatedOtp);
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            otp[index] ? styles.inputFilled : styles.inputEmpty,
          ]}
          value={otp[index] || ''}
          onChangeText={(value) => handleChange(value, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputEmpty: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  inputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
});

export default OTPInput;
