const Message = require('../models/Message');
const User = require('../models/User');
const uuid = require('uuid');

/**
 * Sends a message from the authenticated user to another user.
 */
async function sendMessage(req, res) {
  try {
    const user = req.user;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(422).json({ detail: "Missing receiver_id or content" });
    }

    if (!user.is_premium) {
      return res.status(403).json({ detail: "Messaging is only available to premium subscribers" });
    }

    const message = await Message.create({
      id: uuid.v4(),
      sender_id: user.id,
      receiver_id: receiver_id,
      content: content,
      read: false,
      created_at: new Date().toISOString()
    });

    const msgObj = message.toObject();
    delete msgObj._id;

    return res.status(200).json(msgObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Returns the chat history between authenticated user and another user.
 */
async function getMessages(req, res) {
  try {
    const user = req.user;
    const otherUserId = req.params.other_user_id;

    const messages = await Message.find({
      $or: [
        { sender_id: user.id, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: user.id }
      ]
    }, { _id: 0 }).sort({ created_at: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: user.id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Returns a list of all active conversations for the authenticated user.
 */
async function getConversations(req, res) {
  try {
    const user = req.user;

    const messages = await Message.find({
      $or: [
        { sender_id: user.id },
        { receiver_id: user.id }
      ]
    }, { _id: 0 });

    const partnerIds = new Set();
    for (const msg of messages) {
      if (msg.sender_id === user.id) {
        partnerIds.add(msg.receiver_id);
      } else {
        partnerIds.add(msg.sender_id);
      }
    }

    const conversations = [];
    for (const partnerId of partnerIds) {
      const partner = await User.findOne(
        { id: partnerId },
        { id: 1, name: 1, profile_photo: 1, city: 1, state: 1, _id: 0 }
      );
      if (partner) {
        const lastMsgList = await Message.find({
          $or: [
            { sender_id: user.id, receiver_id: partnerId },
            { sender_id: partnerId, receiver_id: user.id }
          ]
        }, { _id: 0 }).sort({ created_at: -1 }).limit(1);

        const lastMsg = lastMsgList[0] || null;

        const unreadCount = await Message.countDocuments({
          sender_id: partnerId,
          receiver_id: user.id,
          read: false
        });

        conversations.push({
          partner: partner.toObject(),
          last_message: lastMsg ? lastMsg.toObject() : null,
          unread_count: unreadCount
        });
      }
    }

    return res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  getConversations
};
