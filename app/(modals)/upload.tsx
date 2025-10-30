import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function UploadModal() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Report</Text>
      <Text style={styles.description}>Upload your inspection reports and documents here.</Text>
      
      <Pressable 
        onPress={() => router.back()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
    padding: 20,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    color: '#A8B0B9',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F7FA',
    fontWeight: '600',
  },
});
