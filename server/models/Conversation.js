const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1, job: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
