import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelection = (role: 'client' | 'inspector') => {
    router.push(`/login?type=${role}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image 
                  source={{ uri: 'https://enspek.com/assets/images/logo/logo-ek.png' }} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>ENSPEK</Text>
              </View>
              <Text style={styles.tagline}>Inspection Anywhere Anytime</Text>
            </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome to Enspek</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Pressable
            style={styles.roleButton}
            onPress={() => handleRoleSelection('inspector')}
          >
            <Text style={styles.roleButtonText}>I'm an inspector</Text>
          </Pressable>

          <Pressable
            style={styles.roleButton}
            onPress={() => handleRoleSelection('client')}
          >
            <Text style={styles.roleButtonText}>I'm a client</Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 124,
    height: 60,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  roleSection: {
    marginBottom: 40,
  },
  roleButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
