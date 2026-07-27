const { Server } = require('socket.io');
const env = require('../config/env');
const { verifyToken } = require('../services/auth.service');

let io;

function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: env.nodeEnv !== 'production' ? { origin: env.clientOrigin, credentials: true } : undefined,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // anonymous connection: no rooms, read-only board visitors / order-chat only

    try {
      const payload = verifyToken(token);
      socket.data.user = { id: payload.sub, role: payload.role };
    } catch (err) {
      // invalid/expired token: treat as anonymous rather than rejecting the socket
    }
    next();
  });

  io.on('connection', async (socket) => {
    const user = socket.data.user;

    if (user?.role === 'pengrajin') {
      // Fresh-from-DB check at connect time, same reasoning as the HTTP
      // requireApprovedCraftsman guard: a suspended/unapproved pengrajin
      // must not receive claimable-campaign broadcasts.
      const { User, CraftsmanProfile } = require('../models');
      const dbUser = await User.findByPk(user.id, {
        include: [{ model: CraftsmanProfile, as: 'craftsmanProfile' }],
      });
      if (dbUser?.is_active && dbUser?.is_approved && dbUser.craftsmanProfile) {
        socket.join('open-campaigns');
        socket.join(`craftsman:${dbUser.craftsmanProfile.id}`);
        socket.join('group-chat');
      }
    } else if (user?.role === 'superadmin') {
      socket.join('admin-room');
      socket.join('group-chat');
    }

    // Order-chat room: available to anonymous buyers (via their tracking
    // token) and to the superadmin viewing a specific conversation by id.
    // Kept outside the role branches above so an anonymous socket can still
    // use it — chat with support doesn't require an account.
    socket.on('join-order-chat', async ({ trackingToken, orderId } = {}) => {
      const { OrderRequest } = require('../models');
      if (trackingToken) {
        const order = await OrderRequest.findOne({ where: { tracking_token: trackingToken }, attributes: ['id'] });
        if (order) socket.join(`order-chat:${order.id}`);
      } else if (orderId && socket.data.user?.role === 'superadmin') {
        socket.join(`order-chat:${orderId}`);
      }
    });

    // Visitor-chat room: for landing-page visitors asking a general question
    // before ever placing an order. The visitor id is generated client-side
    // (not a secret), so anyone presenting one may join that room — same
    // trust model as the order tracking token, just for pre-purchase chat.
    socket.on('join-visitor-chat', ({ visitorId } = {}) => {
      if (typeof visitorId === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(visitorId)) {
        socket.join(`visitor-chat:${visitorId}`);
      }
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
}

module.exports = { initSockets, getIo };
