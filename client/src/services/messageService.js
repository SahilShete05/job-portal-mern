import api from './authService';

export const getConversations = async () => {
  try {
    const response = await api.get('/messages/conversations');
    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load conversations';
    throw new Error(message);
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load messages';
    throw new Error(message);
  }
};

export const sendMessage = async ({ content, receiverId, conversationId, jobId }) => {
  try {
    const response = await api.post('/messages', {
      content,
      receiverId,
      conversationId,
      jobId,
    });

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send message';
    throw new Error(message);
  }
};
