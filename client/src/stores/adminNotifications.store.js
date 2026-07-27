import { defineStore } from 'pinia'
import { fetchDashboardSummary } from '../api/admin.api'
import { getSocket } from '../sockets/socket'
import * as EVENTS from '../sockets/events'
import { notify } from '../services/notifications'

export const useAdminNotificationsStore = defineStore('adminNotifications', {
  state: () => ({
    pendingReviewCount: 0,
    unreadBuyerChatCount: 0,
    // Tracks which socket *instance* listeners are attached to (not just a
    // boolean) — a re-login creates a brand new socket object, and a plain
    // "already subscribed" flag would permanently block re-attaching to it.
    subscribedSocket: null,
  }),

  actions: {
    async fetchCount() {
      const summary = await fetchDashboardSummary()
      this.pendingReviewCount = summary.pendingReviewCount
    },

    // Called after an order leaves the review queue (approved/rejected) so
    // the badge updates instantly instead of waiting for a full refetch.
    decrement() {
      this.pendingReviewCount = Math.max(0, this.pendingReviewCount - 1)
    },

    // Called when the admin opens the Chat Pembeli inbox — treat arriving
    // there as having "read" the new messages.
    clearBuyerChatUnread() {
      this.unreadBuyerChatCount = 0
    },

    subscribeToSocket() {
      const socket = getSocket()
      if (!socket || this.subscribedSocket === socket) return

      socket.on('connect', () => this.fetchCount())

      socket.on(EVENTS.ORDER_SUBMITTED, (order) => {
        this.pendingReviewCount += 1
        notify('Pesanan Baru Masuk', {
          body: `${order.arrangementType} — dari ${order.buyerName}`,
          tag: `order-${order.id}`,
          data: { url: '/admin/tinjau' },
        })
      })

      socket.on(EVENTS.CHAT_ORDER_MESSAGE, (msg) => {
        if (msg.senderType !== 'buyer') return // our own reply bouncing back
        this.unreadBuyerChatCount += 1
        notify('Pesan Baru dari Pembeli', {
          body: `${msg.senderName}: ${msg.body}`,
          tag: `chat-${msg.conversationId}`,
          data: { url: '/admin/chat-pembeli' },
        })
      })

      this.subscribedSocket = socket
    },
  },
})
