import { Stack } from 'expo-router';

export default function InspectorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Inspector Home' }} />
      <Stack.Screen name="nearby" options={{ title: 'Nearby Jobs' }} />
      <Stack.Screen name="bids" options={{ title: 'My Bids' }} />
    </Stack>
  );
}
