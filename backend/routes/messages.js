const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateMessage, validateObjectId, validatePagination } = require('../middleware/validation');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'name role businessName')
    .populate('lastMessage.sender', 'name role')
    .sort({ 'metadata.lastActivityAt': -1 })
    .skip(skip)
    .limit(limit);

    const total = await Conversation.countDocuments({
      'participants.user': req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get conversation by ID
// @access  Private
router.get('/conversations/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'name role businessName email phone')
    .populate('orderReference', 'orderNumber status totalAmount');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you do not have access to it'
      });
    }

    res.json({
      success: true,
      data: { conversation }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', authenticate, validateObjectId('id'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user has access to this conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you do not have access to it'
      });
    }

    const messages = await Message.find({
      conversationId: req.params.id,
      isDeleted: false
    })
    .populate('sender', 'name role businessName')
    .populate('receiver', 'name role businessName')
    .populate('orderReference', 'orderNumber status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Message.countDocuments({
      conversationId: req.params.id,
      isDeleted: false
    });

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId: req.params.id,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update conversation unread count
    await conversation.markAsRead(req.user._id);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', authenticate, validateMessage, async (req, res) => {
  try {
    const { receiver, content, messageType, orderReference } = req.body;

    // Verify receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Generate conversation ID
    const conversationId = Conversation.generateConversationId(req.user._id, receiver);

    // Find or create conversation
    let conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      // Determine conversation type
      let conversationType = 'VENDOR_CENTER';
      if (req.user.role === 'ADMIN' || receiverUser.role === 'ADMIN') {
        conversationType = req.user.role === 'ADMIN' ? 
          `${receiverUser.role}_ADMIN` : `${req.user.role}_ADMIN`;
      }

      conversation = new Conversation({
        _id: conversationId,
        participants: [
          { user: req.user._id, role: req.user.role },
          { user: receiver, role: receiverUser.role }
        ],
        conversationType,
        orderReference
      });
      
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: req.user._id,
      receiver,
      content,
      messageType: messageType || 'text',
      orderReference
    });

    await message.save();

    // Update conversation with last message
    await conversation.updateLastMessage(message);

    // Populate message data
    await message.populate('sender', 'name role businessName');
    await message.populate('receiver', 'name role businessName');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { 
        message,
        conversationId
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to edit it'
      });
    }

    // Check if message is too old to edit (e.g., 15 minutes)
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }

    // Soft delete
    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      receiver: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not the recipient'
      });
    }

    if (!message.isRead) {
      await message.markAsRead();
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: { message }
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// @route   POST /api/messages/conversations/:id/mark-read
// @desc    Mark all messages in conversation as read
// @access  Private
router.post('/conversations/:id/mark-read', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    // Verify user has access to this conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you do not have access to it'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId: req.params.id,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update conversation unread count
    await conversation.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'All messages marked as read'
    });

  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for user
// @access  Private
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', authenticate, validatePagination, async (req, res) => {
  try {
    const { q, conversationId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search query
    const searchQuery = {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ],
      content: { $regex: q, $options: 'i' },
      isDeleted: false
    };

    if (conversationId) {
      searchQuery.conversationId = conversationId;
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'name role businessName')
      .populate('receiver', 'name role businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
});

module.exports = router;