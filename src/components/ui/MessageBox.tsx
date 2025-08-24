import { useState, useEffect } from "react";
import { X, Send, User, Bot, MessageCircle, Phone, Store, Building, Plus, Search } from "lucide-react";
import axiosInstance from '../../utils/axios';
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
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
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'new'>('conversations');
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Mock Nepalese vendor data from AdminDashboard
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      _id: "1",
      name: "Himalayan Handicrafts Pvt. Ltd.",
      businessName: "Himalayan Handicrafts Pvt. Ltd.",
      email: "info@himalayanhandicrafts.com.np",
      phone: "+977-9841234567",
      address: "Thamel, Kathmandu-29, Nepal",
      businessType: "Handicrafts & Souvenirs",
      status: "APPROVED",
      role: "vendor"
    },
    {
      _id: "2",
      name: "Everest Organic Tea Company",
      businessName: "Everest Organic Tea Company",
      email: "sales@everestorganictea.com",
      phone: "+977-9851234568",
      address: "Ilam Tea Garden, Ilam-56700, Nepal",
      businessType: "Organic Tea & Beverages",
      status: "APPROVED",
      role: "vendor"
    },
    {
      _id: "4",
      name: "Sherpa Adventure Gear",
      businessName: "Sherpa Adventure Gear",
      email: "gear@sherpaadventure.com.np",
      phone: "+977-9871234570",
      address: "Namche Bazaar, Solukhumbu-56000, Nepal",
      businessType: "Outdoor & Adventure Equipment",
      status: "APPROVED",
      role: "vendor"
    },
    {
      _id: "5",
      name: "Pashmina Palace Nepal",
      businessName: "Pashmina Palace Nepal",
      email: "info@pashminapalace.com.np",
      phone: "+977-9881234571",
      address: "Durbar Marg, Kathmandu-44600, Nepal",
      businessType: "Textiles & Fashion",
      status: "APPROVED",
      role: "vendor"
    },
    {
      _id: "7",
      name: "Bhaktapur Pottery Works",
      businessName: "Bhaktapur Pottery Works",
      email: "pottery@bhaktapurworks.com.np",
      phone: "+977-9801234573",
      address: "Pottery Square, Bhaktapur-44800, Nepal",
      businessType: "Ceramics & Pottery",
      status: "APPROVED",
      role: "vendor"
    },
    {
      _id: "9",
      name: "Lumbini Meditation Supplies",
      businessName: "Lumbini Meditation Supplies",
      email: "peace@lumbinimeditation.com.np",
      phone: "+977-9821234575",
      address: "Lumbini-32900, Rupandehi, Nepal",
      businessType: "Spiritual & Wellness",
      status: "APPROVED",
      role: "vendor"
    }
  ]);

  // Mock Nepalese center data from AdminDashboard
  const [centers, setCenters] = useState<Center[]>([
    {
      _id: "1",
      name: "Kathmandu Distribution Center",
      email: "ram@ktm-center.com",
      phone: "+977-9801234567",
      status: "active",
      role: "center",
      district: "Kathmandu",
      province: "Bagmati Province",
      location: "Kathmandu, Bagmati Province",
      address: "Industrial Area, Balaju-16, Kathmandu",
      contactPerson: "Ram Bahadur Sharma"
    },
    {
      _id: "2",
      name: "Pokhara Distribution Center",
      email: "sunita@pokhara-center.com",
      phone: "+977-9801234568",
      status: "active",
      role: "center",
      district: "Pokhara",
      province: "Gandaki Province",
      location: "Pokhara, Gandaki Province",
      address: "Lakeside Road, Pokhara-33, Gandaki Province",
      contactPerson: "Sunita Shrestha"
    },
    {
      _id: "4",
      name: "Chitwan Distribution Center",
      email: "maya@chitwan-center.com",
      phone: "+977-9801234570",
      status: "active",
      role: "center",
      district: "Chitwan",
      province: "Bagmati Province",
      location: "Bharatpur, Chitwan",
      address: "Narayanghat-Mugling Highway, Bharatpur-10",
      contactPerson: "Maya Tamang"
    },
    {
      _id: "5",
      name: "Dharan Distribution Center",
      email: "bikash@dharan-center.com",
      phone: "+977-9801234571",
      status: "active",
      role: "center",
      district: "Dharan",
      province: "Province 1",
      location: "Dharan, Province 1",
      address: "BP Highway, Dharan-17, Sunsari",
      contactPerson: "Bikash Rai"
    }
  ]);

  const [selectedUserToMessage, setSelectedUserToMessage] = useState<{
    userId: string;
    userType: 'vendor' | 'center';
    name: string;
    email: string;
  } | null>(null);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setCurrentUserId(data.user._id);
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
      setError("Failed to fetch conversations");
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove the fetchVendorsAndCenters function since we're using mock data

  const fetchVendorsAndCenters = async () => {
    try {
      setLoading(true);
      const [vendorsResponse, centersResponse] = await Promise.all([
        axiosInstance.get('/api/users/vendors'),
        axiosInstance.get('/api/users/centers')
      ]);
      
      setVendors(vendorsResponse.data.data.vendors.filter((v: Vendor) => v.status === 'APPROVED'));
      setCenters(centersResponse.data.data.centerUsers.filter((c: Center) => c.status === 'APPROVED'));
    } catch (error) {
      console.error("Failed to fetch vendors and centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMessages(conversationId);
      setMessages(response.messages);
    } catch (error) {
      setError("Failed to fetch messages");
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      setError(null);
      
      const conversation = conversations.find(c => c._id === selectedConversation);
      if (!conversation) throw new Error("Conversation not found");

      const receiver = conversation.participants.find(p => p.user._id !== currentUserId);
      if (!receiver) throw new Error("Receiver not found");

      await sendMessage({
        conversationId: selectedConversation,
        receiver: receiver.user._id,
        content: newMessage,
        messageType: "text"
      });

      setNewMessage("");
      await fetchMessages(selectedConversation);
      await fetchConversations();
    } catch (error) {
      setError("Failed to send message");
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (userId: string, userType: 'vendor' | 'center') => {
    try {
      setLoading(true);
      
      // Check if conversation already exists
      const existingConversation = conversations.find(convo => 
        convo.participants.some(p => p.user._id === userId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation._id);
        setActiveTab('conversations');
        return;
      }

      // Create new conversation
      const response = await axiosInstance.post('/api/messages/conversations', {
        participantId: userId,
        conversationType: userType === 'vendor' ? 'VENDOR_ADMIN' : 'CENTER_ADMIN'
      });

      const newConversation = response.data.data.conversation;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation._id);
      setActiveTab('conversations');
    } catch (error) {
      setError("Failed to start conversation");
      console.error("Failed to start conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const getConversationTitle = (conversation: ConversationType) => {
    const otherParticipant = conversation.participants.find(p => p.user._id !== currentUserId);
    if (!otherParticipant) return "Unknown";
    
    const { user } = otherParticipant;
    const role = user.role === "vendor" ? "Vendor" : user.role === "center" ? "Center" : "User";
    return user.businessName || user.name || `${role} User`;
  };

  const getConversationIcon = (conversation: ConversationType) => {
    const otherParticipant = conversation.participants.find(p => p.user._id !== currentUserId);
    if (!otherParticipant) return <User className="h-5 w-5" />;
    
    switch (otherParticipant.user.role) {
      case "vendor":
        return <Store className="h-5 w-5 text-purple-500" />;
      case "center":
        return <Building className="h-5 w-5 text-green-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredVendors = vendors.filter(vendor => 
    vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCenters = centers.filter(center => 
    center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-[800px] h-[600px] bg-white rounded-lg shadow-xl flex overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages {unreadCount > 0 && `(${unreadCount})`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'conversations' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'new' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              New Message
            </button>
          </div>
        </div>

        {/* Search */}
        {activeTab === 'new' && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors or centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'conversations' ? (
          <>
            {loading && <div className="p-4 text-center text-gray-500">Loading conversations...</div>}
            {error && <div className="p-4 text-red-500 text-center text-sm">{error}</div>}

            {!loading && !error && conversations.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p className="mb-2">No conversations yet</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Start a new conversation
                </button>
              </div>
            )}

            {!loading && !error && conversations.map((convo) => {
              const otherParticipant = convo.participants.find(p => p.user._id !== currentUserId);
              const title = getConversationTitle(convo);
              const icon = getConversationIcon(convo);
              const unread = convo.unreadCount.reduce((acc, uc) => acc + uc.count, 0);

              return (
                <div
                  key={convo._id}
                  onClick={() => setSelectedConversation(convo._id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${
                    selectedConversation === convo._id ? "bg-white border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm truncate">
                          {title}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {convo.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {convo.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="p-4">
            {loading && <div className="text-center py-4">Loading...</div>}
            
            {/* Vendors Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Store className="h-4 w-4" />
                Vendors
              </h3>
              {filteredVendors.length === 0 ? (
                <p className="text-sm text-gray-500">No vendors found</p>
              ) : (
                <div className="space-y-2">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      onClick={() => setSelectedUserToMessage({
                        userId: vendor._id,
                        userType: 'vendor',
                        name: vendor.businessName || vendor.name,
                        email: vendor.email
                      })}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{vendor.businessName || vendor.name}</p>
                          <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                        </div>
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Centers Section */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Distribution Centers
              </h3>
              {filteredCenters.length === 0 ? (
                <p className="text-sm text-gray-500">No centers found</p>
              ) : (
                <div className="space-y-2">
                  {filteredCenters.map((center) => (
                    <div
                      key={center._id}
                      onClick={() => setSelectedUserToMessage({
                        userId: center._id,
                        userType: 'center',
                        name: center.name,
                        email: center.email
                      })}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{center.name}</p>
                          <p className="text-xs text-gray-500 truncate">{center.district || center.email}</p>
                        </div>
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {getConversationIcon(conversations.find(c => c._id === selectedConversation)!)}
              {getConversationTitle(conversations.find(c => c._id === selectedConversation)!)}
            </h2>
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {loading && !selectedConversation && <div className="text-center text-gray-500">Select a conversation to view messages</div>}
          {loading && selectedConversation && <div className="text-center text-gray-500">Loading messages...</div>}
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}

          {!loading && !error && !selectedConversation && (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}

          {!loading && !error && selectedConversation && messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-start gap-3 mb-4 ${msg.sender.role === "admin" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender.role !== "admin" && (
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div
                className={`max-w-[70%] ${msg.sender.role === "admin" ? "bg-blue-500 text-white" : "bg-white text-gray-900 border border-gray-200"} p-3 rounded-lg shadow-sm`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-sm font-medium ${msg.sender.role === "admin" ? "text-white" : "text-gray-700"}`}>
                    {msg.sender.name}
                  </span>
                  <span className={`text-xs ${msg.sender.role === "admin" ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.sender.role === "admin" && (
                <div className="flex-shrink-0">
                  <Bot className="h-8 w-8 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedConversation && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className={`px-4 py-3 rounded-lg ${loading || !newMessage.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
