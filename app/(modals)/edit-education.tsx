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

export default function EditEducationScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [educationItems, setEducationItems] = useState<string[]>(['']);

  useEffect(() => {
    loadEducation();
  }, []);

  const loadEducation = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const details = parsedUser.inspector_details || parsedUser.details || {};
        
        if (details.education && Array.isArray(details.education) && details.education.length > 0) {
          setEducationItems(details.education.filter((item: string) => item && item.trim()));
        }
        if (educationItems.length === 0) {
          setEducationItems(['']);
        }
      }
    } catch (error) {
      console.error('Failed to load education:', error);
    }
  };

  const handleAddEducation = () => {
    setEducationItems([...educationItems, '']);
  };

  const handleRemoveEducation = (index: number) => {
    if (educationItems.length > 1) {
      const newItems = educationItems.filter((_, i) => i !== index);
      setEducationItems(newItems);
    }
  };

  const handleUpdateEducation = (index: number, value: string) => {
    const newItems = [...educationItems];
    newItems[index] = value;
    setEducationItems(newItems);
  };

  const handleSubmit = async () => {
    const validItems = educationItems.filter(item => item.trim());
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one education entry');
      return;
    }

    try {
      setLoading(true);

      const formattedData = validItems.join(',');
      const formData = new FormData();
      formData.append('token', user?.auth_token || '');
      formData.append('type', 'education');
      formData.append('education', formattedData);

      const response = await apiClient.post('/save-inspector-profile-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Education updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);

        await apiClient.post('/update-inspector-data', {
          token: user?.auth_token,
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update education');
      }
    } catch (error: any) {
      console.error('Update education error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update education');
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
        <Text style={styles.headerTitle}>Edit Education</Text>
        <Pressable style={styles.addButton} onPress={handleAddEducation}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {educationItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{index + 1}. Education</Text>
              {educationItems.length > 1 && (
                <Pressable onPress={() => handleRemoveEducation(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Details *</Text>
              <TextInput
                style={styles.input}
                value={item}
                onChangeText={(text) => handleUpdateEducation(index, text)}
                placeholder="e.g., Bachelor of Science in Engineering"
                placeholderTextColor="#9CA3AF"
                multiline
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
            <Text style={styles.submitButtonText}>Update Education</Text>
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
    minHeight: 50,
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
