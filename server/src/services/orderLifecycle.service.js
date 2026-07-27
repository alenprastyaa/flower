const ApiError = require('../utils/ApiError');
const { OrderStatusHistory } = require('../models');

const TRANSITIONS = {
  submitted: ['approved', 'rejected'],
  approved: ['published', 'cancelled'],
  published: ['claimed', 'cancelled', 'expired'],
  claimed: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
};

function assertTransition(currentStatus, nextStatus) {
  const allowed = TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(409, `Cannot transition order from '${currentStatus}' to '${nextStatus}'`);
  }
}

async function recordTransition({ orderRequestId, fromStatus, toStatus, changedByUserId, note }, options = {}) {
  return OrderStatusHistory.create(
    {
      order_request_id: orderRequestId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by_user_id: changedByUserId || null,
      note: note || null,
    },
    options
  );
}

module.exports = { TRANSITIONS, assertTransition, recordTransition };
