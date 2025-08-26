import { useState, useEffect } from "react";
import {
  X,
  Send,
  User,
  Bot,
  MessageCircle,
  Phone,
  Store,
  Building,
  Plus,
  Search,
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  startConversation,
  type Conversation as ConversationType,
  type Message as MessageType,
} from "../../utils/messageApi";

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Vendor {
  _id: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  businessType?: string;
  address?: string;
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

export function MessageBox({ isOpen, onClose }: MessageBoxProps) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/api/auth/verify-token");
      if (response.data.success) {
        setCurrentUserId(response.data.data.user._id);
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
      await sendMessage({
        conversationId: selectedConversation,
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

  const fetchVendorsAndCenters = async () => {
    try {
      const [vendorsResponse, centersResponse] = await Promise.all([
        axiosInstance.get("/vendors"),
        axiosInstance.get("/centers"),
      ]);
      setVendors(vendorsResponse.data.vendors || []);
      setCenters(centersResponse.data.centers || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchConversations();
      fetchVendorsAndCenters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCenters = centers.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-8 w-96 h-[600px] bg-white shadow-2xl rounded-lg border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Messages</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewConversation(!showNewConversation)}
            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
            title="New Conversation"
          >
            <Plus className="h-4 w-4 text-blue-600" />
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
      {showNewConversation && (
        <div className="border-b bg-gray-50 p-4">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor._id}
                className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                onClick={() =>
                  handleStartConversation(vendor._id, vendor.name, "vendor")
                }
              >
                <Store className="h-4 w-4 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {vendor.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {vendor.email}
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {vendor.businessType || "Vendor"} • {vendor.status}
                  </p>
                </div>
              </div>
            ))}
            {filteredCenters.map((center) => (
              <div
                key={center._id}
                className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                onClick={() =>
                  handleStartConversation(center._id, center.name, "center")
                }
              >
                <Building className="h-4 w-4 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {center.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {center.email}
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {center.district}, {center.province} • {center.status}
                  </p>
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 &&
              filteredCenters.length === 0 &&
              searchTerm && (
                <div className="p-4 text-center text-gray-500">
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
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
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
                        <Store className="h-4 w-4 text-green-600" />
                      ) : (
                        <Building className="h-4 w-4 text-blue-600" />
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
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
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
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a conversation</p>
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

const handleStartConversation = async (
  userId: string,
  userName: string,
  userType: "vendor" | "center"
) => {
  try {
    const initialMessage = `Hello ${userName}, I'd like to start a conversation with you.`;
    const result = await startConversation(userId, initialMessage);

    // Refresh conversations to show the new one
    await fetchConversations();

    // Select the new conversation
    setSelectedConversation(result.conversationId);

    // Close the new conversation panel
    setShowNewConversation(false);

    // Clear search
    setSearchTerm("");
  } catch (error) {
    console.error("Error starting conversation:", error);
    // You might want to show an error message to the user
  }
};
