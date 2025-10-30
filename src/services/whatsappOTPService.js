// services/whatsappOTPService.js
import { apiClient } from '../api/client';

export const WhatsAppOTPService = {
  // Send OTP to phone number
  sendOTP: async (phoneNumber, countryCode) => {
    try {
      console.log('WhatsAppOTPService: Sending OTP to', phoneNumber, 'Country:', countryCode);
      
      const response = await apiClient.post('/send-otp', {
        phone_number: phoneNumber,
        code: countryCode,
      });
      
      console.log('WhatsAppOTPService: Send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('WhatsAppOTPService: Send OTP error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp, countryCode) => {
    try {
      console.log('WhatsAppOTPService: Verifying OTP for', phoneNumber, 'OTP:', otp, 'Country:', countryCode);
      
      const response = await apiClient.post('/verify-otp', {
        phone_number: phoneNumber,
        otp: otp,
        code: countryCode,
      });
      
      console.log('WhatsAppOTPService: Verify OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('WhatsAppOTPService: Verify OTP error:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // Register user with OTP
  registerWithOTP: async (userData) => {
    try {
      console.log('WhatsAppOTPService: Registering user with OTP:', userData);
      
      const response = await apiClient.post('/register-user-otp', userData);
      
      console.log('WhatsAppOTPService: Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('WhatsAppOTPService: Register error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register user');
    }
  },
};
