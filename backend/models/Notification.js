const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['VENDOR_APPLICATION', 'CENTER_APPLICATION', 'STATUS_UPDATE', 'ORDER_UPDATE', 'SYSTEM', 'MESSAGE'],
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
    enum: ['User', 'Order', 'Product']
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
    const User = mongoose.model('User'); // Fixed model name from 'Users' to 'User'
    console.log('Finding admin users for notifications');
    const admins = await User.find({ role: 'ADMIN', isActive: true });
    console.log(`Found ${admins.length} admin users for notifications`);
    
    const notifications = [];
    
    for (const admin of admins) {
      console.log(`Creating notification for admin: ${admin._id} (${admin.email})`);
      const notificationData = {
        recipient: admin._id,
        ...data
      };
      
      notifications.push(notificationData);
    }
    
    if (notifications.length > 0) {
      console.log(`Inserting ${notifications.length} notifications into database`);
      const result = await this.insertMany(notifications);
      console.log(`Successfully inserted ${result.length} notifications`);
      return result;
    }
    
    console.log('No notifications created - no active admins found');
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