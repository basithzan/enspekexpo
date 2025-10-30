import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import CountryCodePicker from '../src/components/CountryCodePicker';
import { WhatsAppOTPService } from '../src/services/whatsappOTPService';
import OTPInput from '../src/components/OTPInput';
import LoadingButton from '../src/components/LoadingButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [useMobile, setUseMobile] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<{id: number, name: string, code: string, phone_code: string} | null>(null);
  
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { login, refreshUser } = useAuth();

  const handleLogin = async () => {
    if (useMobile) {
      if (!phone.trim()) {
        Alert.alert('Error', 'Please enter your mobile number');
        return;
      }
      
      if (!otpSent) {
        await handleSendOTP();
      } else {
        await handleVerifyOTP();
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      if (!type) {
        Alert.alert('Error', 'Invalid user type');
        return;
      }

      setIsLoading(true);
      try {
        await login(email.trim(), password, type as 'client' | 'inspector');
        // Navigation will be handled by AuthContext
      } catch (error: any) {
        Alert.alert('Login Failed', error.message || 'Please check your credentials');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!selectedCountry) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.phone_code}${phone.trim()}`;
    const countryCodeAlpha = selectedCountry.code; // e.g., "IN", "US"

    setIsLoading(true);
    
    try {
      console.log('Sending OTP to:', fullPhoneNumber, 'Type:', type);
      
      // Use the WhatsApp OTP service
      const response = await WhatsAppOTPService.sendOTP(fullPhoneNumber, countryCodeAlpha);
      
      if (response.success) {
        setOtpSent(true);
        console.log('OTP sent successfully:', response.message);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('OTP Error:', error);
      
      // Show error message
      Alert.alert(
        'Error', 
        `Failed to send OTP: ${error.message}`,
        [
          { text: 'Try Again', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!selectedCountry) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.phone_code}${phone.trim()}`;
    const countryCodeAlpha = selectedCountry.code;

    setIsLoading(true);
    
    
    try {
      // Use the WhatsApp OTP service for verification
      const response = await WhatsAppOTPService.verifyOTP(fullPhoneNumber, otp.trim(), countryCodeAlpha);
      
      if (response.success) {
        
        // Handle different user roles from API response
        if (response.role === 'inspector' || response.role === 'client') {
          // User exists, login with returned user data
          if (response.userData && response.userData.user) {
            const userData = response.userData.user;
            // Store authentication data
            await AsyncStorage.setItem('auth_token', userData.auth_token);
            await AsyncStorage.setItem('user_data', JSON.stringify({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              type: response.role,
              auth_token: userData.auth_token,
              company_name: userData.company_name,
              phone: userData.phone,
              country_id: userData.country_id,
            }));
            
            // Refresh the auth context to update the user state
            await refreshUser();
            
            // Navigate to appropriate dashboard
            if (response.role === 'client') {
              router.replace('/(tabs)/client');
            } else {
              router.replace('/(tabs)/inspector');
            }
          } else {
            Alert.alert('Error', 'User data not found in response.');
          }
        } else if (response.role === 'new_user') {
          // New user, redirect to registration
          Alert.alert('New User', 'Please complete your registration first.');
          router.replace('/register');
        } else {
          Alert.alert('Error', `Unknown user role: ${response.role}`);
        }
      } else {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
      }
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileLogin = () => {
    setUseMobile(true);
    setOtpSent(false);
    setOtp('');
    setPhone('');
    setSelectedCountry(null);
  };

  const handleEmailLogin = () => {
    setUseMobile(false);
    setOtpSent(false);
    setOtp('');
    setPhone('');
    setSelectedCountry(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            {type === 'client' ? 'Client Login' : 'Inspector Login'}
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <Pressable 
            style={[styles.toggleButton, !useMobile && styles.toggleButtonActive]}
            onPress={handleEmailLogin}
          >
            <Text style={[styles.toggleText, !useMobile && styles.toggleTextActive]}>
              Email Login
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.toggleButton, useMobile && styles.toggleButtonActive]}
            onPress={handleMobileLogin}
          >
            <Text style={[styles.toggleText, useMobile && styles.toggleTextActive]}>
              Mobile Login
            </Text>
          </Pressable>
        </View>

        {useMobile ? (
          <>
            <View style={styles.phoneContainer}>
              <CountryCodePicker
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {otpSent && (
              <>
                <Text style={styles.otpLabel}>Enter OTP</Text>
                <OTPInput
                  length={5}
                  onComplete={(enteredOtp) => setOtp(enteredOtp)}
                  onChange={(value) => setOtp(value)}
                />
                
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive OTP? </Text>
                  <Pressable 
                    onPress={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                  >
                    <Text style={styles.resendLink}>Resend</Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </>
        )}

        <LoadingButton
          title={useMobile ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Login'}
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {type === 'client' ? "Don't have an account? " : "Need help? "}
          </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>
              {type === 'client' ? 'Sign Up' : 'Contact Support'}
            </Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
