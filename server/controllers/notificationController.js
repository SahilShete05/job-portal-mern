const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const filter = { user: req.user._id };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 20, 100));

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
    });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
    });
  }
};
