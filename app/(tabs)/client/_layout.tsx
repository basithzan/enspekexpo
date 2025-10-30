import { Stack } from 'expo-router';

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Client Home' }} />
      <Stack.Screen name="create-rfi" options={{ title: 'Create RFI' }} />
      <Stack.Screen name="my-rfis" options={{ title: 'My RFIs' }} />
    </Stack>
  );
}
