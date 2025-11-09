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

interface Experience {
  company: string;
  position: string;
  year: string;
}

export default function EditExperienceScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const details = parsedUser.inspector_details || parsedUser.details || {};
        
        if (details.experience && typeof details.experience === 'object') {
          const experienceArray = Object.values(details.experience) as Experience[];
          setExperiences(experienceArray.length > 0 ? experienceArray : [{ company: '', position: '', year: '' }]);
        } else {
          setExperiences([{ company: '', position: '', year: '' }]);
        }
      }
    } catch (error) {
      console.error('Failed to load experiences:', error);
      setExperiences([{ company: '', position: '', year: '' }]);
    }
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, { company: '', position: '', year: '' }]);
  };

  const handleRemoveExperience = (index: number) => {
    if (experiences.length > 1) {
      const newExperiences = experiences.filter((_, i) => i !== index);
      setExperiences(newExperiences);
    }
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const handleSubmit = async () => {
    // Validate
    const hasEmpty = experiences.some(exp => !exp.company.trim() || !exp.position.trim() || !exp.year.trim());
    if (hasEmpty) {
      Alert.alert('Error', 'Please fill in all experience fields');
      return;
    }

    try {
      setLoading(true);

      // Format as object with numeric keys
      const formattedExperiences: { [key: number]: Experience } = {};
      experiences.forEach((exp, index) => {
        formattedExperiences[index + 1] = {
          company: exp.company,
          position: exp.position,
          year: exp.year,
        };
      });

      const formData = new FormData();
      formData.append('token', user?.auth_token || '');
      formData.append('type', 'experience');
      formData.append('experience', JSON.stringify(formattedExperiences));

      const response = await apiClient.post('/save-inspector-profile-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Experience updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);

        // Refresh user data
        await apiClient.post('/update-inspector-data', {
          token: user?.auth_token,
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update experience');
      }
    } catch (error: any) {
      console.error('Update experience error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update experience');
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
        <Text style={styles.headerTitle}>Edit Experience</Text>
        <Pressable style={styles.addButton} onPress={handleAddExperience}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {experiences.map((exp, index) => (
          <View key={index} style={styles.experienceCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{index + 1}. Experience</Text>
              {experiences.length > 1 && (
                <Pressable onPress={() => handleRemoveExperience(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                value={exp.company}
                onChangeText={(text) => handleUpdateExperience(index, 'company', text)}
                placeholder="Enter company name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position *</Text>
              <TextInput
                style={styles.input}
                value={exp.position}
                onChangeText={(text) => handleUpdateExperience(index, 'position', text)}
                placeholder="Enter position"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                style={styles.input}
                value={exp.year}
                onChangeText={(text) => handleUpdateExperience(index, 'year', text)}
                placeholder="Enter year (e.g., 2020-2023)"
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
            <Text style={styles.submitButtonText}>Update Experience</Text>
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
  experienceCard: {
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
    marginBottom: 16,
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
