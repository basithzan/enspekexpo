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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HapticPressable } from '../src/components/HapticPressable';
import { HapticType, hapticError } from '../src/utils/haptics';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'client' | 'inspector' }>();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      hapticError();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!type) {
      hapticError();
      Alert.alert('Error', 'Invalid user type');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement registration API call
      Alert.alert('Success', 'Registration functionality will be implemented soon');
      router.back();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>Sign up as a {type}</Text>

        {/* Registration Form */}
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <HapticPressable
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
fontFamily: 'Montserrat',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  formSection: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    marginBottom: 16,
    color: '#000000',
  },
  registerButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  secondaryActions: {
    alignItems: 'center',
  },
  linkText: {
    color: '#1E40AF',
    fontSize: 14,
fontFamily: 'Montserrat',
    textDecorationLine: 'underline',
  },
});
