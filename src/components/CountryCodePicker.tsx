import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

interface Country {
  id: number;
  name: string;
  code: string;
  phone_code: string;
}

interface CountryCodePickerProps {
  selectedCountry: Country | null;
  onCountrySelect: (country: Country) => void;
}

export default function CountryCodePicker({ selectedCountry, onCountrySelect }: CountryCodePickerProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = countries.filter(country =>
        (country.name && country.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (country.code && country.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchQuery, countries]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://erpbeta.enspek.com/api/get-all-countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.countries && Array.isArray(data.countries)) {
        // Filter out countries with missing required fields
        const validCountries = data.countries.filter(country => 
          country && 
          country.id && 
          country.name && 
          country.phone_code
        );
        
        if (validCountries.length > 0) {
          setCountries(validCountries);
          setFilteredCountries(validCountries);
        } else {
          // Fallback if no valid countries
          setCountries(getCommonCountries());
          setFilteredCountries(getCommonCountries());
        }
      } else {
        // Fallback to common countries if API fails
        setCountries(getCommonCountries());
        setFilteredCountries(getCommonCountries());
      }
    } catch (error) {
      console.warn('Failed to fetch countries, using fallback:', error);
      // Fallback to common countries
      setCountries(getCommonCountries());
      setFilteredCountries(getCommonCountries());
    }
  };

  const getCommonCountries = (): Country[] => [
    { id: 1, name: 'United States', code: 'US', phone_code: '+1' },
    { id: 2, name: 'United Kingdom', code: 'GB', phone_code: '+44' },
    { id: 3, name: 'Canada', code: 'CA', phone_code: '+1' },
    { id: 4, name: 'Australia', code: 'AU', phone_code: '+61' },
    { id: 5, name: 'Germany', code: 'DE', phone_code: '+49' },
    { id: 6, name: 'France', code: 'FR', phone_code: '+33' },
    { id: 7, name: 'India', code: 'IN', phone_code: '+91' },
    { id: 8, name: 'China', code: 'CN', phone_code: '+86' },
    { id: 9, name: 'Japan', code: 'JP', phone_code: '+81' },
    { id: 10, name: 'Brazil', code: 'BR', phone_code: '+55' },
    { id: 11, name: 'Mexico', code: 'MX', phone_code: '+52' },
    { id: 12, name: 'South Africa', code: 'ZA', phone_code: '+27' },
    { id: 13, name: 'United Arab Emirates', code: 'AE', phone_code: '+971' },
    { id: 14, name: 'Saudi Arabia', code: 'SA', phone_code: '+966' },
    { id: 15, name: 'Singapore', code: 'SG', phone_code: '+65' },
  ];

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setIsVisible(false);
    setSearchQuery('');
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <Pressable
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryName}>{item.name || 'Unknown Country'}</Text>
      <Text style={styles.countryCode}>{item.phone_code || '+1'}</Text>
    </Pressable>
  );

  return (
    <>
      <Pressable
        style={styles.pickerButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.selectedCode}>
          {selectedCountry ? (selectedCountry.phone_code || '+1') : '+1'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCountryItem}
              style={styles.countryList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginRight: 8,
    minWidth: 80,
  },
  selectedCode: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#000000',
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  countryCode: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
