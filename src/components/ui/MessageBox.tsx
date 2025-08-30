import { useState, useEffect } from "react";
import {
  X,
  Send,
  MessageCircle,
  Building,
  Plus,
  Search,
  Shield,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  startConversation,
  type Conversation as ConversationType,
  type Message as MessageType,
} from "../../utils/messageApi";

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "centers" | "admin" | "conversations";
}


interface Center {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  district?: string;
  province?: string;
  location?: string;
  address?: string;
  contactPerson?: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  department?: string;
}

export function MessageBox({ isOpen, onClose, defaultView = "conversations" }: MessageBoxProps) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activeTab, setActiveTab] = useState<"conversations" | "new">("conversations");
  // Removed userTypeFilter state as per new requirement
  const [searchTerm, setSearchTerm] = useState("");

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/api/auth/verify-token");
      if (response.data.success) {
        setCurrentUserId(response.data.data.user._id);
        setCurrentUserRole(response.data.data.user.role);
        console.log("Current user role:", response.data.data.user.role);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      setMessages(response.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Find the receiver ID from the current conversation
      const conversation = conversations.find(c => c._id === selectedConversation);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Get the receiver (the other participant)
      const receiver = conversation.participants.find(p => p.user._id !== currentUserId);
      if (!receiver) {
        throw new Error("Receiver not found");
      }

      await sendMessage({
        conversationId: selectedConversation,
        receiver: receiver.user._id,
        content: newMessage,
        messageType: "text",
      });
      setNewMessage("");
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    }
  };

  const fetchUsers = async () => {
    try {
      if (currentUserRole === "ADMIN") {
        // Admin can message both vendors and centers
        const [vendorsResponse, centersResponse] = await Promise.all([
          axiosInstance.get("/api/users/messaging/vendors"),
          axiosInstance.get("/api/users/messaging/centers"),
        ]);
        console.log("Vendors response:", vendorsResponse.data);
        console.log("Centers response:", centersResponse.data);
        setCenters(centersResponse.data.data.centers || []);
        setAdmins(vendorsResponse.data.data.vendors || []); // Using admins state for vendors for admin
      } else if (currentUserRole === "VENDOR" || currentUserRole === "CENTER") {
        // Vendor/Center can message centers and admins
        const [centersResponse, adminsResponse] = await Promise.all([
          axiosInstance.get("/api/users/messaging/centers"),
          axiosInstance.get("/api/users/messaging/admins"),
        ]);
        console.log("Centers response:", centersResponse.data);
        console.log("Admins response:", adminsResponse.data);
        setCenters(centersResponse.data.data.centers || []);
        setAdmins(adminsResponse.data.data.admins || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Set empty arrays to prevent UI errors
      setCenters([]);
      setAdmins([]);
    }
  };

  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      const initialMessage = `Hello ${userName}, I'd like to start a conversation with you.`;
      const result = await startConversation(userId, initialMessage);

      // Refresh conversations to show the new one
      await fetchConversations();

      // Select the new conversation
      setSelectedConversation(result.conversationId);

      // Switch back to conversations tab
      setActiveTab("conversations");

      // Clear search
      setSearchTerm("");
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Failed to start conversation");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchConversations();
      if (currentUserRole === "vendor" || currentUserRole === "center" || currentUserRole === "ADMIN") {
        fetchUsers();
      }
      
      // Set default view based on prop
      if (defaultView === "centers" || defaultView === "admin") {
        setActiveTab("new");
      }
    }
  }, [isOpen, defaultView, currentUserRole]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Filter users based on search term - show both centers and admins together
  const filteredUsers = () => {
    const allUsers = [
      ...centers.map(center => ({ ...center, type: "center" as const })),
      ...admins.map(admin => ({ ...admin, type: "admin" as const }))
    ];

    if (!searchTerm.trim()) {
      return allUsers;
    }

    const searchTermLower = searchTerm.toLowerCase();
    return allUsers.filter(user => {
      // Common fields for all users
      const matchesName = user.name.toLowerCase().includes(searchTermLower);
      const matchesEmail = user.email.toLowerCase().includes(searchTermLower);
      const matchesType = user.type.toLowerCase().includes(searchTermLower);
      
      // Type-specific fields
      let matchesSpecific = false;
      if (user.type === "center") {
        matchesSpecific = (user.district && user.district.toLowerCase().includes(searchTermLower)) || false;
      } else if (user.type === "admin") {
        matchesSpecific = (user.department && user.department.toLowerCase().includes(searchTermLower)) || false;
      }

      return matchesName || matchesEmail || matchesType || matchesSpecific;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-8 w-[450px] h-[600px] bg-white shadow-2xl rounded-lg border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Messages</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "conversations" ? "new" : "conversations")}
            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
            title={activeTab === "conversations" ? "New Conversation" : "Back to Conversations"}
          >
            {activeTab === "conversations" ? (
              <Plus className="h-4 w-4 text-blue-600" />
            ) : (
              <MessageSquare className="h-4 w-4 text-blue-600" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* New Conversation Panel */}
      {activeTab === "new" && (
        <div className="border-b bg-gray-50 p-4">
          {/* Removed Filter Tabs as per new requirement */}
          {/* <div className="flex gap-1 mb-3 bg-white p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setUserTypeFilter("all")}
              className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                userTypeFilter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUserTypeFilter("centers")}
              className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                userTypeFilter === "centers" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Centers
            </button>
            <button
              onClick={() => setUserTypeFilter("admin")}
              className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                userTypeFilter === "admin" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Admin
            </button>
          </div> */}

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredUsers().map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all"
                onClick={() => handleStartConversation(user._id, user.name)}
              >
                <div className="flex-shrink-0">
                  {user.type === "center" ? (
                    <Building className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {user.type === "center" 
                      ? `${user.district || "Center"} • ${user.status}`
                      : `${user.department || "Admin"} • ${user.status}`
                    }
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            {filteredUsers().length === 0 && searchTerm && (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  No users found matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Conversations List */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new conversation above</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation._id)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation._id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {conversation.conversationType === "VENDOR_CENTER" ? (
                        <Building className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {(() => {
                      const userUnread = conversation.unreadCount.find(uc => uc.user === currentUserId);
                      return userUnread && userUnread.count > 0 ? (
                        <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {userUnread.count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="w-1/2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        message.sender._id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender._id === currentUserId
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span className="text-sm">Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
