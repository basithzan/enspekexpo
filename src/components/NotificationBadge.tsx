import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotifications } from '../api/hooks/useNotifications';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  maxCount?: number;
}

export default function NotificationBadge({ 
  size = 'medium', 
  showCount = true, 
  maxCount = 99 
}: NotificationBadgeProps) {
  const { data: notificationsData } = useNotifications();
  
  const notifications = notificationsData?.notifications || notificationsData?.alerts || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  if (unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.badge, sizeStyles.container]}>
      {showCount && (
        <Text style={[styles.badgeText, sizeStyles.text]}>
          {displayCount}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    height: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  smallContainer: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 10,
  },
  mediumContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeContainer: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
  },
  largeText: {
    fontSize: 14,
  },
});
