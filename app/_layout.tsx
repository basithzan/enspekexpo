import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { FONTS } from '../src/config/fonts';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Set default font family for all Text and TextInput components
      // @ts-ignore - React Native supports defaultProps
      if (Text.defaultProps == null) Text.defaultProps = {};
      // @ts-ignore
      Text.defaultProps.style = { fontFamily: FONTS.regular };
      
      // @ts-ignore
      if (TextInput.defaultProps == null) TextInput.defaultProps = {};
      // @ts-ignore
      TextInput.defaultProps.style = { fontFamily: FONTS.regular };
      
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="role-selection" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
