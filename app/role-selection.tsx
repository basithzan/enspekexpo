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
import { Ionicons } from '@expo/vector-icons';
import { HapticPressable } from '../src/components/HapticPressable';
import { HapticType } from '../src/utils/haptics';

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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={{ uri: 'https://enspek.com/assets/images/logo/logo-ek.png' }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to Enspek</Text>
            <Text style={styles.welcomeSubtitle}>
              Choose your role to continue
            </Text>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.roleSection}>
            {/* Inspector Card */}
            <HapticPressable
              style={({ pressed }: any) => [
                styles.roleCard,
                styles.inspectorCard,
                pressed && styles.roleCardPressed
              ]}
              onPress={() => handleRoleSelection('inspector')}
              hapticType={HapticType.Medium}
            >
              <View style={styles.roleCardIconContainer}>
                <View style={[styles.iconBackground, styles.inspectorIconBg]}>
                  <Ionicons name="clipboard-outline" size={32} color="#1E40AF" />
                </View>
              </View>
              <View style={styles.roleCardContent}>
                <Text style={styles.roleCardTitle}>I'm an Inspector</Text>
                <Text style={styles.roleCardDescription}>
                  Find inspection jobs and manage your assignments
                </Text>
              </View>
              <View style={styles.roleCardArrow}>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </View>
            </HapticPressable>

            {/* Client Card */}
            <HapticPressable
              style={({ pressed }: any) => [
                styles.roleCard,
                styles.clientCard,
                pressed && styles.roleCardPressed
              ]}
              onPress={() => handleRoleSelection('client')}
              hapticType={HapticType.Medium}
            >
              <View style={styles.roleCardIconContainer}>
                <View style={[styles.iconBackground, styles.clientIconBg]}>
                  <Ionicons name="business-outline" size={32} color="#059669" />
                </View>
              </View>
              <View style={styles.roleCardContent}>
                <Text style={styles.roleCardTitle}>I'm a Client</Text>
                <Text style={styles.roleCardDescription}>
                  Request inspections and manage your projects
                </Text>
              </View>
              <View style={styles.roleCardArrow}>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </View>
            </HapticPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 0,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 32,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  roleSection: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inspectorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  clientCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  roleCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.1,
    elevation: 6,
  },
  roleCardIconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectorIconBg: {
    backgroundColor: '#EFF6FF',
  },
  clientIconBg: {
    backgroundColor: '#ECFDF5',
  },
  roleCardContent: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  roleCardDescription: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '400',
  },
  roleCardArrow: {
    marginLeft: 12,
  },
});
