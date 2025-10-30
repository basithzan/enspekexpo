import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="upload" options={{ title: 'Upload Report' }} />
      <Stack.Screen name="filters" options={{ title: 'Filters' }} />
    </Stack>
  );
}
