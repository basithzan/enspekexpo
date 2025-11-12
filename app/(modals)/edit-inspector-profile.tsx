import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://erpbeta.enspek.com';

interface Country {
  id: number;
  name: string;
  code?: string;
  phone_code?: string;
}

export default function EditInspectorProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearchText, setCountrySearchText] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    location: '',
    bio: '',
    nationality: '',
    cost: '',
    cost_type: 'Hourly', // Hourly or Daily
  });

  const [costTypeOptions] = useState([
    { value: 'Hourly', label: 'Hourly' },
    { value: 'Daily', label: 'Daily' },
  ]);

  useEffect(() => {
    loadProfileData();
    loadCountries();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Inspector user data:', parsedUser);

        const details = parsedUser.inspector_details || parsedUser.details || {};
        const inspectorDetails = details.inspector_details || {};

        // Format DOB from DD-MM-YYYY to YYYY-MM-DD for date input
        let formattedDob = '';
        if (details.dob) {
          const dobParts = details.dob.split('-');
          if (dobParts.length === 3) {
            const [day, month, year] = dobParts;
            formattedDob = `${year}-${month}-${day}`;
          }
        }

        setFormData({
          name: details.name || parsedUser.name || '',
          phone: details.phone || parsedUser.phone || '',
          email: details.email || parsedUser.email || '',
          dob: formattedDob,
          location: details.location || '',
          bio: details.bio || '',
          nationality: details.nationality || '',
          cost: inspectorDetails.cost || '',
          cost_type: inspectorDetails.cost_type === '0' || inspectorDetails.cost_type === 'Hourly' ? 'Hourly' : 'Daily',
        });

        // Set avatar
        if (details.avatar || details.profile) {
          const avatarUrl = details.avatar || details.profile;
          setAvatar(avatarUrl.startsWith('http') ? avatarUrl : `${API_BASE_URL}/${avatarUrl}`);
        }

        // Set CV file name
        if (details.cv) {
          setCvFileName(details.cv.split('/').pop());
        }

        // Set country
        if (details.country) {
          setSelectedCountry({
            id: Number(details.country.id || details.country_id),
            name: String(details.country.name || ''),
            code: details.country.country_code,
            phone_code: details.country.phone_code,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await apiClient.post('/get-all-countries', {
        token: user?.auth_token,
      });
      if (response.data.countries) {
        setCountries(response.data.countries);
        setFilteredCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      setAvatarFile(result.assets[0]);
    }
  };

  const handlePickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCvFile(file);
        setCvFileName(file.name);
      }
    } catch (error) {
      console.error('Error picking CV:', error);
      Alert.alert('Error', 'Failed to pick CV file');
    }
  };

  const handleCountrySearch = (text: string) => {
    setCountrySearchText(text);
    if (text.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((country) =>
        country.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setCountrySearchText('');
    setFilteredCountries(countries);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return;
    }
    if (!formData.bio.trim()) {
      Alert.alert('Error', 'Please enter your bio');
      return;
    }
    if (!formData.nationality.trim()) {
      Alert.alert('Error', 'Please enter your nationality');
      return;
    }
    if (!selectedCountry) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    if (!formData.cost.trim()) {
      Alert.alert('Error', 'Please enter your cost');
      return;
    }
    if (!formData.dob) {
      Alert.alert('Error', 'Please select your date of birth');
      return;
    }

    try {
      setLoading(true);

      // Format DOB from YYYY-MM-DD to DD-MM-YYYY for API
      const dobParts = formData.dob.split('-');
      let formattedDob = formData.dob;
      if (dobParts.length === 3) {
        const [year, month, day] = dobParts;
        formattedDob = `${day}-${month}-${year}`;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('token', user?.auth_token || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('country_id', selectedCountry.id.toString());
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('dob', formattedDob);
      formDataToSend.append('cost_type', formData.cost_type);
      formDataToSend.append('cost', formData.cost);
      formDataToSend.append('nationality', formData.nationality);

      // Append avatar if selected
      if (avatarFile) {
        const uriParts = avatarFile.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formDataToSend.append('avatar', {
          uri: avatarFile.uri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Append CV if selected
      if (cvFile) {
        formDataToSend.append('cv', {
          uri: cvFile.uri,
          name: cvFile.name,
          type: cvFile.mimeType || 'application/pdf',
        } as any);
      }

      const response = await apiClient.post('/update-inspector-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);

        // Refresh user data
        const refreshResponse = await apiClient.post('/update-inspector-data', {
          token: user?.auth_token,
        });

        if (refreshResponse.data.success) {
          // Update the full user data in AsyncStorage
          try {
            const userData = await AsyncStorage.getItem('user_data');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              
              // Update basic user fields
              parsedUser.name = formData.name;
              parsedUser.phone = formData.phone;
              
              // Update inspector details
              if (parsedUser.inspector_details) {
                parsedUser.inspector_details.name = formData.name;
                parsedUser.inspector_details.phone = formData.phone;
                parsedUser.inspector_details.bio = formData.bio;
                parsedUser.inspector_details.location = formData.location;
                parsedUser.inspector_details.nationality = formData.nationality;
                parsedUser.inspector_details.dob = formData.dob;
                parsedUser.inspector_details.cost = formData.cost;
                parsedUser.inspector_details.cost_type = formData.cost_type;
                if (selectedCountry) {
                  parsedUser.inspector_details.country = {
                    id: selectedCountry.id,
                    name: selectedCountry.name,
                    country_code: selectedCountry.code,
                    phone_code: selectedCountry.phone_code
                  };
                }
              } else if (parsedUser.details) {
                // Fallback to details if inspector_details doesn't exist
                if (!parsedUser.details.inspector_details) {
                  parsedUser.details.inspector_details = {};
                }
                parsedUser.details.inspector_details.name = formData.name;
                parsedUser.details.inspector_details.phone = formData.phone;
                parsedUser.details.inspector_details.bio = formData.bio;
                parsedUser.details.inspector_details.location = formData.location;
                parsedUser.details.inspector_details.nationality = formData.nationality;
                parsedUser.details.inspector_details.dob = formData.dob;
                parsedUser.details.inspector_details.cost = formData.cost;
                parsedUser.details.inspector_details.cost_type = formData.cost_type;
                if (selectedCountry) {
                  parsedUser.details.inspector_details.country = {
                    id: selectedCountry.id,
                    name: selectedCountry.name,
                    country_code: selectedCountry.code,
                    phone_code: selectedCountry.phone_code
                  };
                }
              }
              
              // Save updated user data back to AsyncStorage
              await AsyncStorage.setItem('user_data', JSON.stringify(parsedUser));
            }
          } catch (storageError) {
            console.error('Failed to update AsyncStorage:', storageError);
          }
          
          // Update user context
          const updatedUserData = {
            ...user,
            name: formData.name,
            phone: formData.phone,
          };
          await updateUser(updatedUserData);
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Profile Picture</Text>
          {avatar && (
            <Image source={{ uri: avatar }} style={styles.avatarPreview} />
          )}
          <Pressable style={styles.uploadButton} onPress={handlePickAvatar}>
            <Ionicons name="camera-outline" size={20} color="#3B82F6" />
            <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
          </Pressable>
        </View>

        {/* CV Section */}
        <View style={styles.section}>
          <Text style={styles.label}>CV / Resume</Text>
          {cvFileName && (
            <View style={styles.cvPreview}>
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <Text style={styles.cvFileName} numberOfLines={1}>{cvFileName}</Text>
            </View>
          )}
          <Pressable style={styles.uploadButton} onPress={handlePickCV}>
            <Ionicons name="document-outline" size={20} color="#3B82F6" />
            <Text style={styles.uploadButtonText}>Upload CV</Text>
          </Pressable>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter contact number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        {/* Email (Non-editable) */}
        <View style={styles.section}>
          <Text style={styles.label}>Email (Non-editable)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.email}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* DOB */}
        <View style={styles.section}>
          <Text style={styles.label}>Date of Birth *</Text>
          <TextInput
            style={styles.input}
            value={formData.dob}
            onChangeText={(text) => setFormData({ ...formData, dob: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 1990-01-15)</Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Enter bio"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Country */}
        <View style={styles.section}>
          <Text style={styles.label}>Country *</Text>
          <Pressable
            style={styles.input}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={selectedCountry ? styles.inputText : styles.placeholderText}>
              {selectedCountry ? selectedCountry.name : 'Select country'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Enter location"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Cost Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Cost Type *</Text>
          <View style={styles.radioGroup}>
            {costTypeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, cost_type: option.value })}
              >
                <View style={styles.radioCircle}>
                  {formData.cost_type === option.value && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cost */}
        <View style={styles.section}>
          <Text style={styles.label}>Cost *</Text>
          <TextInput
            style={styles.input}
            value={formData.cost}
            onChangeText={(text) => setFormData({ ...formData, cost: text })}
            placeholder="Enter cost"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        {/* Nationality */}
        <View style={styles.section}>
          <Text style={styles.label}>Nationality *</Text>
          <TextInput
            style={styles.input}
            value={formData.nationality}
            onChangeText={(text) => setFormData({ ...formData, nationality: text })}
            placeholder="Enter nationality"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Additional Profile Sections */}
        <View style={styles.additionalSections}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <Pressable
            style={styles.sectionButton}
            onPress={() => router.push('/(modals)/edit-experience')}
          >
            <View style={styles.sectionButtonContent}>
              <Ionicons name="briefcase-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionButtonText}>Edit Experience</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>

          <Pressable
            style={styles.sectionButton}
            onPress={() => router.push('/(modals)/edit-education')}
          >
            <View style={styles.sectionButtonContent}>
              <Ionicons name="school-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionButtonText}>Edit Education</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>

          <Pressable
            style={styles.sectionButton}
            onPress={() => router.push('/(modals)/edit-certifications')}
          >
            <View style={styles.sectionButtonContent}>
              <Ionicons name="ribbon-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionButtonText}>Edit Certifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>

          <Pressable
            style={styles.sectionButton}
            onPress={() => router.push('/(modals)/edit-courses')}
          >
            <View style={styles.sectionButtonContent}>
              <Ionicons name="book-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionButtonText}>Edit Courses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>

          <Pressable
            style={styles.sectionButton}
            onPress={() => router.push('/(modals)/edit-languages')}
          >
            <View style={styles.sectionButtonContent}>
              <Ionicons name="language-outline" size={24} color="#3B82F6" />
              <Text style={styles.sectionButtonText}>Edit Languages</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Update Profile</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              value={countrySearchText}
              onChangeText={handleCountrySearch}
              placeholder="Search countries..."
              placeholderTextColor="#9CA3AF"
            />

            <ScrollView style={styles.countryList}>
              {filteredCountries.map((country) => (
                <Pressable
                  key={country.id}
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(country)}
                >
                  <Text style={styles.countryName}>{country.name}</Text>
                  {selectedCountry?.id === country.id && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cvPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  cvFileName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
  },
  additionalSections: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    margin: 20,
    marginBottom: 12,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    fontSize: 16,
    color: '#374151',
  },
});
