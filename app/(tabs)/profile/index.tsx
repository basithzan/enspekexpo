import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  Alert,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  TouchableOpacity
} from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// To enable CV upload functionality:
// 1. Install: npx expo install expo-document-picker
// 2. Uncomment the import above
// 3. Replace the mock implementation in handleCvUpload with the real DocumentPicker code
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { HapticPressable } from '../../../src/components/HapticPressable';
import { HapticType } from '../../../src/utils/haptics';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://erpbeta.enspek.com';

// Client Profile Component
function ClientProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const getAvatarUrl = () => {
    const avatar = user?.client_details?.avatar || user?.avatar;
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${API_BASE_URL}/${avatar}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/role-selection');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero Section */}
        <View style={styles.clientHeroSection}>
          <View style={styles.clientProfileCard}>
            <View style={styles.clientAvatarContainer}>
              {getAvatarUrl() ? (
                <Image
                  source={{ uri: getAvatarUrl() }}
                  style={styles.clientAvatar}
                  onError={() => {}}
                />
              ) : (
                <View style={styles.clientAvatarPlaceholder}>
                  <Text style={styles.clientAvatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.clientUserInfo}>
              <Text style={styles.clientUserName}>
                {user?.name || user?.client_details?.name || 'Client'}
              </Text>
              <Text style={styles.clientUserEmail}>
                {user?.email || user?.client_details?.email || ''}
              </Text>
            </View>

            <HapticPressable
              style={styles.clientEditButton}
              onPress={() => router.push('/(modals)/edit-profile')}
              hapticType={HapticType.Medium}
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text style={styles.clientEditButtonText}>Edit Profile</Text>
            </HapticPressable>
          </View>
        </View>

        {/* About Me Section */}
        {user?.client_details?.bio && (
          <View style={styles.aboutMeSection}>
            <View style={styles.aboutMeHeader}>
              <Text style={styles.aboutMeTitle}>About Me</Text>
            </View>
            <Text style={styles.aboutMeText}>
              {user.client_details.bio}
            </Text>
          </View>
        )}

        {/* Logout Section */}
        <View style={styles.logoutAccountSection}>
          <HapticPressable
            style={styles.logoutAccountButton}
            onPress={handleLogout}
            hapticType={HapticType.Warning}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutAccountText}>Logout</Text>
          </HapticPressable>
        </View>

        {/* Delete Account Section */}
        <View style={styles.deleteAccountSection}>
          <HapticPressable
            style={styles.deleteAccountButton}
            onPress={() => setIsDeleteModalVisible(true)}
            hapticType={HapticType.Warning}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteAccountText}>Delete My Account</Text>
          </HapticPressable>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalText}>
              To delete your account, please mail your registered email ID and phone number to our
              support team at:
            </Text>
            <Text style={styles.deleteModalEmail}>info@enspek.com</Text>
            <Text style={styles.deleteModalText}>
              Once we receive your email, your data and account will be deleted within 15 days.
            </Text>
            <HapticPressable
              style={styles.deleteModalCloseButton}
              onPress={() => setIsDeleteModalVisible(false)}
              hapticType={HapticType.Light}
            >
              <Text style={styles.deleteModalCloseText}>Close</Text>
            </HapticPressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Render client profile if user is client
  if (user?.type === 'client') {
    return <ClientProfileScreen />;
  }
  
  // Inspector profile (existing code)
  const [isOnline, setIsOnline] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [bioData, setBioData] = useState({
    aboutMe: user?.bio || '',
    experience: [],
    education: [],
    languages: [],
    certifications: []
  });

  const handleEditBio = () => {
    setIsEditMode(true);
  };

  const handleCvUpload = async () => {
    try {
      // Mock CV upload - replace with actual file picker when expo-document-picker is installed
      Alert.alert(
        'CV Upload',
        'CV upload functionality will be available once the file picker is properly configured. For now, this is a demo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Mock Upload', 
            onPress: () => {
              const mockFile = {
                name: 'My_Resume.pdf',
                size: 1024000,
                type: 'application/pdf'
              };
              setCvFile(mockFile);
              Alert.alert('Success', 'CV uploaded successfully! (Demo)');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload CV. Please try again.');
    }
  };

  const handleSaveBio = () => {
    // Here you would typically save the bio data to your backend
    console.log('Saving bio data:', bioData);
    console.log('CV file:', cvFile);
    setIsEditMode(false);
    Alert.alert('Success', 'Bio information updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setCvFile(null);
    // Reset to original data
    setBioData({
      aboutMe: user?.bio || '',
      experience: [],
      education: [],
      languages: [],
      certifications: []
    });
  };

  const addNewEntry = (section) => {
    const newEntry = {
      id: Date.now().toString(),
      title: '',
      description: '',
      period: '',
      institution: ''
    };
    
    setBioData(prev => ({
      ...prev,
      [section]: [...prev[section], newEntry]
    }));
  };

  const removeEntry = (section, entryId) => {
    setBioData(prev => ({
      ...prev,
      [section]: prev[section].filter(entry => entry.id !== entryId)
    }));
  };

  const updateEntry = (section, entryId, field, value) => {
    setBioData(prev => ({
      ...prev,
      [section]: prev[section].map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/role-selection');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      color: '#3B82F6',
      onPress: () => router.push('/(modals)/edit-profile')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: 'notifications-outline',
      color: '#3B82F6',
      onPress: () => console.log('Notifications')
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      icon: 'shield-checkmark-outline',
      color: '#3B82F6',
      onPress: () => console.log('Privacy')
    },
    {
      id: 'preferences',
      title: 'Preferences',
      subtitle: 'Customize your experience',
      icon: 'settings-outline',
      color: '#3B82F6',
      onPress: () => console.log('Preferences')
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      color: '#3B82F6',
      onPress: () => console.log('Help')
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      color: '#3B82F6',
      onPress: () => console.log('About')
    }
  ];


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable 
            style={styles.onlineToggle}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.profileCard}>
            <Pressable style={styles.editButton} onPress={handleEditBio}>
              <Ionicons name="create-outline" size={16} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit Bio</Text>
            </Pressable>
            
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'john.doe@example.com'}</Text>
              <View style={styles.roleContainer}>
                <Ionicons name="shield-outline" size={14} color="#3B82F6" />
                <Text style={styles.userRole}>{user?.type?.charAt(0).toUpperCase() + user?.type?.slice(1) || 'Inspector'}</Text>
              </View>
            </View>
          </View>

        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={item.id} 
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutContent}>
              <View style={styles.logoutIcon}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Bio Modal */}
      <Modal
        visible={isEditMode}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCancelEdit} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Bio</Text>
            <Pressable onPress={handleSaveBio} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* CV Upload Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CV/Resume</Text>
                <Ionicons name="document-outline" size={16} color="#64748B" />
              </View>
              <TouchableOpacity style={styles.cvUploadButton} onPress={handleCvUpload}>
                <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
                <Text style={styles.cvUploadText}>
                  {cvFile ? cvFile.name : 'Upload CV/Resume'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>
              {cvFile && (
                <View style={styles.cvPreview}>
                  <Ionicons name="document-text" size={20} color="#10B981" />
                  <Text style={styles.cvFileName}>{cvFile.name}</Text>
                  <TouchableOpacity onPress={() => setCvFile(null)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* About Me Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Ionicons name="person-outline" size={16} color="#64748B" />
              </View>
              <TextInput
                style={styles.bioTextInput}
                value={bioData.aboutMe}
                onChangeText={(text) => setBioData({...bioData, aboutMe: text})}
                placeholder="Tell us about yourself, your background, and what makes you unique..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Experience Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Professional Experience</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addNewEntry('experience')}
                >
                  <Ionicons name="add" size={16} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Add Experience</Text>
                </TouchableOpacity>
              </View>
              {bioData.experience.map((exp, index) => (
                <View key={exp.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryNumber}>#{index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeEntry('experience', exp.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.entryInput}
                    value={exp.title}
                    onChangeText={(text) => updateEntry('experience', exp.id, 'title', text)}
                    placeholder="Job Title / Position"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={exp.institution}
                    onChangeText={(text) => updateEntry('experience', exp.id, 'institution', text)}
                    placeholder="Company / Organization"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={exp.period}
                    onChangeText={(text) => updateEntry('experience', exp.id, 'period', text)}
                    placeholder="Duration (e.g., Jan 2020 - Present)"
                  />
                  <TextInput
                    style={[styles.entryInput, styles.entryTextArea]}
                    value={exp.description}
                    onChangeText={(text) => updateEntry('experience', exp.id, 'description', text)}
                    placeholder="Describe your role and achievements..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              ))}
            </View>

            {/* Education Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Education</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addNewEntry('education')}
                >
                  <Ionicons name="add" size={16} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Add Education</Text>
                </TouchableOpacity>
              </View>
              {bioData.education.map((edu, index) => (
                <View key={edu.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryNumber}>#{index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeEntry('education', edu.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.entryInput}
                    value={edu.title}
                    onChangeText={(text) => updateEntry('education', edu.id, 'title', text)}
                    placeholder="Degree / Qualification"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={edu.institution}
                    onChangeText={(text) => updateEntry('education', edu.id, 'institution', text)}
                    placeholder="University / Institution"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={edu.period}
                    onChangeText={(text) => updateEntry('education', edu.id, 'period', text)}
                    placeholder="Duration (e.g., 2018 - 2022)"
                  />
                  <TextInput
                    style={[styles.entryInput, styles.entryTextArea]}
                    value={edu.description}
                    onChangeText={(text) => updateEntry('education', edu.id, 'description', text)}
                    placeholder="Additional details (GPA, honors, etc.)"
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              ))}
            </View>

            {/* Languages Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addNewEntry('languages')}
                >
                  <Ionicons name="add" size={16} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Add Language</Text>
                </TouchableOpacity>
              </View>
              {bioData.languages.map((lang, index) => (
                <View key={lang.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryNumber}>#{index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeEntry('languages', lang.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.entryInput}
                    value={lang.title}
                    onChangeText={(text) => updateEntry('languages', lang.id, 'title', text)}
                    placeholder="Language Name"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={lang.description}
                    onChangeText={(text) => updateEntry('languages', lang.id, 'description', text)}
                    placeholder="Proficiency Level (e.g., Native, Fluent, Intermediate)"
                  />
                </View>
              ))}
            </View>

            {/* Certifications Section */}
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addNewEntry('certifications')}
                >
                  <Ionicons name="add" size={16} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Add Certification</Text>
                </TouchableOpacity>
              </View>
              {bioData.certifications.map((cert, index) => (
                <View key={cert.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryNumber}>#{index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeEntry('certifications', cert.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.entryInput}
                    value={cert.title}
                    onChangeText={(text) => updateEntry('certifications', cert.id, 'title', text)}
                    placeholder="Certification Name"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={cert.institution}
                    onChangeText={(text) => updateEntry('certifications', cert.id, 'institution', text)}
                    placeholder="Issuing Organization"
                  />
                  <TextInput
                    style={styles.entryInput}
                    value={cert.period}
                    onChangeText={(text) => updateEntry('certifications', cert.id, 'period', text)}
                    placeholder="Issue Date / Expiry Date"
                  />
                  <TextInput
                    style={[styles.entryInput, styles.entryTextArea]}
                    value={cert.description}
                    onChangeText={(text) => updateEntry('certifications', cert.id, 'description', text)}
                    placeholder="Additional details (certificate number, etc.)"
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#3B82F6',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  userRole: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  logoutSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Bio Section Styles
  bioSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  bioTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // CV Upload Styles
  cvUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  cvUploadText: {
    flex: 1,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 12,
  },
  cvPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cvFileName: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Add Button Styles
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  addButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Entry Card Styles
  entryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButton: {
    padding: 4,
  },
  entryInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  entryTextArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  // Client Profile Styles
  clientHeroSection: {
    padding: 20,
    paddingTop: 20,
  },
  clientProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientAvatarContainer: {
    marginBottom: 16,
  },
  clientAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  clientAvatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  clientAvatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clientUserInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clientUserName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  clientUserEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  clientEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004E96',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  clientEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aboutMeSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aboutMeHeader: {
    marginBottom: 12,
  },
  aboutMeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  aboutMeText: {
    fontSize: 14,
    color: '#78828A',
    lineHeight: 20,
  },
  headerRight: {
    width: 40,
  },
  logoutAccountSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutAccountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  deleteAccountSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECF1F6',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteAccountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteModalEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 12,
  },
  deleteModalCloseButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteModalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
