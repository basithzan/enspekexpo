import React, { useState, useEffect } from 'react';
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
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HapticPressable } from '../src/components/HapticPressable';
import { HapticType, hapticError, hapticSuccess } from '../src/utils/haptics';
import { useClientRegister, useInspectorRegister } from '../src/api/hooks/useAuth';
import { apiClient } from '../src/api/client';

interface Country {
  id: number;
  name: string;
  code?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [inspectorType, setInspectorType] = useState<'0' | '1'>('0');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'client' | 'inspector' }>();
  const clientRegister = useClientRegister();
  const inspectorRegister = useInspectorRegister();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoadingCountries(true);
      const response = await apiClient.post('/get-all-countries');
      console.log('Countries API response:', response.data);
      
      if (response.data.success) {
        // Handle different response structures
        const rawList = Array.isArray(response.data.countries) 
          ? response.data.countries 
          : Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        // Normalize countries - handle different field name variations
        const validCountries = rawList
          .filter((c: any) => {
            const id = c?.id ?? c?.country_id ?? c?.value;
            const name = c?.name ?? c?.country_name ?? c?.label;
            return id && name;
          })
          .map((c: any) => ({
            id: Number(c.id ?? c.country_id ?? c.value ?? 0),
            name: String(c.name ?? c.country_name ?? c.label ?? '').trim(),
            code: c.code ?? c.iso_code ?? c.country_code,
          }))
          .filter((c: Country) => c.id > 0 && c.name);
        
        console.log('Normalized countries:', validCountries.slice(0, 5)); // Log first 5 for debugging
        
        if (validCountries.length > 0) {
          setCountries(validCountries);
        } else {
          console.warn('No valid countries found in API response');
        }
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const handleRegister = async () => {
    // Validate required fields
    if (!name.trim()) {
      hapticError();
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      hapticError();
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      hapticError();
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!phone.trim()) {
      hapticError();
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!password.trim() || password.length < 6) {
      hapticError();
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!selectedCountry) {
      hapticError();
      Alert.alert('Error', 'Please select your country');
      return;
    }

    if (type === 'client' && !companyName.trim()) {
      hapticError();
      Alert.alert('Error', 'Please enter your company name');
      return;
    }

    if (!type) {
      hapticError();
      Alert.alert('Error', 'Invalid user type');
      return;
    }

    setIsLoading(true);
    try {
      // For client registration, backend expects country name (string), not ID
      // For inspector registration, backend expects country ID (number)
      const countryValue = selectedCountry 
        ? (type === 'client' ? selectedCountry.name : Number(selectedCountry.id))
        : null;
      
      if (!countryValue) {
        hapticError();
        Alert.alert('Error', 'Please select a valid country');
        setIsLoading(false);
        return;
      }

      if (type === 'client') {
        const registrationData = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          company_name: companyName.trim(),
          country_id: countryValue, // Sending country name as string for client registration
        };

        console.log('Sending client registration data:', registrationData);
        console.log('Country value (name):', countryValue, 'Type:', typeof countryValue);

        const response = await clientRegister.mutateAsync(registrationData);

        console.log('Client registration response:', response);

        if (response.success) {
          hapticSuccess();
          Alert.alert(
            'Success',
            'Your account has been created successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace(`/login?type=${type}`);
                },
              },
            ]
          );
        } else {
          // Log the full response to see what error we're getting
          console.error('Registration failed - response:', response);
          const errorMsg = response.message || response.data || JSON.stringify(response);
          throw new Error(errorMsg);
        }
      } else {
        const registrationData = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          country_id: countryValue, // Sending country ID as number for inspector registration
          type: inspectorType,
        };

        console.log('Sending inspector registration data:', registrationData);
        console.log('Inspector type value:', inspectorType, 'Type:', typeof inspectorType);
        console.log('Country ID value:', countryValue, 'Type:', typeof countryValue);

        const response = await inspectorRegister.mutateAsync(registrationData);

        console.log('Inspector registration response:', response);

        if (response.success) {
          hapticSuccess();
          Alert.alert(
            'Success',
            'Your account has been created successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace(`/login?type=${type}`);
                },
              },
            ]
          );
        } else {
          // Log the full response to see what error we're getting
          console.error('Registration failed - response:', response);
          const errorMsg = response.message || response.data || JSON.stringify(response);
          throw new Error(errorMsg);
        }
      }
    } catch (error: any) {
      hapticError();
      console.error('Registration error:', error);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error response headers:', error.response?.headers);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        // Handle different error response formats
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.data) {
          if (typeof error.response.data.data === 'string') {
            errorMessage = error.response.data.data;
          } else if (error.response.data.data.message) {
            errorMessage = error.response.data.data.message;
          } else {
            errorMessage = JSON.stringify(error.response.data.data);
          }
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string'
            ? error.response.data.error
            : JSON.stringify(error.response.data.error);
        } else {
          // Try to extract any error information from the response
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // For 500 errors, provide more helpful message
      if (error.response?.status === 500) {
        errorMessage = `Server error (500): ${errorMessage}. Please check that all required fields are filled correctly and try again.`;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>Sign up as a {type}</Text>

          {/* Registration Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {type === 'client' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your company name"
                  placeholderTextColor="#9CA3AF"
                  value={companyName}
                  onChangeText={setCompanyName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {type === 'inspector' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inspector Type</Text>
                <View style={styles.typeSelector}>
                  <HapticPressable
                    style={[
                      styles.typeOption,
                      inspectorType === '0' && styles.typeOptionActive
                    ]}
                    onPress={() => setInspectorType('0')}
                    hapticType={HapticType.Light}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      inspectorType === '0' && styles.typeOptionTextActive
                    ]}>
                      Freelance Inspector
                    </Text>
                  </HapticPressable>
                  <HapticPressable
                    style={[
                      styles.typeOption,
                      inspectorType === '1' && styles.typeOptionActive
                    ]}
                    onPress={() => setInspectorType('1')}
                    hapticType={HapticType.Light}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      inspectorType === '1' && styles.typeOptionTextActive
                    ]}>
                      Inspection Agency
                    </Text>
                  </HapticPressable>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <HapticPressable
                style={styles.countryPicker}
                onPress={() => setShowCountryPicker(true)}
                hapticType={HapticType.Light}
              >
                <Text style={[
                  styles.countryPickerText,
                  !selectedCountry && styles.countryPickerPlaceholder
                ]}>
                  {selectedCountry ? selectedCountry.name : 'Select your country'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </HapticPressable>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password (min. 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <HapticPressable
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading || isLoadingCountries}
              hapticType={HapticType.Medium}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </HapticPressable>
          </View>

          {/* Back to Login */}
          <View style={styles.secondaryActions}>
            <HapticPressable onPress={() => router.back()} hapticType={HapticType.Light}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </HapticPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            {isLoadingCountries ? (
              <ActivityIndicator style={styles.modalLoader} color="#3B82F6" />
            ) : (
              <FlatList
                data={countries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <HapticPressable
                    style={styles.countryItem}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryPicker(false);
                    }}
                    hapticType={HapticType.Light}
                  >
                    <Text style={styles.countryItemText}>{item.name}</Text>
                  </HapticPressable>
                )}
                style={styles.countryList}
              />
            )}
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
<<<<<<< HEAD
fontFamily: 'Montserrat',
    fontWeight: 'bold',
    color: '#000000',
=======
    fontWeight: '700',
    color: '#111827',
>>>>>>> 8d776984 (register)
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
<<<<<<< HEAD
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#000000',
=======
    color: '#6B7280',
>>>>>>> 8d776984 (register)
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '400',
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
<<<<<<< HEAD
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    marginBottom: 16,
    color: '#000000',
=======
    color: '#111827',
    fontWeight: '400',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  countryPickerText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  countryPickerPlaceholder: {
    color: '#9CA3AF',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
>>>>>>> 8d776984 (register)
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
<<<<<<< HEAD
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
=======
    fontWeight: '700',
    letterSpacing: 0.3,
>>>>>>> 8d776984 (register)
  },
  secondaryActions: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
<<<<<<< HEAD
fontFamily: 'Montserrat',
    textDecorationLine: 'underline',
=======
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 24,
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
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLoader: {
    padding: 40,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
>>>>>>> 8d776984 (register)
  },
});
