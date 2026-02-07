import api from './authService';

export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    if (response.data.success) {
      return {
        notifications: response.data.data || [],
        unreadCount: response.data.unreadCount || 0,
      };
    }
    return { notifications: [], unreadCount: 0 };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load notifications';
    throw new Error(message);
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update notification';
    throw new Error(message);
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.post('/notifications/read-all');
    if (response.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update notifications';
    throw new Error(message);
  }
};
