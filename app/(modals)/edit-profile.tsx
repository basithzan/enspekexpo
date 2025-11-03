import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useProfile } from '../../src/api/hooks/useProfile';
import { apiClient } from '../../src/api/client';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'https://erpbeta.enspek.com';

interface Country {
  id: number;
  name: string;
  code?: string;
}

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { updateProfile, getCountries, loading } = useProfile();
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearchText, setCountrySearchText] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastApiCallRef = useRef<number>(0);
  const countriesApiThrottleRef = useRef<number>(0);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    company_size: '',
    industry: '',
    country_id: 0,
    // Date of birth
    date_of_birth: '',
    // Location fields
    location: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    // Professional fields
    website: '',
    linkedin: '',
    bio: '',
    nationality: '',
    // Inspector specific fields
    specialization: '',
    experience_years: '',
    certifications: '',
    languages: '',
    availability: '',
    hourly_rate: '',
    currency: 'USD',
    cost_type: '',
    cost: '',
  });
  
  const [avatarFile, setAvatarFile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.client_details?.name || '',
        email: user.email || '',
        phone: user.phone || user.client_details?.phone || user.client_details?.mobile || '',
        company_name: user.company_name || user.client_details?.company_name || '',
        company_size: user.client_details?.company_size || '',
        industry: user.client_details?.industry || '',
        country_id: user.country_id || user.client_details?.country?.id || 0,
        date_of_birth: '',
        location: '',
        address: '',
        city: user.client_details?.city || '',
        state: '',
        postal_code: '',
        website: '',
        linkedin: '',
        bio: user.client_details?.bio || '',
        nationality: '',
        specialization: '',
        experience_years: '',
        certifications: '',
        languages: '',
        availability: '',
        hourly_rate: '',
        currency: 'USD',
        cost_type: '',
        cost: '',
      });
      
      if (user?.client_details?.avatar) {
        const avatarUrl = user.client_details.avatar;
        setAvatar(avatarUrl.startsWith('http') ? avatarUrl : `${API_BASE_URL}/${avatarUrl}`);
      }
      
      // Fetch user profile data
      fetchUserProfile();
    }
    loadCountries();
  }, [user]);

  // Separate useEffect to set selected country when both user and countries are available
  useEffect(() => {
    if ((user?.country_id || formData.country_id) && countries.length > 0) {
      const idToMatch = Number(formData.country_id || user?.country_id);
      const currentCountry = countries.find(
        (country: Country) => Number(country.id) === idToMatch
      );
      if (currentCountry) setSelectedCountry(currentCountry);
    }
  }, [user?.country_id, formData.country_id, countries]);

  // Also re-select country whenever profile fetch updates formData.country_id
  useEffect(() => {
    if (countries.length === 0) return;
    const idToMatch = Number(formData.country_id);
    if (!idToMatch) return;
    if (!selectedCountry || Number(selectedCountry.id) !== idToMatch) {
      const match = countries.find((c) => Number(c.id) === idToMatch);
      if (match) setSelectedCountry(match);
    }
  }, [formData.country_id, countries]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserProfile = async () => {
    if (isLoadingProfile) return; // Prevent duplicate calls
    
    // Rate limiting: prevent API calls more than once every 2 seconds
    const now = Date.now();
    if (now - lastApiCallRef.current < 2000) {
      return;
    }
    lastApiCallRef.current = now;
    
    try {
      setIsLoadingProfile(true);
      
      if (user?.type === 'client') {
        // For clients, profile data is already in user object, just update form
        if (user?.client_details) {
          setFormData(prev => ({
            ...prev,
            name: user.client_details.name || user.name || prev.name,
            phone: user.client_details.phone || user.client_details.mobile || user.phone || prev.phone,
            company_name: user.client_details.company_name || prev.company_name,
            company_size: user.client_details.company_size || prev.company_size,
            city: user.client_details.city || prev.city,
            industry: user.client_details.industry || prev.industry,
            bio: user.client_details.bio || prev.bio,
            country_id: user.client_details.country?.id || user.country_id || prev.country_id,
          }));
          
          if (user.client_details.avatar) {
            const avatarUrl = user.client_details.avatar;
            setAvatar(avatarUrl.startsWith('http') ? avatarUrl : `${API_BASE_URL}/${avatarUrl}`);
          }
        }
      } else if (user?.type === 'inspector') {
        // For inspectors, try multiple endpoints to get profile data
        const endpoints = [
          '/get-inspector-profile',
          '/update-inspector-data', // Sometimes this endpoint returns profile data
          '/get-inspector-data'
        ];
        
        let profileData = null;
        
        for (const endpoint of endpoints) {
          try {
            const response = await apiClient.post(endpoint);
            
            if (response.data.success) {
              profileData = response.data.user || response.data.data || response.data;
              break;
            }
          } catch (error) {
            continue;
          }
        }
        
        if (profileData) {
          // Extract data from nested structure
          const details = profileData.details || profileData;
          const inspectorDetails = details.inspector_details || {};
          
          // Update user data in AsyncStorage with the fetched profile information
          if (details.phone || details.country_id) {
            // Update the user context
            await updateUser({
              phone: details.phone || user.phone,
              country_id: details.country_id || user.country_id,
              company_name: details.company_name || user.company_name,
            });
          }
          
          // Update form data with fetched profile information
          setFormData(prev => ({
            ...prev,
            name: details.name || prev.name,
            email: details.email || prev.email,
            phone: details.phone || prev.phone,
            company_name: details.company_name || prev.company_name,
            country_id: details.country_id || prev.country_id,
            date_of_birth: details.dob || prev.date_of_birth,
            location: details.location || prev.location,
            address: details.address || prev.address,
            city: details.city || prev.city,
            state: details.state || prev.state,
            postal_code: details.postal_code || prev.postal_code,
            website: details.website || prev.website,
            linkedin: details.linkedin || prev.linkedin,
            bio: details.bio || prev.bio,
            nationality: details.nationality || prev.nationality,
            specialization: details.specialization || prev.specialization,
            experience_years: details.experience || prev.experience_years,
            certifications: Array.isArray(details.certifications) ? details.certifications.join(', ') : (details.certifications || prev.certifications),
            languages: Array.isArray(details.languages) ? details.languages.join(', ') : (details.languages || prev.languages),
            availability: details.availability || prev.availability,
            hourly_rate: inspectorDetails.hourly_rate || prev.hourly_rate,
            currency: inspectorDetails.currency || prev.currency,
            cost_type: inspectorDetails.cost_type || prev.cost_type,
            cost: inspectorDetails.cost || prev.cost,
          }));

          // If API provides country name, pre-select immediately even before countries load
          const countryName = (details.country_name || details.country?.name || details.countryName);
          if ((details.country_id || user.country_id) && countryName) {
            setSelectedCountry({
              id: Number(details.country_id || user.country_id),
              name: String(countryName),
              code: undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadCountries = async () => {
    if (isLoadingCountries || countries.length > 0) return; // Prevent duplicate calls
    
    // Separate rate limit for countries to avoid blocking by profile fetch
    const now = Date.now();
    if (now - countriesApiThrottleRef.current < 500) {
      return;
    }
    countriesApiThrottleRef.current = now;
    
    try {
      setIsLoadingCountries(true);
      const result = await getCountries();
      if (result.success) {
        // Accept multiple shapes: {data:[...]}, {countries:[...]}, data: {countries:[...]}
        const rawList =
          Array.isArray(result.data) ? result.data :
          Array.isArray((result as any).countries) ? (result as any).countries :
          Array.isArray((result.data || {}).countries) ? (result.data as any).countries :
          [];
        // Normalize countries to a common shape { id, name, code }
        const normalized: Country[] = rawList.map((c: any) => ({
          id: Number(c.id ?? c.country_id ?? c.value ?? 0),
          name: String(c.name ?? c.country_name ?? c.label ?? '').trim(),
          code: c.code ?? c.iso_code ?? c.country_code,
        })).filter((c: Country) => c.id && c.name);
        setCountries(normalized);
        setFilteredCountries(normalized);
        // Ensure picker list is populated immediately
        if (normalized.length && (!selectedCountry && (user?.country_id || formData.country_id))) {
          const idToMatch = Number(formData.country_id || user?.country_id);
          const match = normalized.find((c) => Number(c.id) === idToMatch);
          if (match) setSelectedCountry(match);
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        // For client, we need to store the file for FormData upload
        if (user?.type === 'client') {
          const filename = result.assets[0].uri.split('/').pop() || 'avatar.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          setAvatarFile({
            uri: result.assets[0].uri,
            type,
            name: filename,
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setFormData(prev => ({
      ...prev,
      country_id: country.id
    }));
    setShowCountryPicker(false);
  };

  const handleCountrySearch = useCallback((text: string) => {
    setCountrySearchText(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search to prevent too many filter operations
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim() === '') {
        setFilteredCountries(countries);
      } else {
        const filtered = countries.filter(country =>
          country.name.toLowerCase().includes(text.toLowerCase()) ||
          (country.code && country.code.toLowerCase().includes(text.toLowerCase()))
        );
        setFilteredCountries(filtered);
      }
    }, 300); // 300ms debounce
  }, [countries]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'User name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Contact number is required');
      return false;
    }
    if (!formData.country_id) {
      Alert.alert('Error', 'Country is required');
      return false;
    }
    
    // Client specific validation
    if (user?.type === 'client') {
      if (!formData.company_name.trim()) {
        Alert.alert('Error', 'Company name is required');
        return false;
      }
      if (!formData.company_size.trim()) {
        Alert.alert('Error', 'Company size is required');
        return false;
      }
      if (!formData.city.trim()) {
        Alert.alert('Error', 'City is required');
        return false;
      }
      if (!formData.industry.trim()) {
        Alert.alert('Error', 'Industry is required');
        return false;
      }
      if (!formData.bio.trim()) {
        Alert.alert('Error', 'Bio is required');
        return false;
      }
    }
    
    // Inspector specific validation
    if (user?.type === 'inspector') {
      if (formData.experience_years && isNaN(Number(formData.experience_years))) {
        Alert.alert('Error', 'Experience years must be a number');
        return false;
      }
      if (formData.hourly_rate && isNaN(Number(formData.hourly_rate))) {
        Alert.alert('Error', 'Hourly rate must be a number');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // For clients, always use FormData (even without avatar, per old PWA implementation)
    if (user?.type === 'client') {
      try {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('phone', formData.phone);
        formDataObj.append('country_id', String(formData.country_id));
        formDataObj.append('bio', formData.bio);
        formDataObj.append('city', formData.city);
        formDataObj.append('company_name', formData.company_name);
        formDataObj.append('company_size', formData.company_size);
        formDataObj.append('industry', formData.industry);
        
        // Append avatar file only if a new one was selected
        if (avatarFile) {
          formDataObj.append('avatar', {
            uri: avatarFile.uri,
            type: avatarFile.type,
            name: avatarFile.name,
          } as any);
        }

        const response = await apiClient.post('/edit-client-data', formDataObj);

        if (response.data.success) {
          await updateUser({
            name: formData.name,
            phone: formData.phone,
            company_name: formData.company_name,
            country_id: formData.country_id,
            client_details: {
              ...user?.client_details,
              bio: formData.bio,
              city: formData.city,
              company_size: formData.company_size,
              industry: formData.industry,
              avatar: response.data?.user?.client_details?.avatar || user?.client_details?.avatar,
            },
          });

          Alert.alert('Success', 'Profile updated successfully', [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              }
            }
          ]);
        } else {
          Alert.alert('Error', response.data.message || 'Failed to update profile');
        }
      } catch (error: any) {
        console.error('Update profile error:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
      }
      return;
    }

    // For inspectors or clients without avatar upload, use JSON
    const profileData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.company_name,
      company_size: formData.company_size,
      industry: formData.industry,
      country_id: formData.country_id,
      date_of_birth: formData.date_of_birth,
      location: formData.location,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      website: formData.website,
      linkedin: formData.linkedin,
      bio: formData.bio,
      nationality: formData.nationality,
      // Inspector specific fields
      ...(user?.type === 'inspector' && {
        specialization: formData.specialization,
        experience_years: formData.experience_years,
        certifications: formData.certifications,
        languages: formData.languages,
        availability: formData.availability,
        hourly_rate: formData.hourly_rate,
        currency: formData.currency,
        cost_type: formData.cost_type,
        cost: formData.cost,
      }),
    };

    const result = await updateProfile(profileData);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          }
        }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderFormField = (
    label: string,
    field: string,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {formData.name.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Pressable style={styles.avatarEditButton} onPress={pickImage}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderFormField('User Name *', 'name', 'Enter user name')}
          {renderFormField('Contact Number *', 'phone', 'Enter contact number', 'phone-pad')}
          
          {user?.type === 'client' && (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email (Non-editable)</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={formData.email}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  editable={false}
                />
              </View>
            </>
          )}
          
          {user?.type === 'inspector' && (
            <>
              {renderFormField('Email *', 'email', 'Enter your email', 'email-address')}
              {renderFormField('Date of Birth', 'date_of_birth', 'Enter DOB', 'default')}
              {renderFormField('Nationality', 'nationality', 'Enter Nationality', 'default')}
            </>
          )}
          
          {/* Country Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Country *</Text>
            <Pressable
              style={styles.countryPicker}
              onPress={() => {
                if (!countries.length) {
                  // Attempt to load countries if not yet loaded
                  loadCountries();
                }
                // Ensure list is visible
                setFilteredCountries(countries);
                setShowCountryPicker(true);
              }}
            >
              <Text style={[styles.countryText, !selectedCountry && styles.placeholderText]}>
                {selectedCountry?.name || (countries.find(c => Number(c.id) === Number(formData.country_id))?.name) || 'Select Country'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </Pressable>
          </View>
        </View>

        {/* Client Specific Fields */}
        {user?.type === 'client' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              
              {renderFormField('Company Name *', 'company_name', 'Company name')}
              {renderFormField('Company Size *', 'company_size', 'Company size')}
              {renderFormField('City *', 'city', 'Enter city')}
              {renderFormField('Industry *', 'industry', 'Enter industry')}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              
              {renderFormField('Bio *', 'bio', 'Enter bio', 'default', true)}
            </View>
          </>
        )}

        {/* Address Information - Inspector Only */}
        {user?.type === 'inspector' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            
            {renderFormField('Location', 'location', 'Enter location')}
            {renderFormField('Address', 'address', 'Enter your address')}
            {renderFormField('City', 'city', 'Enter your city')}
            {renderFormField('State/Province', 'state', 'Enter your state')}
            {renderFormField('Postal Code', 'postal_code', 'Enter your postal code')}
          </View>
        )}

        {/* Professional Information - Inspector Only */}
        {user?.type === 'inspector' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            {renderFormField('Website', 'website', 'Enter your website URL', 'default')}
            {renderFormField('LinkedIn', 'linkedin', 'Enter your LinkedIn profile', 'default')}
            {renderFormField('Bio', 'bio', 'Tell us about yourself', 'default', true)}
          </View>
        )}

        {/* Inspector Specific Fields */}
        {user?.type === 'inspector' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspector Details</Text>
            
            {renderFormField('Specialization', 'specialization', 'e.g., Building Inspection, Electrical')}
            {renderFormField('Experience (Years)', 'experience_years', 'Enter years of experience', 'numeric')}
            {renderFormField('Certifications', 'certifications', 'List your certifications')}
            {renderFormField('Languages', 'languages', 'Languages you speak')}
            {renderFormField('Availability', 'availability', 'Your availability schedule')}
            
            <View style={styles.rowContainer}>
              <View style={styles.halfField}>
                {renderFormField('Hourly Rate', 'hourly_rate', 'Enter rate', 'numeric')}
              </View>
              <View style={styles.halfField}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Currency</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.currency}
                    onChangeText={(value) => handleInputChange('currency', value)}
                    placeholder="USD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
            
            {/* Cost Information */}
            <View style={styles.rowContainer}>
              <View style={styles.halfField}>
                {renderFormField('Cost Type', 'cost_type', 'Choose Cost Type', 'default')}
              </View>
              <View style={styles.halfField}>
                {renderFormField('Cost', 'cost', 'Enter cost', 'numeric')}
              </View>
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <Pressable onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </Pressable>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor="#9CA3AF"
              value={countrySearchText}
              onChangeText={handleCountrySearch}
            />
          </View>
          
          <ScrollView style={styles.countryList}>
            {filteredCountries.map((country) => (
              <Pressable
                key={country.id}
                style={styles.countryItem}
                onPress={() => handleCountrySelect(country)}
              >
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryCode}>{country.code || ''}</Text>
              </Pressable>
            ))}
            {filteredCountries.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No countries found</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#3B82F6',
    fontSize: 36,
fontFamily: 'Montserrat',
    fontWeight: '700',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  countryPicker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  countryText: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1E293B',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 24,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#1E293B',
  },
  countryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  countryName: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1E293B',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#64748B',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1E293B',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#64748B',
    fontWeight: '500',
  },
});
