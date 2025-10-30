import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NotificationBadge from '../../src/components/NotificationBadge';

export default function TabLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  // Show loading while checking authentication
  if (isLoading) {
    return null; // The loading is handled in the main index.tsx
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/role-selection" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="client"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
          href: user?.type === 'client' ? '/(tabs)/client' : null,
        }}
      />
      <Tabs.Screen
        name="inspector"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
          href: user?.type === 'inspector' ? '/(tabs)/inspector' : null,
        }}
      />
      <Tabs.Screen
        name="bids"
        options={{
          title: 'My Bids',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'clipboard' : 'clipboard-outline'} 
              size={24} 
              color={color} 
            />
          ),
          href: user?.type === 'inspector' ? '/(tabs)/bids' : null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name={focused ? 'notifications' : 'notifications-outline'} 
                size={24} 
                color={color} 
              />
              <NotificationBadge size="small" />
            </View>
          ),
          href: '/(tabs)/notifications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
          href: '/(tabs)/profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  tabIconContainer: {
    position: 'relative',
  },
});
