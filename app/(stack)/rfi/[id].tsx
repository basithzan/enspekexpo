import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RfiDetails() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 bg-[#0B0B0C] p-5">
      <Text className="text-white text-2xl font-bold mb-4">RFI Details</Text>
      <Text className="text-[#A8B0B9]">RFI ID: {id}</Text>
    </View>
  );
}
