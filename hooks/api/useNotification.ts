import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/lib/api/services/notification.service';
import { Notification } from '@/types/notification';
import { PageResponse } from '@/types/page-response';

const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (page: number, size: number) => [...NOTIFICATION_KEYS.lists(), page, size] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unreadCount'] as const,
};

export const useNotifications = (page = 0, size = 20) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery<PageResponse<Notification>>({
    queryKey: NOTIFICATION_KEYS.list(page, size),
    queryFn: () => notificationService.getNotifications(token!, page, size),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUnreadCount = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(token!),
    enabled: !!token,
    staleTime: 60 * 1000, // refresh every minute
    refetchInterval: 60000, // optional: refetch every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(token!, notificationId),
    onSuccess: () => {
      // Invalidate notifications lists and unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
};
