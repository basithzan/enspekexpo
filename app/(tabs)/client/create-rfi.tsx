import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateRfi() {
  const router = useRouter();
  
  return (
    <View className="flex-1 bg-[#0B0B0C] p-5">
      <Text className="text-white text-2xl font-bold mb-4">Create RFI</Text>
      <Text className="text-[#A8B0B9] mb-6">Create a new inspection request.</Text>
      
      <Pressable 
        onPress={() => router.back()}
        className="bg-[#3B82F6] rounded-2xl px-4 py-3 items-center"
      >
        <Text className="text-white font-semibold">Back</Text>
      </Pressable>
    </View>
  );
}
