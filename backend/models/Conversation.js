const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['VENDOR', 'CENTER', 'ADMIN'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  conversationType: {
    type: String,
    enum: ['VENDOR_CENTER', 'VENDOR_ADMIN', 'CENTER_ADMIN', 'GROUP'],
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'order_update', 'system'],
      default: 'text'
    }
  },
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  orderReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    retentionDays: {
      type: Number,
      default: 365
    }
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    firstMessageAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate conversation ID based on participants
conversationSchema.statics.generateConversationId = function(participant1, participant2) {
  const ids = [participant1.toString(), participant2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Update last activity and unread counts
conversationSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content,
    sender: message.sender,
    timestamp: message.createdAt,
    messageType: message.messageType
  };
  
  this.metadata.lastActivityAt = new Date();
  this.metadata.totalMessages += 1;
  
  if (!this.metadata.firstMessageAt) {
    this.metadata.firstMessageAt = message.createdAt;
  }
  
  // Update unread count for receiver
  const receiverUnread = this.unreadCount.find(uc => 
    uc.user.toString() === message.receiver.toString()
  );
  
  if (receiverUnread) {
    receiverUnread.count += 1;
  } else {
    this.unreadCount.push({
      user: message.receiver,
      count: 1
    });
  }
  
  return this.save();
};

// Mark messages as read for a user
conversationSchema.methods.markAsRead = function(userId) {
  const userUnread = this.unreadCount.find(uc => 
    uc.user.toString() === userId.toString()
  );
  
  if (userUnread) {
    userUnread.count = 0;
  }
  
  // Update participant's last seen
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastSeen = new Date();
  }
  
  return this.save();
};

// Update updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ conversationType: 1, isActive: 1 });
conversationSchema.index({ 'metadata.lastActivityAt': -1 });

module.exports = mongoose.model('Conversation', conversationSchema);