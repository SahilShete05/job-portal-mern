const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const onlineUsers = new Map();

const emitPresence = (io) => {
  const userIds = Array.from(onlineUsers.keys());
  io.emit('presence:update', { users: userIds });
};

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name role');
      if (!user) {
        return next(new Error('Unauthorized'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.join(userId);

    emitPresence(io);

    try {
      const [notificationUnread, messageUnread] = await Promise.all([
        Notification.countDocuments({ user: userId, isRead: false }),
        Message.countDocuments({ receiver: userId, isRead: false }),
      ]);

      socket.emit('notifications:unread', { count: notificationUnread });
      socket.emit('messages:unread', { count: messageUnread });
    } catch (error) {
      // Ignore unread count errors
    }

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      emitPresence(io);
    });

    socket.on('message:received', ({ messageId, senderId }) => {
      if (messageId && senderId) {
        io.to(senderId.toString()).emit('message:delivered', { messageId });
      }
    });
  });
};

module.exports.getOnlineUsers = () => onlineUsers;
