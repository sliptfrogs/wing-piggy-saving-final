import { Notification } from "@/types/notification";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { PageResponse } from "@/types/page-response";

export const notificationService = {
  getNotifications: (
    token: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<Notification>> => {
    return apiClient.get<PageResponse<Notification>>(
      `${API_ENDPOINTS.notification.list}?page=${page}&size=${size}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  getUnreadCount: (token: string): Promise<number> => {
    return apiClient.get<number>(API_ENDPOINTS.notification.unreadCount, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  markAsRead: (token: string, notificationId: string): Promise<void> => {
    return apiClient.patch<void>(
      API_ENDPOINTS.notification.markAsRead(notificationId),
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },

  markAllAsRead: (token: string): Promise<void> => {
    return apiClient.patch<void>(
      API_ENDPOINTS.notification.markAllAsRead,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
};
