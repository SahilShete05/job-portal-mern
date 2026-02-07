const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Job = require('../models/Job');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const { getIO } = require('../utils/socket');

const normalizeParticipants = (a, b) => [a.toString(), b.toString()].sort();

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email role')
      .populate('job', 'title companyName')
      .populate({
        path: 'lastMessage',
        select: 'body sender receiver createdAt isRead',
      })
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          receiver: req.user._id,
          isRead: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load conversations',
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load messages',
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, jobId, conversationId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }
      if (!conversation.participants.some((id) => id.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to send message in this conversation',
        });
      }
    } else {
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Receiver is required to start a conversation',
        });
      }

      const participantsKey = normalizeParticipants(req.user._id, receiverId);
      const query = {
        participants: { $all: participantsKey },
      };

      if (jobId) {
        query.job = jobId;
      }

      conversation = await Conversation.findOne(query);

      if (!conversation) {
        conversation = await Conversation.create({
          participants: participantsKey,
          job: jobId || null,
        });
      }
    }

    if (jobId) {
      await Job.findById(jobId);
    }

    const receiver = receiverId || conversation.participants.find((id) => id.toString() !== req.user._id.toString());

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver,
      body: content.trim(),
      job: jobId || conversation.job || null,
    });

    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    await createNotification({
      userId: receiver,
      type: 'message',
      title: 'New message',
      body: content.trim().slice(0, 140),
      link: `/messages?conversation=${conversation._id}`,
      meta: {
        conversationId: conversation._id,
      },
    });

    try {
      const receiverUser = await User.findById(receiver).select('email name');
      if (receiverUser?.email) {
        await sendEmail({
          to: receiverUser.email,
          subject: `New message from ${req.user.name}`,
          text: `${req.user.name} sent you a message: ${content.trim().slice(0, 200)}`,
          html: `<p><strong>${req.user.name}</strong> sent you a message:</p><p>${content.trim().slice(0, 200)}</p>`,
        });
      }
    } catch (emailError) {
      console.warn('Message email failed:', emailError.message || emailError);
    }

    const populatedMessage = await message.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'receiver', select: 'name email role' },
    ]);

    try {
      const io = getIO();
      if (io) {
        io.to(receiver.toString()).emit('message:new', {
          conversationId: conversation._id,
          message: populatedMessage,
        });
        io.to(req.user._id.toString()).emit('message:sent', {
          conversationId: conversation._id,
          message: populatedMessage,
        });
      }
    } catch (error) {
      // Ignore socket emit errors
    }

    res.status(201).json({
      success: true,
      data: {
        message: populatedMessage,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};
