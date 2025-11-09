import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditLanguagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languageItems, setLanguageItems] = useState<string[]>(['']);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const details = parsedUser.inspector_details || parsedUser.details || {};
        
        if (details.languages && Array.isArray(details.languages) && details.languages.length > 0) {
          setLanguageItems(details.languages.filter((item: string) => item && item.trim()));
        }
        if (languageItems.length === 0) {
          setLanguageItems(['']);
        }
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const handleAddLanguage = () => {
    setLanguageItems([...languageItems, '']);
  };

  const handleRemoveLanguage = (index: number) => {
    if (languageItems.length > 1) {
      const newItems = languageItems.filter((_, i) => i !== index);
      setLanguageItems(newItems);
    }
  };

  const handleUpdateLanguage = (index: number, value: string) => {
    const newItems = [...languageItems];
    newItems[index] = value;
    setLanguageItems(newItems);
  };

  const handleSubmit = async () => {
    const validItems = languageItems.filter(item => item.trim());
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one language entry');
      return;
    }

    try {
      setLoading(true);

      const formattedData = validItems.join(',');
      const formData = new FormData();
      formData.append('token', user?.auth_token || '');
      formData.append('type', 'languages');
      formData.append('languages', formattedData);

      const response = await apiClient.post('/save-inspector-profile-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Languages updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);

        await apiClient.post('/update-inspector-data', {
          token: user?.auth_token,
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update languages');
      }
    } catch (error: any) {
      console.error('Update languages error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update languages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Languages</Text>
        <Pressable style={styles.addButton} onPress={handleAddLanguage}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {languageItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{index + 1}. Language</Text>
              {languageItems.length > 1 && (
                <Pressable onPress={() => handleRemoveLanguage(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Language *</Text>
              <TextInput
                style={styles.input}
                value={item}
                onChangeText={(text) => handleUpdateLanguage(index, text)}
                placeholder="e.g., English - Fluent"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        ))}

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Update Languages</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
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
});
