# React Native Expo WhatsApp OTP Implementation Guide

## Overview
This documentation provides a complete guide for implementing WhatsApp OTP authentication in React Native Expo applications for both Inspector and Client login screens.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [API Integration](#api-integration)
4. [UI Components](#ui-components)
5. [Inspector Login Screen](#inspector-login-screen)
6. [Client Login Screen](#client-login-screen)
7. [OTP Verification Flow](#otp-verification-flow)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Best Practices](#best-practices)

---

## Prerequisites

### Required Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install react-native-country-picker-modal
npm install react-native-otp-inputs
npm install @react-native-async-storage/async-storage
```

### Expo CLI Setup
```bash
npm install -g @expo/cli
expo install expo-linking expo-constants
```

---

## Project Setup

### 1. Initialize Expo Project
```bash
npx create-expo-app InspectorClientApp
cd InspectorClientApp
```

### 2. Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install react-native-country-picker-modal
npm install react-native-otp-inputs
npm install @react-native-async-storage/async-storage
```

### 3. Configure Navigation
```javascript
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import InspectorLoginScreen from './screens/InspectorLoginScreen';
import ClientLoginScreen from './screens/ClientLoginScreen';
import OTPScreen from './screens/OTPScreen';
import InspectorDashboard from './screens/InspectorDashboard';
import ClientDashboard from './screens/ClientDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InspectorLogin">
        <Stack.Screen name="InspectorLogin" component={InspectorLoginScreen} />
        <Stack.Screen name="ClientLogin" component={ClientLoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="InspectorDashboard" component={InspectorDashboard} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## API Integration

### 1. API Configuration
```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://erpbeta.enspek.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
```

### 2. WhatsApp OTP Service
```javascript
// services/whatsappOTPService.js
import api from './api';

export const WhatsAppOTPService = {
  // Send OTP to phone number
  sendOTP: async (phoneNumber, countryCode) => {
    try {
      const response = await api.post('/send-otp', {
        phone_number: phoneNumber,
        code: countryCode,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp, countryCode) => {
    try {
      const response = await api.post('/verify-otp', {
        phone_number: phoneNumber,
        otp: otp,
        code: countryCode,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // Register user with OTP
  registerWithOTP: async (userData) => {
    try {
      const response = await api.post('/register-user-otp', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register user');
    }
  },
};
```

---

## UI Components

### 1. Country Code Picker Component
```javascript
// components/CountryCodePicker.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

const CountryCodePicker = ({ onSelect, selectedCountry }) => {
  const [isVisible, setIsVisible] = useState(false);

  const onSelectCountry = (country) => {
    onSelect(country);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.countryCode}>
          {selectedCountry?.callingCode ? `+${selectedCountry.callingCode}` : '+1'}
        </Text>
        <Text style={styles.flag}>{selectedCountry?.flag || '🇺🇸'}</Text>
      </TouchableOpacity>

      <CountryPicker
        visible={isVisible}
        onSelect={onSelectCountry}
        onClose={() => setIsVisible(false)}
        withFilter
        withFlag
        withCallingCode
        withEmoji
        theme={{
          onBackgroundTextColor: '#000',
          backgroundColor: '#fff',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  flag: {
    fontSize: 20,
  },
});

export default CountryCodePicker;
```

### 2. OTP Input Component
```javascript
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
```

### 3. Loading Button Component
```javascript
// components/LoadingButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  style,
  textStyle 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoadingButton;
```

---

## Inspector Login Screen

```javascript
// screens/InspectorLoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CountryCodePicker from '../components/CountryCodePicker';
import LoadingButton from '../components/LoadingButton';
import { WhatsAppOTPService } from '../services/whatsappOTPService';

const InspectorLoginScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    callingCode: '1',
    flag: '🇺🇸',
    cca2: 'US',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await WhatsAppOTPService.sendOTP(
        phoneNumber,
        selectedCountry.cca2
      );

      if (response.success) {
        navigation.navigate('OTP', {
          phoneNumber,
          countryCode: selectedCountry.cca2,
          userType: 'inspector',
        });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Inspector Login</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to receive OTP via WhatsApp
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <CountryCodePicker
                onSelect={handleCountrySelect}
                selectedCountry={selectedCountry}
              />
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <LoadingButton
            title="Send OTP via WhatsApp"
            onPress={handleSendOTP}
            loading={loading}
            disabled={!phoneNumber.trim()}
            style={styles.sendButton}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Are you a client? </Text>
            <Text
              style={styles.switchLink}
              onPress={() => navigation.navigate('ClientLogin')}
            >
              Login as Client
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  justifyContent: 'center',
  padding: 20,
  paddingTop: 50,
  paddingBottom: 50,
  maxHeight: '100%',
  overflow: 'hidden',
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: 'auto',
  minHeight: 0,
  minWidth: 0,
  alignSelf: 'stretch',
  flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    alignContent: 'stretch',
    position: 'relative',
    zIndex: 0,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  sendButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 16,
    color: '#666',
  },
  switchLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default InspectorLoginScreen;
```

---

## Client Login Screen

```javascript
// screens/ClientLoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CountryCodePicker from '../components/CountryCodePicker';
import LoadingButton from '../components/LoadingButton';
import { WhatsAppOTPService } from '../services/whatsappOTPService';

const ClientLoginScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    callingCode: '1',
    flag: '🇺🇸',
    cca2: 'US',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await WhatsAppOTPService.sendOTP(
        phoneNumber,
        selectedCountry.cca2
      );

      if (response.success) {
        navigation.navigate('OTP', {
          phoneNumber,
          countryCode: selectedCountry.cca2,
          userType: 'client',
        });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Client Login</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to receive OTP via WhatsApp
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <CountryCodePicker
                onSelect={handleCountrySelect}
                selectedCountry={selectedCountry}
              />
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <LoadingButton
            title="Send OTP via WhatsApp"
            onPress={handleSendOTP}
            loading={loading}
            disabled={!phoneNumber.trim()}
            style={styles.sendButton}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Are you an inspector? </Text>
            <Text
              style={styles.switchLink}
              onPress={() => navigation.navigate('InspectorLogin')}
            >
              Login as Inspector
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  sendButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 16,
    color: '#666',
  },
  switchLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ClientLoginScreen;
```

---

## OTP Verification Flow

```javascript
// screens/OTPScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import OTPInput from '../components/OTPInput';
import LoadingButton from '../components/LoadingButton';
import { WhatsAppOTPService } from '../services/whatsappOTPService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber, countryCode, userType } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    startResendTimer();
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOTPComplete = async (enteredOTP) => {
    setOtp(enteredOTP);
    setError('');

    if (enteredOTP.length === 5) {
      setLoading(true);

      try {
        const response = await WhatsAppOTPService.verifyOTP(
          phoneNumber,
          enteredOTP,
          countryCode
        );

        if (response.success) {
          // Store user data and token
          await AsyncStorage.setItem('userToken', response.userData?.user?.auth_token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.userData?.user));
          await AsyncStorage.setItem('userType', response.role);

          // Navigate based on user role
          if (response.role === 'inspector') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'InspectorDashboard' }],
            });
          } else if (response.role === 'client') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ClientDashboard' }],
            });
          } else if (response.role === 'new_user') {
            // Navigate to registration screen
            navigation.navigate('Registration', {
              phoneNumber,
              countryCode,
              userType,
            });
          }
        } else {
          setError(response.message || 'Invalid OTP');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await WhatsAppOTPService.sendOTP(phoneNumber, countryCode);

      if (response.success) {
        Alert.alert('Success', 'OTP sent successfully');
        startResendTimer();
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeOTP = (value) => {
    setOtp(value);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 5-digit OTP sent to your WhatsApp
        </Text>
        <Text style={styles.phoneText}>
          {countryCode} {phoneNumber}
        </Text>

        <OTPInput
          length={5}
          onComplete={handleOTPComplete}
          onChange={handleChangeOTP}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <LoadingButton
          title="Verify OTP"
          onPress={() => handleOTPComplete(otp)}
          loading={loading}
          disabled={otp.length !== 5}
          style={styles.verifyButton}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendTimer > 0 || resendLoading}
          >
            <Text style={[
              styles.resendLink,
              (resendTimer > 0 || resendLoading) && styles.resendDisabled
            ]}>
              {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Change Phone Number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    color: '#007AFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#666',
  },
  resendLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#ccc',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OTPScreen;
```

---

## Error Handling

### 1. Network Error Handler
```javascript
// utils/errorHandler.js
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Service not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.message || 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection.';
  } else {
    // Other error
    return 'An unexpected error occurred. Please try again.';
  }
};
```

### 2. Validation Helper
```javascript
// utils/validation.js
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber.trim()) {
    return 'Phone number is required';
  }

  if (phoneNumber.length < 8) {
    return 'Phone number is too short';
  }

  if (phoneNumber.length > 15) {
    return 'Phone number is too long';
  }

  // Basic phone number validation
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'Invalid phone number format';
  }

  return null;
};

export const validateOTP = (otp) => {
  if (!otp.trim()) {
    return 'OTP is required';
  }

  if (otp.length !== 5) {
    return 'OTP must be 5 digits';
  }

  const otpRegex = /^[0-9]{5}$/;
  if (!otpRegex.test(otp)) {
    return 'OTP must contain only numbers';
  }

  return null;
};
```

---

## Testing

### 1. Unit Tests
```javascript
// __tests__/whatsappOTPService.test.js
import { WhatsAppOTPService } from '../services/whatsappOTPService';

// Mock axios
jest.mock('axios');
import axios from 'axios';

describe('WhatsAppOTPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendOTP should send OTP successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'OTP sent successfully',
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    const result = await WhatsAppOTPService.sendOTP('1234567890', 'US');

    expect(result.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('/send-otp', {
      phone_number: '1234567890',
      code: 'US',
    });
  });

  test('verifyOTP should verify OTP successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'OTP verified successfully',
        role: 'inspector',
        userData: {
          user: {
            id: 1,
            auth_token: 'token123',
            name: 'John Doe',
          },
        },
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    const result = await WhatsAppOTPService.verifyOTP('1234567890', '12345', 'US');

    expect(result.success).toBe(true);
    expect(result.role).toBe('inspector');
  });
});
```

### 2. Integration Tests
```javascript
// __tests__/integration/otpFlow.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InspectorLoginScreen from '../../screens/InspectorLoginScreen';

describe('OTP Flow Integration', () => {
  test('should complete OTP flow successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<InspectorLoginScreen />);
    
    const phoneInput = getByPlaceholderText('Enter phone number');
    const sendButton = getByText('Send OTP via WhatsApp');

    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('Verify OTP')).toBeTruthy();
    });
  });
});
```

---

## Best Practices

### 1. Security
- Store JWT tokens securely using AsyncStorage
- Implement token refresh mechanism
- Validate all inputs on both client and server
- Use HTTPS for all API calls

### 2. User Experience
- Show loading states during API calls
- Provide clear error messages
- Implement resend OTP functionality with timer
- Auto-focus next OTP input field

### 3. Performance
- Debounce API calls to prevent spam
- Cache country data
- Optimize re-renders with React.memo
- Use lazy loading for screens

### 4. Accessibility
- Add proper labels for screen readers
- Ensure sufficient color contrast
- Support keyboard navigation
- Provide alternative text for images

---

## Deployment

### 1. Environment Configuration
```javascript
// config/environment.js
const config = {
  development: {
    API_BASE_URL: 'https://erpbeta.enspek.com/api',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://erpbeta.enspek.com/api',
    DEBUG: false,
  },
};

export default config[process.env.NODE_ENV || 'development'];
```

### 2. Build Configuration
```json
// app.json
{
  "expo": {
    "name": "Inspector Client App",
    "slug": "inspector-client-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

This comprehensive documentation provides everything needed to implement WhatsApp OTP authentication in React Native Expo applications for both Inspector and Client login screens.
