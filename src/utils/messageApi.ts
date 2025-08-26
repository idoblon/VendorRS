import axiosInstance from './axios';

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  receiver: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'order_update' | 'system';
  attachments?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
  }[];
  isRead: boolean;
  readAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: {
    user: {
      _id: string;
      name: string;
      role: string;
      businessName?: string;
    };
    role: string;
  }[];
  conversationType: 'VENDOR_CENTER' | 'VENDOR_ADMIN' | 'CENTER_ADMIN' | 'GROUP';
  title: string;
  description?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
    messageType: string;
  };
  unreadCount: {
    user: string;
    count: number;
  }[];
  isActive: boolean;
  metadata: {
    totalMessages: number;
    lastActivityAt: Date;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Get user's conversations
export const getConversations = async (page = 1, limit = 20): Promise<ConversationsResponse> => {
  try {
    const response = await axiosInstance.get(`/api/messages/conversations?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get conversation by ID
export const getConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    const response = await axiosInstance.get(`/api/messages/conversations/${conversationId}`);
    return response.data.data.conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Get messages in a conversation
export const getMessages = async (conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
  try {
    const response = await axiosInstance.get(`/api/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (messageData: {
  conversationId: string;
  receiver: string;
  content: string;
  messageType?: string;
}): Promise<Message> => {
  try {
    const response = await axiosInstance.post('/api/messages', messageData);
    return response.data.data.message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    await axiosInstance.post(`/api/messages/conversations/${conversationId}/mark-read`);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get('/api/messages/unread-count');
    return response.data.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Start a new conversation by sending the first message
export const startConversation = async (receiverId: string, initialMessage: string): Promise<{ message: Message; conversationId: string }> => {
  try {
    const response = await axiosInstance.post('/api/messages', {
      receiver: receiverId,
      content: initialMessage,
      messageType: 'text'
    });
    return {
      message: response.data.data.message,
      conversationId: response.data.data.conversationId
    };
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};