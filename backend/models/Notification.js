const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  type: {
    type: String,
    enum: ['VENDOR_APPLICATION', 'STATUS_UPDATE', 'ORDER_UPDATE', 'SYSTEM', 'MESSAGE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Users', 'Order', 'Product']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update updatedAt field before saving
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Create notification for all admins
notificationSchema.statics.notifyAdmins = async function(data) {
  try {
    const User = mongoose.model('Users');
    const admins = await User.find({ role: 'ADMIN', isActive: true });
    
    const notifications = [];
    
    for (const admin of admins) {
      const notificationData = {
        recipient: admin._id,
        ...data
      };
      
      notifications.push(notificationData);
    }
    
    if (notifications.length > 0) {
      return this.insertMany(notifications);
    }
    
    return [];
  } catch (error) {
    console.error('Error creating admin notifications:', error);
    throw error;
  }
};

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);