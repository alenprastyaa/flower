const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sequelize, OrderRequest, Conversation, Message, User } = require('../models');
const { getIo } = require('../sockets');
const EVENTS = require('../sockets/events');

// Client generates this via crypto.randomUUID(); a loose sanity check keeps
// obviously-malformed values out of the conversations table.
const VISITOR_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

function assertValidVisitorId(id) {
  if (!VISITOR_ID_PATTERN.test(id)) {
    throw new ApiError(400, 'Invalid visitor id');
  }
}

function serializeMessage(m) {
  return {
    id: m.id,
    senderType: m.sender_type,
    senderUserId: m.sender_user_id,
    senderName: m.sender_name,
    body: m.body,
    createdAt: m.createdAt,
  };
}

async function findOrCreateOrderConversation(orderId, transaction) {
  const [conversation] = await Conversation.findOrCreate({
    where: { order_request_id: orderId, type: 'buyer_support' },
    defaults: { type: 'buyer_support', order_request_id: orderId },
    transaction,
  });
  return conversation;
}

// ---- Public (buyer, identified by tracking token) ----

const getOrderConversation = asyncHandler(async (req, res) => {
  const order = await OrderRequest.findOne({ where: { tracking_token: req.params.token } });
  if (!order) throw new ApiError(404, 'Order tidak ditemukan');

  const conversation = await findOrCreateOrderConversation(order.id);
  const messages = await Message.findAll({
    where: { conversation_id: conversation.id },
    order: [['created_at', 'ASC']],
  });

  res.json({
    data: {
      conversationId: conversation.id,
      orderId: order.id,
      messages: messages.map(serializeMessage),
    },
  });
});

const sendOrderMessage = asyncHandler(async (req, res) => {
  const order = await OrderRequest.findOne({ where: { tracking_token: req.params.token } });
  if (!order) throw new ApiError(404, 'Order tidak ditemukan');

  const result = await sequelize.transaction(async (t) => {
    const conversation = await findOrCreateOrderConversation(order.id, t);
    const message = await Message.create(
      {
        conversation_id: conversation.id,
        sender_type: 'buyer',
        sender_user_id: null,
        sender_name: order.buyer_name,
        body: req.body.body,
      },
      { transaction: t }
    );
    await conversation.update({ updated_at: new Date() }, { transaction: t });
    return { conversation, message };
  });

  const payload = {
    conversationId: result.conversation.id,
    orderId: order.id,
    ...serializeMessage(result.message),
  };

  try {
    const io = getIo();
    io.to('admin-room').emit(EVENTS.CHAT_ORDER_MESSAGE, payload);
    io.to(`order-chat:${order.id}`).emit(EVENTS.CHAT_ORDER_MESSAGE, payload);
  } catch (err) {
    // Socket.io not initialized — non-fatal for sending the message itself.
  }

  res.status(201).json({ data: serializeMessage(result.message) });
});

// ---- Public (anonymous landing-page visitor, no order yet) ----

const getVisitorConversation = asyncHandler(async (req, res) => {
  assertValidVisitorId(req.params.visitorId);
  const conversation = await Conversation.findOne({
    where: { visitor_id: req.params.visitorId, type: 'buyer_support' },
  });

  if (!conversation) {
    return res.json({ data: { conversationId: null, messages: [] } });
  }

  const messages = await Message.findAll({
    where: { conversation_id: conversation.id },
    order: [['created_at', 'ASC']],
  });

  res.json({ data: { conversationId: conversation.id, messages: messages.map(serializeMessage) } });
});

const sendVisitorMessage = asyncHandler(async (req, res) => {
  assertValidVisitorId(req.params.visitorId);
  const { body, name } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const [conversation] = await Conversation.findOrCreate({
      where: { visitor_id: req.params.visitorId, type: 'buyer_support' },
      defaults: { type: 'buyer_support', visitor_id: req.params.visitorId, visitor_name: name },
      transaction: t,
    });
    if (conversation.visitor_name !== name) {
      await conversation.update({ visitor_name: name }, { transaction: t });
    }

    const message = await Message.create(
      { conversation_id: conversation.id, sender_type: 'buyer', sender_user_id: null, sender_name: name, body },
      { transaction: t }
    );
    await conversation.update({ updated_at: new Date() }, { transaction: t });
    return { conversation, message };
  });

  const payload = {
    conversationId: result.conversation.id,
    visitorId: req.params.visitorId,
    ...serializeMessage(result.message),
  };

  try {
    const io = getIo();
    io.to('admin-room').emit(EVENTS.CHAT_ORDER_MESSAGE, payload);
    io.to(`visitor-chat:${req.params.visitorId}`).emit(EVENTS.CHAT_ORDER_MESSAGE, payload);
  } catch (err) {
    // Socket.io not initialized — non-fatal for sending the message itself.
  }

  res.status(201).json({ data: { conversationId: result.conversation.id, ...serializeMessage(result.message) } });
});

