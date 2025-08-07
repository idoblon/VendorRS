import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface ChatContact {
  id: string;
  name: string;
  role: 'vendor' | 'center';
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatInterfaceProps {
  currentUserId: string;
  currentUserName: string;
  userRole: 'vendor' | 'center';
}

export function ChatInterface({ currentUserId, currentUserName, userRole }: ChatInterfaceProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [contactId: string]: Message[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock contacts based on user role
  const mockContacts: ChatContact[] = userRole === 'vendor' ? [
    {
      id: 'center-1',
      name: 'Delhi Distribution Center',
      role: 'center',
      lastMessage: 'Order ORD-001 has been confirmed',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 'center-2',
      name: 'Mumbai Center',
      role: 'center',
      lastMessage: 'Payment received successfully',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: true
    },
    {
      id: 'center-3',
      name: 'Bangalore Tech Hub',
      role: 'center',
      lastMessage: 'Thank you for the quick delivery',
      lastMessageTime: '1 day ago',
      unreadCount: 1,
      isOnline: false
    }
  ] : [
    {
      id: 'vendor-1',
      name: 'Kumar Electronics',
      role: 'vendor',
      lastMessage: 'Products are ready for shipment',
      lastMessageTime: '5 min ago',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: 'vendor-2',
      name: 'Office Solutions',
      role: 'vendor',
      lastMessage: 'Can we discuss bulk pricing?',
      lastMessageTime: '30 min ago',
      unreadCount: 0,
      isOnline: true
    },
    {
      id: 'vendor-3',
      name: 'Tech Supplies Co',
      role: 'vendor',
      lastMessage: 'Order will be delivered tomorrow',
      lastMessageTime: '2 hours ago',
      unreadCount: 3,
      isOnline: false
    }
  ];

  // Mock initial messages
  const mockMessages: { [contactId: string]: Message[] } = {
    'center-1': [
      {
        id: '1',
        senderId: 'center-1',
        senderName: 'Delhi Distribution Center',
        content: 'Hello! We received your order ORD-001.',
        timestamp: '10:30 AM',
        type: 'text'
      },
      {
        id: '2',
        senderId: currentUserId,
        senderName: currentUserName,
        content: 'Great! When can we expect delivery?',
        timestamp: '10:32 AM',
        type: 'text'
      },
      {
        id: '3',
        senderId: 'center-1',
        senderName: 'Delhi Distribution Center',
        content: 'Order ORD-001 has been confirmed. Expected delivery: Jan 25, 2024',
        timestamp: '10:35 AM',
        type: 'text'
      }
    ],
    'vendor-1': [
      {
        id: '1',
        senderId: 'vendor-1',
        senderName: 'Kumar Electronics',
        content: 'Hi! Your order for wireless headphones is ready.',
        timestamp: '2:15 PM',
        type: 'text'
      },
      {
        id: '2',
        senderId: currentUserId,
        senderName: currentUserName,
        content: 'Perfect! Can you arrange pickup today?',
        timestamp: '2:18 PM',
        type: 'text'
      },
      {
        id: '3',
        senderId: 'vendor-1',
        senderName: 'Kumar Electronics',
        content: 'Products are ready for shipment. Pickup scheduled for 4 PM.',
        timestamp: '2:20 PM',
        type: 'text'
      }
    ]
  };

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), message]
    }));

    setNewMessage('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const contact = mockContacts.find(c => c.id === selectedContact);
      if (contact) {
        const responses = [
          'Thank you for your message!',
          'I\'ll get back to you shortly.',
          'Noted. Will update you soon.',
          'Thanks for the information.',
          'Understood. Processing your request.'
        ];
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedContact,
          senderName: contact.name,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };

        setMessages(prev => ({
          ...prev,
          [selectedContact]: [...(prev[selectedContact] || []), responseMessage]
        }));
      }
    }, 2000);
  };

  const selectedContactData = mockContacts.find(c => c.id === selectedContact);
  const currentMessages = selectedContact ? messages[selectedContact] || [] : [];

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-gradient-to-b from-slate-50 to-gray-50">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <p className="text-sm text-blue-100">
            {userRole === 'vendor' ? 'Chat with distribution centers' : 'Chat with vendors'}
          </p>
        </div>
        
        <div className="overflow-y-auto h-full">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                selectedContact === contact.id 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-600' 
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.name.charAt(0)}
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                    <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.role === 'vendor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {contact.role === 'vendor' ? 'Vendor' : 'Center'}
                    </span>
                    {contact.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContactData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedContactData.name.charAt(0)}
                    </div>
                    {selectedContactData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedContactData.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedContactData.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={Phone} className="text-blue-600 hover:bg-blue-50" />
                  <Button variant="ghost" size="sm" icon={Video} className="text-blue-600 hover:bg-blue-50" />
                  <Button variant="ghost" size="sm" icon={MoreVertical} className="text-gray-600 hover:bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-indigo-50/30">
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.senderId === currentUserId
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" icon={Paperclip} className="text-gray-600 hover:bg-gray-50" />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button variant="ghost" size="sm" icon={Smile} className="text-gray-600 hover:bg-gray-50" />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 rounded-full p-2"
                  icon={Send}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50/30 to-indigo-50/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a contact from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}