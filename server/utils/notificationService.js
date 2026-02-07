const Notification = require('../models/Notification');
const { getIO } = require('./socket');

const createNotification = async ({ userId, type, title, body, link, meta }) => {
  if (!userId || !type || !title) {
    return null;
  }

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    body,
    link,
    meta,
  });

  try {
    const io = getIO();
    if (io) {
      io.to(userId.toString()).emit('notification:new', notification);
    }
  } catch (error) {
    // Ignore socket emit errors
  }

  return notification;
};

module.exports = { createNotification };
