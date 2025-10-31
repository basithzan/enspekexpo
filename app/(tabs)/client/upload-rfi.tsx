import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadRfiFile } from '../../../src/api/hooks/useClientActions';
import { useQueryClient } from '@tanstack/react-query';
import { HapticPressable } from '../../../src/components/HapticPressable';
import { HapticType, hapticSuccess, hapticError } from '../../../src/utils/haptics';

export default function UploadRfiScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadRfiFile();

  const [rfiName, setRfiName] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; file?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate file type
  const validateFileType = (file: any): boolean => {
    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];

    // Check MIME type or file extension
    const mimeType = file.mimeType || file.type;
    const uri = file.uri || '';
    const extension = uri.split('.').pop()?.toLowerCase();

    if (mimeType && supportedFormats.includes(mimeType)) {
      return true;
    }

    // Fallback: check extension
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    if (extension && supportedExtensions.includes(extension)) {
      return true;
    }

    return false;
  };

  // Validate file size (5 MB max)
  const validateFileSize = (file: any): boolean => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    const size = file.size || 0;
    return size <= maxSizeInBytes;
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file type
      if (!validateFileType(file)) {
        Alert.alert(
          'Invalid File Type',
          'Please select a valid file format. Supported formats: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX'
        );
        return;
      }

      // Validate file size
      if (!validateFileSize(file)) {
        Alert.alert(
          'File Too Large',
          'File size must be less than 5 MB. Please select a smaller file.'
        );
        return;
      }

      setSelectedFile(file);
      setFileName(file.name || 'Selected file');
      if (errors.file) {
        setErrors({ ...errors, file: '' });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; file?: string } = {};

    if (!rfiName.trim()) {
      newErrors.name = 'RFI name is required';
    }

    if (!selectedFile) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      hapticError();
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData
      const formData = new FormData();
      formData.append('name', rfiName.trim());

      // Append file - React Native FormData format
      // @ts-ignore - React Native FormData accepts objects with uri
      const fileUri = selectedFile.uri;
      const fileType = selectedFile.mimeType || selectedFile.type || 'application/octet-stream';
      const fileName = selectedFile.name || `rfi_${Date.now()}.${fileUri.split('.').pop() || 'file'}`;
      
      formData.append('rfi_file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      await uploadMutation.mutateAsync(formData);
      hapticSuccess();

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      setRfiName('');
      setSelectedFile(null);
      setFileName('');
      setErrors({});

      // Close modal and navigate after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        queryClient.invalidateQueries({ queryKey: ['client-requests'] });
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      hapticError();
      Alert.alert(
        'Upload Failed',
        error?.response?.data?.message || 'Failed to upload RFI file. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Upload RFI</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* RFI Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter RFI Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={rfiName}
            onChangeText={(text) => {
              setRfiName(text);
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            placeholder="Enter RFI name"
            placeholderTextColor="#9CA3AF"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* File Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload RFI File *</Text>
          
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                  <Text style={styles.fileSize}>
                    {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </Text>
                </View>
              </View>
              <Pressable
                style={styles.removeFileButton}
                onPress={() => {
                  setSelectedFile(null);
                  setFileName('');
                  if (errors.file) {
                    setErrors({ ...errors, file: '' });
                  }
                }}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.filePickerButton, selectedFile && styles.filePickerButtonSelected]}
            onPress={handleFilePick}
          >
            <Ionicons 
              name={selectedFile ? "document-attach-outline" : "cloud-upload-outline"} 
              size={24} 
              color={selectedFile ? "#10B981" : "#3B82F6"} 
            />
            <Text style={[styles.filePickerButtonText, selectedFile && styles.filePickerButtonTextSelected]}>
              {selectedFile ? 'Change File' : 'Select File'}
            </Text>
          </Pressable>

          {errors.file && <Text style={styles.errorText}>{errors.file}</Text>}
          
          <Text style={styles.helperText}>
            Supported formats: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX (Max 5 MB)
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <HapticPressable
          style={[styles.submitButton, (isSubmitting || uploadMutation.isPending) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || uploadMutation.isPending}
          hapticType={HapticType.Medium}
        >
          {isSubmitting || uploadMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Upload RFI</Text>
          )}
        </HapticPressable>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>RFI file uploaded successfully</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#F0F9FF',
  },
  filePickerButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  filePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  filePickerButtonTextSelected: {
    color: '#10B981',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeFileButton: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: '#15416E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

