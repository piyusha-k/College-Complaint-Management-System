const Notification = require('../models/Notification');
const { broadcastNotification } = require('../config/socket');

class NotificationService {
  /**
   * Create and broadcast a notification
   */
  async createNotification({ owner, workflowId = null, executionId = null, type = 'info', title, message }) {
    const notification = new Notification({
      owner,
      workflowId,
      executionId,
      type,
      title,
      message,
      isRead: false,
    });

    await notification.save();

    // Broadcast live over Socket.IO to the user's room
    broadcastNotification(owner?.toString(), {
      id: notification._id,
      workflowId,
      executionId,
      type,
      title,
      message,
      isRead: false,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * List notifications for user
   */
  async getUserNotifications(userId, { limit = 30, unreadOnly = false } = {}) {
    const filter = { owner: userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('workflowId', 'name')
      .populate('executionId', 'status');

    const unreadCount = await Notification.countDocuments({ owner: userId, isRead: false });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId, notificationId) {
    if (notificationId === 'all') {
      await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
      return { success: true, message: 'All notifications marked as read' };
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, owner: userId },
      { isRead: true },
      { new: true }
    );

    return { success: true, notification };
  }
}

module.exports = new NotificationService();
