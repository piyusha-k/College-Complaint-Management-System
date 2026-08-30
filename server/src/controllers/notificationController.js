const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { limit, unreadOnly } = req.query;
      const result = await notificationService.getUserNotifications(req.user.id, {
        limit,
        unreadOnly: unreadOnly === 'true',
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(req.user.id, id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
