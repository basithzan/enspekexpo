import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications 
} from '../../../src/api/hooks/useNotifications';
import { HapticPressable } from '../../../src/components/HapticPressable';
import { HapticType } from '../../../src/utils/haptics';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'bid' | 'job' | 'payment' | 'system' | 'alert';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  data?: any;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // API hooks
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useNotifications();
  
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  const notifications: Notification[] = notificationsData?.notifications || notificationsData?.alerts || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotificationMutation.mutateAsync(notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          }
        }
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllMutation.mutateAsync();
            } catch (error) {
              console.error('Error clearing all notifications:', error);
            }
          }
        }
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return 'clipboard-outline';
      case 'job':
        return 'briefcase-outline';
      case 'payment':
        return 'card-outline';
      case 'system':
        return 'settings-outline';
      case 'alert':
        return 'alert-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid':
        return '#3B82F6'; // Blue
      case 'job':
        return '#10B981'; // Green
      case 'payment':
        return '#F59E0B'; // Yellow
      case 'system':
        return '#6B7280'; // Gray
      case 'alert':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = (notification: Notification) => (
    <HapticPressable
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.is_read && styles.unreadNotification
      ]}
      onPress={() => handleMarkAsRead(notification.id)}
      hapticType={HapticType.Light}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={20}
              color={getNotificationColor(notification.type)}
            />
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={[
              styles.notificationTitle,
              !notification.is_read && styles.unreadText
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>
          <HapticPressable
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(notification.id)}
            hapticType={HapticType.Light}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </HapticPressable>
        </View>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>
            {formatDate(notification.created_at)}
          </Text>
          {!notification.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </HapticPressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with your latest activities</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with your latest activities</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load notifications</Text>
          <Text style={styles.errorMessage}>
            Please check your internet connection and try again.
          </Text>
          <HapticPressable style={styles.retryButton} onPress={() => refetch()} hapticType={HapticType.Medium}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </HapticPressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Stay updated with your latest activities</Text>
        
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            <HapticPressable 
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              hapticType={HapticType.Medium}
            >
              <Ionicons name="checkmark-done" size={16} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Mark All Read</Text>
            </HapticPressable>
            <HapticPressable 
              style={styles.actionButton}
              onPress={handleClearAll}
              disabled={clearAllMutation.isPending}
              hapticType={HapticType.Warning}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Clear All</Text>
            </HapticPressable>
          </View>
        )}
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              You'll receive notifications about your bids, job updates, payments, and more.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map(renderNotification)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
fontFamily: 'Montserrat',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#6B7280',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
});