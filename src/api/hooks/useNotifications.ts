import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Client Notifications Hook
export function useClientNotifications() {
  return useQuery({
    queryKey: ['client-notifications'],
    queryFn: async () => {
      const response = await apiClient.post('/get-client-alerts');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Inspector Notifications Hook
export function useInspectorNotifications() {
  return useQuery({
    queryKey: ['inspector-notifications'],
    queryFn: async () => {
      const response = await apiClient.post('/get-inspector-alerts');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Generic Notifications Hook (tries both endpoints)
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        // Try client alerts first
        const clientResponse = await apiClient.post('/get-client-alerts');
        if (clientResponse.data?.success) {
          return {
            ...clientResponse.data,
            type: 'client'
          };
        }
      } catch (error) {
        // Client alerts failed, try inspector alerts
      }

      try {
        // Try inspector alerts
        const inspectorResponse = await apiClient.post('/get-inspector-alerts');
        if (inspectorResponse.data?.success) {
          return {
            ...inspectorResponse.data,
            type: 'inspector'
          };
        }
      } catch (error) {
        // Inspector alerts failed, try general notifications
      }

      try {
        // Try general notifications endpoint
        const generalResponse = await apiClient.post('/get-notifications');
        if (generalResponse.data?.success) {
          return {
            ...generalResponse.data,
            type: 'general'
          };
        }
      } catch (error) {
        // All notification endpoints failed
      }

      // Return empty state if all endpoints fail
      return {
        success: true,
        notifications: [],
        total_count: 0,
        unread_count: 0,
        type: 'empty'
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiClient.post('/mark-notification-read', {
        notification_id: notificationId
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['inspector-notifications'] });
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/mark-all-notifications-read');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['inspector-notifications'] });
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiClient.post('/delete-notification', {
        notification_id: notificationId
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['inspector-notifications'] });
    },
  });
}

// Clear all notifications
export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/clear-all-notifications');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['inspector-notifications'] });
    },
  });
}
