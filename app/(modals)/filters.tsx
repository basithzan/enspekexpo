import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function FiltersModal() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filters & Sort</Text>
      <Text style={styles.description}>Filter and sort nearby jobs by your preferences.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <Pressable 
          onPress={() => setSortBy('date')}
          style={[styles.option, sortBy === 'date' && styles.optionSelected]}
        >
          <Text style={[styles.optionText, sortBy === 'date' && styles.optionTextSelected]}>
            Date (Newest First)
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setSortBy('title')}
          style={[styles.option, sortBy === 'title' && styles.optionSelected]}
        >
          <Text style={[styles.optionText, sortBy === 'title' && styles.optionTextSelected]}>
            Job Title
          </Text>
        </Pressable>
      </View>
      
      <Pressable 
        onPress={() => router.back()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Apply Filters</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    color: '#1F2937',
    fontSize: 24,
fontFamily: 'Montserrat',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    marginBottom: 12,
  },
  option: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#3B82F6',
  },
  optionText: {
    color: '#374151',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#0369A1',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
