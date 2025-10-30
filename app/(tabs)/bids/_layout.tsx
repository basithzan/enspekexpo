import { Stack } from 'expo-router';

export default function BidsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
