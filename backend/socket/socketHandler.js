const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store active users
const activeUsers = new Map();

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);
    
    // Store active user
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Emit online status to relevant users
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Verify user is part of this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          'participants.user': socket.userId
        });

        if (conversation) {
          socket.join(`conversation_${conversationId}`);
          console.log(`📨 User ${socket.userName} joined conversation: ${conversationId}`);
          
          // Mark messages as read
          await conversation.markAsRead(socket.userId);
          
          // Notify other participants that user joined
          socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
            userId: socket.userId,
            userName: socket.userName,
            conversationId
          });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);
      console.log(`📤 User ${socket.userName} left conversation: ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, messageType = 'text', conversationId, orderReference } = data;

        // Validate receiver
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return socket.emit('error', { message: 'Receiver not found' });
        }

        // Generate conversation ID if not provided
        let finalConversationId = conversationId;
        if (!finalConversationId) {
          finalConversationId = Conversation.generateConversationId(socket.userId, receiverId);
        }

        // Create or find conversation
        let conversation = await Conversation.findById(finalConversationId);
        
        if (!conversation) {
          // Determine conversation type
          let conversationType = 'VENDOR_CENTER';
          if (socket.userRole === 'ADMIN' || receiver.role === 'ADMIN') {
            conversationType = socket.userRole === 'ADMIN' ? 
              `${receiver.role}_ADMIN` : `${socket.userRole}_ADMIN`;
          }

          conversation = new Conversation({
            _id: finalConversationId,
            participants: [
              { user: socket.userId, role: socket.userRole },
              { user: receiverId, role: receiver.role }
            ],
            conversationType,
            orderReference
          });
          
          await conversation.save();
        }

        // Create message
        const message = new Message({
          conversationId: finalConversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
          orderReference
        });

        await message.save();

        // Populate sender information
        await message.populate('sender', 'name role');

        // Update conversation with last message
        await conversation.updateLastMessage(message);

        // Emit message to conversation room
        io.to(`conversation_${finalConversationId}`).emit('new_message', {
          message: message.toJSON(),
          conversationId: finalConversationId
        });

        // Send notification to receiver if they're online but not in conversation
        const receiverSocket = activeUsers.get(receiverId);
        if (receiverSocket && !io.sockets.adapter.rooms.get(`conversation_${finalConversationId}`)?.has(receiverSocket.socketId)) {
          io.to(`user_${receiverId}`).emit('message_notification', {
            message: message.toJSON(),
            conversationId: finalConversationId,
            sender: {
              id: socket.userId,
              name: socket.userName,
              role: socket.userRole
            }
          });
        }

        console.log(`💬 Message sent from ${socket.userName} to ${receiver.name}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId } = data;
        
        // Mark messages as read
        await Message.updateMany(
          {
            conversationId,
            receiver: socket.userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );

        // Update conversation unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          await conversation.markAsRead(socket.userId);
        }

        // Notify sender about read status
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        conversationId
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle order updates
    socket.on('order_update', async (data) => {
      try {
        const { orderId, status, message, receiverId } = data;
        
        // Create system message for order update
        const conversationId = Conversation.generateConversationId(socket.userId, receiverId);
        
        const systemMessage = new Message({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content: message || `Order ${orderId} status updated to ${status}`,
          messageType: 'order_update',
          orderReference: orderId
        });

        await systemMessage.save();
        await systemMessage.populate('sender', 'name role');

        // Emit to conversation
        io.to(`conversation_${conversationId}`).emit('order_update_message', {
          message: systemMessage.toJSON(),
          orderId,
          status
        });

        // Send notification
        io.to(`user_${receiverId}`).emit('order_notification', {
          orderId,
          status,
          message: systemMessage.content,
          from: socket.userName
        });

      } catch (error) {
        console.error('Error sending order update:', error);
      }
    });

    // Handle getting online users
    socket.on('get_online_users', () => {
      const onlineUsers = Array.from(activeUsers.values()).map(user => ({
        userId: user.userId,
        userName: user.userName,
        userRole: user.userRole,
        lastSeen: user.lastSeen
      }));
      
      socket.emit('online_users', onlineUsers);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.userName} - Reason: ${reason}`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);
      
      // Notify other users
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        userName: socket.userName,
        lastSeen: new Date()
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userName}:`, error);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = new Date();
    for (const [userId, user] of activeUsers.entries()) {
      if (now - user.lastSeen > 30 * 60 * 1000) { // 30 minutes
        activeUsers.delete(userId);
        console.log(`🧹 Cleaned up inactive user: ${user.userName}`);
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

module.exports = socketHandler;