// ---- Admin (buyer support inbox — both order-tied and general visitor inquiries) ----

const listAdminConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.findAll({
    where: { type: 'buyer_support' },
    include: [
      {
        model: OrderRequest,
        as: 'orderRequest',
        attributes: ['id', 'buyer_name', 'arrangement_type', 'tracking_token', 'status'],
      },
    ],
    order: [['updated_at', 'DESC']],
  });

  const lastMessages = await sequelize.query(
    `SELECT m1.conversation_id, m1.body, m1.sender_type, m1.created_at
     FROM messages m1
     INNER JOIN (SELECT conversation_id, MAX(id) as max_id FROM messages GROUP BY conversation_id) m2
       ON m1.conversation_id = m2.conversation_id AND m1.id = m2.max_id`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const lastByConversation = new Map(lastMessages.map((m) => [m.conversation_id, m]));

  res.json({
    data: conversations.map((c) => ({
      id: c.id,
      order: c.orderRequest,
      visitorId: c.visitor_id,
      visitorName: c.visitor_name,
      updatedAt: c.updatedAt,
      lastMessage: lastByConversation.get(c.id) || null,
    })),
  });
});

const getAdminConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    where: { id: req.params.id, type: 'buyer_support' },
    include: [{ model: OrderRequest, as: 'orderRequest' }],
  });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const messages = await Message.findAll({
    where: { conversation_id: conversation.id },
    order: [['created_at', 'ASC']],
  });

  res.json({
    data: {
      id: conversation.id,
      order: conversation.orderRequest,
      visitorId: conversation.visitor_id,
      visitorName: conversation.visitor_name,
      messages: messages.map(serializeMessage),
    },
  });
});

const sendAdminReply = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ where: { id: req.params.id, type: 'buyer_support' } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const admin = await User.findByPk(req.user.id);

  const message = await sequelize.transaction(async (t) => {
    const created = await Message.create(
      {
        conversation_id: conversation.id,
        sender_type: 'user',
        sender_user_id: req.user.id,
        sender_name: admin?.full_name || 'Admin',
        body: req.body.body,
      },
      { transaction: t }
    );
    await conversation.update({ updated_at: new Date() }, { transaction: t });
    return created;
  });

  const payload = {
    conversationId: conversation.id,
    orderId: conversation.order_request_id,
    visitorId: conversation.visitor_id,
    ...serializeMessage(message),
  };

  const room = conversation.order_request_id
    ? `order-chat:${conversation.order_request_id}`
    : `visitor-chat:${conversation.visitor_id}`;

  try {
    getIo().to(room).emit(EVENTS.CHAT_ORDER_MESSAGE, payload);
  } catch (err) {
    // Socket.io not initialized — non-fatal.
  }

  res.status(201).json({ data: serializeMessage(message) });
});

// ---- Group chat (all authenticated users: pengrajin + superadmin) ----

const getGroupMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ where: { type: 'group' } });
  if (!conversation) throw new ApiError(404, 'Group conversation not found');

  const messages = await Message.findAll({
    where: { conversation_id: conversation.id },
    order: [['created_at', 'ASC']],
    limit: 200,
  });

  res.json({ data: { conversationId: conversation.id, messages: messages.map(serializeMessage) } });
});

const sendGroupMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ where: { type: 'group' } });
  if (!conversation) throw new ApiError(404, 'Group conversation not found');

  const sender = await User.findByPk(req.user.id, {
    include: [{ model: require('../models').CraftsmanProfile, as: 'craftsmanProfile' }],
  });
  const senderName = sender.craftsmanProfile?.store_name || sender.full_name;

  const message = await Message.create({
    conversation_id: conversation.id,
    sender_type: 'user',
    sender_user_id: req.user.id,
    sender_name: senderName,
    body: req.body.body,
  });

  const payload = serializeMessage(message);

  try {
    getIo().to('group-chat').emit(EVENTS.CHAT_GROUP_MESSAGE, payload);
  } catch (err) {
    // Socket.io not initialized — non-fatal.
  }

  res.status(201).json({ data: payload });
});

module.exports = {
  getOrderConversation,
  sendOrderMessage,
  getVisitorConversation,
  sendVisitorMessage,
  listAdminConversations,
  getAdminConversation,
  sendAdminReply,
  getGroupMessages,
  sendGroupMessage,
};
