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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import CountryCodePicker from '../src/components/CountryCodePicker';
import { WhatsAppOTPService } from '../src/services/whatsappOTPService';
import OTPInput from '../src/components/OTPInput';
import LoadingButton from '../src/components/LoadingButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../src/api/client';
import { HapticPressable } from '../src/components/HapticPressable';
import { HapticType, hapticSuccess, hapticError } from '../src/utils/haptics';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { login, refreshUser } = useAuth();

  const handleLogin = async () => {
    if (useMobile) {
      if (!phone.trim()) {
        hapticError();
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
        hapticError();
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      if (!type) {
        hapticError();
        Alert.alert('Error', 'Invalid user type');
        return;
      }

      setIsLoading(true);
      try {
        await login(email.trim(), password, type as 'client' | 'inspector');
        hapticSuccess();
      } catch (error: any) {
        hapticError();
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
    const countryName = selectedCountry.name; // Use country name instead of ISO code

    setIsLoading(true);
    
    try {
      const response = await WhatsAppOTPService.sendOTP(fullPhoneNumber, countryName);
      
      if (response.success) {
        setOtpSent(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to send OTP: ${error.message}`, [{ text: 'Try Again', style: 'cancel' }]);
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
    const countryName = selectedCountry.name; // Use country name instead of ISO code

    setIsLoading(true);
    
    try {
      const response = await WhatsAppOTPService.verifyOTP(fullPhoneNumber, otp.trim(), countryName);
      
      if (response.success) {
        hapticSuccess();
        if (response.role === 'inspector' || response.role === 'client') {
          if (response.userData && response.userData.user) {
            const userData = response.userData.user;
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
            
            await refreshUser();
            
            if (response.role === 'client') {
              router.replace('/(tabs)/client');
            } else {
              router.replace('/(tabs)/inspector');
            }
          } else {
            Alert.alert('Error', 'User data not found in response.');
          }
        } else if (response.role === 'new_user') {
          Alert.alert('New User', 'Please complete your registration first.');
          router.replace('/register');
        } else {
          hapticError();
          Alert.alert('Error', `Unknown user role: ${response.role}`);
        }
      } else {
        hapticError();
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
      }
    } catch (error: any) {
      hapticError();
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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      // Try multiple common endpoints
      const endpoints = [
        '/forgot-password',
        '/password/email',
        '/password/reset',
        '/reset-password',
        '/password-reset',
        type === 'client' ? '/client-forgot-password' : '/inspector-forgot-password',
        type === 'client' ? '/client-password-reset' : '/inspector-password-reset',
      ];

      let success = false;
      let lastError: any = null;

      // Try each endpoint
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.post(endpoint, {
            email: forgotPasswordEmail.trim(),
            ...(type && { type: type })
          });

          if (response.data.success || response.data.message) {
            success = true;
            Alert.alert(
              'Success',
              response.data.message || 'Password reset instructions have been sent to your email address.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }
                }
              ]
            );
            break;
          }
        } catch (error: any) {
          lastError = error;
          // Continue to next endpoint if 404 or 405 (method not allowed)
          if (error.response?.status === 404 || error.response?.status === 405) {
            continue;
          }
          // If we get a 422 (validation error) or 400 (bad request), the endpoint exists but validation failed
          if (error.response?.status === 422 || error.response?.status === 400) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Invalid email address or user not found.';
            Alert.alert('Error', errorMsg);
            break;
          }
          // If we get 200 but no success, still treat as error
          if (error.response?.status === 200 && !error.response?.data?.success) {
            continue;
          }
          // For other errors, show the message
          const errorMsg = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
          Alert.alert('Error', errorMsg);
          break;
        }
      }

      // If all endpoints failed with 404/405, show helpful message
      if (!success && lastError && (lastError.response?.status === 404 || lastError.response?.status === 405)) {
        Alert.alert(
          'Password Reset',
          'Password reset functionality is not available yet. Please contact support for assistance with your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'An error occurred. Please try again later.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>

        
        <Pressable style={styles.backButton} onPress={() => router.replace('/role-selection')}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {type === 'client' ? 'Sign in to your client account' : 'Sign in to your inspector account'}
            </Text>
          </View>

          {/* Login Method Toggle */}
          <View style={styles.toggleWrapper}>
            <Pressable 
              style={({ pressed }) => [
                styles.toggleOption,
                !useMobile && styles.toggleOptionActive,
                pressed && styles.toggleOptionPressed
              ]}
              onPress={handleEmailLogin}
            >
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={!useMobile ? '#FFFFFF' : '#6B7280'} 
                style={styles.toggleIcon}
              />
              <Text style={[
                styles.toggleOptionText,
                !useMobile && styles.toggleOptionTextActive
              ]}>
                Email
              </Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.toggleOption,
                useMobile && styles.toggleOptionActive,
                pressed && styles.toggleOptionPressed
              ]}
              onPress={handleMobileLogin}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={20} 
                color={useMobile ? '#FFFFFF' : '#6B7280'} 
                style={styles.toggleIcon}
              />
              <Text style={[
                styles.toggleOptionText,
                useMobile && styles.toggleOptionTextActive
              ]}>
                Mobile
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {useMobile ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCodeContainer}>
                      <CountryCodePicker
                        selectedCountry={selectedCountry}
                        onCountrySelect={setSelectedCountry}
                      />
                    </View>
                    <View style={styles.phoneInputWrapper}>
                      <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.phoneIcon} />
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
                  </View>
                </View>
                
                {otpSent && (
                  <View style={styles.otpSection}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <Text style={styles.otpHint}>
                      Enter the 5-digit code sent to your WhatsApp
                    </Text>
                    <OTPInput
                      length={5}
                      onComplete={(enteredOtp: string) => setOtp(enteredOtp)}
                      onChange={(value: string) => setOtp(value)}
                    />
                    
                    <Pressable 
                      style={styles.resendButton}
                      onPress={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                    >
                      <Text style={styles.resendButtonText}>Resend Code</Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
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
                      <Ionicons 
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </Pressable>
                  </View>
                  {type !== 'inspector' && (
                    <HapticPressable 
                      style={styles.forgotPasswordButton}
                      onPress={() => setShowForgotPassword(true)}
                      hapticType={HapticType.Light}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </HapticPressable>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Submit Button */}
          <HapticPressable
            style={({ pressed }: any) => [
              styles.submitButton,
              (isLoading || (useMobile && otpSent && !otp.trim())) && styles.submitButtonDisabled,
              pressed && !isLoading && styles.submitButtonPressed
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            hapticType={HapticType.Medium}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {useMobile ? (otpSent ? 'Verify & Continue' : 'Send Code') : 'Sign In'}
              </Text>
            )}
          </HapticPressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {type === 'client' ? "Don't have an account? " : "Need help? "}
            </Text>
            <HapticPressable onPress={() => router.push(`/register?type=${type || 'client'}`)} hapticType={HapticType.Light}>
              <Text style={styles.footerLink}>
                {type === 'client' ? 'Sign Up' : 'Contact Support'}
              </Text>
            </HapticPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Pressable
                  onPress={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <Text style={styles.modalDescription}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Email Address</Text>
                <View style={styles.modalInputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.modalInputIcon} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.modalSubmitButton,
                  forgotPasswordLoading && styles.modalSubmitButtonDisabled,
                  pressed && !forgotPasswordLoading && styles.modalSubmitButtonPressed
                ]}
                onPress={handleForgotPassword}
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Send Reset Link</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '400',
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleOptionPressed: {
    opacity: 0.8,
  },
  toggleIcon: {
    marginRight: 0,
  },
  toggleOptionText: {
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleOptionTextActive: {
    color: '#FFFFFF',
  },
  formSection: {
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#111827',
    fontWeight: '400',
    padding: 0,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCodeContainer: {
    // No styling needed - CountryCodePicker has its own button styling
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  phoneIcon: {
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#111827',
    fontWeight: '400',
    padding: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#3B82F6',
    fontWeight: '600',
  },
  otpSection: {
    marginTop: 8,
  },
  otpHint: {
    fontSize: 13,
fontFamily: 'Montserrat',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendButtonText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#3B82F6',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 15,
fontFamily: 'Montserrat',
    color: '#6B7280',
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 15,
fontFamily: 'Montserrat',
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalInputGroup: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#111827',
    fontWeight: '400',
    padding: 0,
  },
  modalSubmitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalSubmitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat',
    color: '#6B7280',
    fontWeight: '600',
  },
});
