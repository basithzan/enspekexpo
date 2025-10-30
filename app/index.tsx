import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/role-selection" />;
  }

  // Redirect to appropriate tab based on user type
  if (user?.type === 'client') {
    return <Redirect href="/(tabs)/client" />;
  } else if (user?.type === 'inspector') {
    return <Redirect href="/(tabs)/inspector" />;
  }

  // Fallback to client tab
  return <Redirect href="/(tabs)/client" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
