const Message = require('../models/Message');
const User = require('../models/User');
const Match = require('../models/Match');
const uuid = require('uuid');

/**
 * Helper: normalize a message object for API responses.
 * Handles legacy `read` field → `status` migration.
 */
function normalizeMessage(msg) {
  const obj = typeof msg.toObject === 'function' ? msg.toObject() : { ...msg };
  delete obj._id;

  // Legacy migration: if status is missing, derive from read boolean
  if (!obj.status) {
    obj.status = obj.read ? 'read' : 'sent';
  }

  // Ensure defaults for new fields
  if (obj.edited === undefined) obj.edited = false;
  if (obj.edited_at === undefined) obj.edited_at = null;
  if (obj.deleted === undefined) obj.deleted = false;

  return obj;
}

/**
 * Sends a message from the authenticated user to another user.
 */
async function sendMessage(req, res) {
  try {
    const user = req.user;
    const { receiver_id, content, image_url, reply_to } = req.body;

    if (!receiver_id) {
      return res.status(422).json({ detail: "Missing receiver_id" });
    }
    if (!content && !image_url) {
      return res.status(422).json({ detail: "Message must contain content or an image" });
    }

    // Check for block
    const block = await Match.findOne({
      $or: [
        { user_id: user.id, target_id: receiver_id, type: 'block' },
        { user_id: receiver_id, target_id: user.id, type: 'block' }
      ]
    });
    if (block) {
      return res.status(403).json({ detail: "This user is unavailable (blocked)" });
    }

    // Check if the user is mutual matched with the receiver
    const [like1, like2] = await Promise.all([
      Match.findOne({ user_id: user.id, target_id: receiver_id, type: 'like' }),
      Match.findOne({ user_id: receiver_id, target_id: user.id, type: 'like' })
    ]);
    const isMutual = !!(like1 && like2);
    if (!isMutual) {
      return res.status(403).json({ detail: "You can only message mutual matches" });
    }

    // Check if receiver is online to set initial status
    const isUserOnline = req.app.get('isUserOnline');
    const initialStatus = (isUserOnline && isUserOnline(receiver_id)) ? 'delivered' : 'sent';

    const message = await Message.create({
      id: uuid.v4(),
      sender_id: user.id,
      receiver_id: receiver_id,
      content: content || '',
      image_url: image_url || null,
      reply_to: reply_to || null,
      read: false,
      status: initialStatus,
      created_at: new Date().toISOString()
    });

    const msgObj = normalizeMessage(message);

    const io = req.app.get('io');
    if (io) {
      io.to(receiver_id).emit('new_message', msgObj);
      io.to(user.id).emit('new_message', msgObj);
    }

    return res.status(200).json(msgObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Edits a message. Only the sender can edit their own messages.
 */
async function editMessage(req, res) {
  try {
    const user = req.user;
    const messageId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(422).json({ detail: "Content cannot be empty" });
    }

    const message = await Message.findOne({ id: messageId });
    if (!message) {
      return res.status(404).json({ detail: "Message not found" });
    }

    if (message.sender_id !== user.id) {
      return res.status(403).json({ detail: "You can only edit your own messages" });
    }

    if (message.deleted) {
      return res.status(400).json({ detail: "Cannot edit a deleted message" });
    }

    const editedAt = new Date().toISOString();
    message.content = content.trim();
    message.edited = true;
    message.edited_at = editedAt;
    await message.save();

    const msgObj = normalizeMessage(message);

    // Broadcast the edit to both sender and receiver in real-time
    const io = req.app.get('io');
    if (io) {
      const editPayload = { id: messageId, content: msgObj.content, edited_at: editedAt };
      io.to(message.receiver_id).emit('message_edited', editPayload);
      io.to(message.sender_id).emit('message_edited', editPayload);
    }

    return res.status(200).json(msgObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Deletes a message (soft delete). Only the sender can delete.
 */
async function deleteMessage(req, res) {
  try {
    const user = req.user;
    const messageId = req.params.id;

    const message = await Message.findOne({ id: messageId });
    if (!message) {
      return res.status(404).json({ detail: "Message not found" });
    }

    if (message.sender_id !== user.id) {
      return res.status(403).json({ detail: "You can only delete your own messages" });
    }

    message.deleted = true;
    message.content = '';
    await message.save();

    // Broadcast deletion to both sender and receiver
    const io = req.app.get('io');
    if (io) {
      const deletePayload = { id: messageId };
      io.to(message.receiver_id).emit('message_deleted', deletePayload);
      io.to(message.sender_id).emit('message_deleted', deletePayload);
    }

    return res.status(200).json({ success: true, id: messageId });
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

    // Normalize all messages (handles legacy migration)
    const normalized = messages.map(normalizeMessage);

    // Mark received messages as read (using both legacy and new fields)
    await Message.updateMany(
      {
        sender_id: otherUserId,
        receiver_id: user.id,
        status: { $in: ['sent', 'delivered'] }
      },
      { $set: { read: true, status: 'read' } }
    );

    // Also handle legacy-only docs that only have read field
    await Message.updateMany(
      {
        sender_id: otherUserId,
        receiver_id: user.id,
        read: false,
        status: { $exists: false }
      },
      { $set: { read: true, status: 'read' } }
    );

    // Notify sender that their messages were read
    const io = req.app.get('io');
    if (io) {
      io.to(otherUserId).emit('messages_read_ack', {
        readerId: user.id,
        readAt: new Date().toISOString()
      });
    }

    return res.status(200).json(normalized);
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

    // Add mutual matches to partnerIds
    const mutualMatchSet = new Set();
    const myLikes = await Match.find({ user_id: user.id, type: 'like' });
    const myLikedIds = myLikes.map(m => m.target_id);
    if (myLikedIds.length > 0) {
      const reciprocals = await Match.find({
        user_id: { $in: myLikedIds },
        target_id: user.id,
        type: 'like'
      });
      for (const r of reciprocals) {
        mutualMatchSet.add(r.user_id);
        partnerIds.add(r.user_id);
      }
    }

    // Filter out blocked users
    const blocks = await Match.find({
      $or: [
        { user_id: user.id, type: 'block' },
        { target_id: user.id, type: 'block' }
      ]
    });
    for (const b of blocks) {
      const blockedId = b.user_id === user.id ? b.target_id : b.user_id;
      partnerIds.delete(blockedId);
    }

    // Check online status helper
    const isUserOnline = req.app.get('isUserOnline');

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

        // Count unread using both old and new fields
        const unreadCount = await Message.countDocuments({
          sender_id: partnerId,
          receiver_id: user.id,
          $or: [
            { status: { $in: ['sent', 'delivered'] } },
            { read: false, status: { $exists: false } }
          ]
        });

        const partnerObj = partner.toObject();
        partnerObj.is_online = isUserOnline ? isUserOnline(partnerId) : false;

        conversations.push({
          partner: partnerObj,
          last_message: lastMsg ? normalizeMessage(lastMsg) : null,
          unread_count: unreadCount,
          is_mutual_match: mutualMatchSet.has(partnerId)
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
  editMessage,
  deleteMessage,
  getMessages,
  getConversations
};
