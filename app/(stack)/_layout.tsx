import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="job/[id]" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}