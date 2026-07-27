import { defineStore } from 'pinia'
import { getSocket } from '../sockets/socket'
import * as EVENTS from '../sockets/events'
import { notify } from '../services/notifications'
import { useAuthStore } from './auth.store'

// Shared between AdminLayout and CraftsmanLayout so the "Chat Komunitas"
// badge/notification works no matter which page the user is currently on —
// GroupChat.vue itself only listens while mounted, which misses messages
// that arrive while browsing anywhere else.
export const useGroupChatStore = defineStore('groupChat', {
  state: () => ({
    unreadCount: 0,
    // Tracks which socket *instance* listeners are attached to (not just a
    // boolean) — a re-login creates a brand new socket object, and a plain
    // "already subscribed" flag would permanently block re-attaching to it.
    subscribedSocket: null,
  }),

  actions: {
    clearUnread() {
      this.unreadCount = 0
    },

    subscribeToSocket() {
      const socket = getSocket()
      if (!socket || this.subscribedSocket === socket) return

      socket.on(EVENTS.CHAT_GROUP_MESSAGE, (msg) => {
        const auth = useAuthStore()
        if (msg.senderUserId === auth.user?.id) return // our own message bouncing back

        this.unreadCount += 1
        notify('Pesan Baru di Komunitas', {
          body: `${msg.senderName}: ${msg.body}`,
          tag: 'group-chat',
          data: { url: auth.role === 'superadmin' ? '/admin/komunitas' : '/pengrajin/komunitas' },
        })
      })

      this.subscribedSocket = socket
    },
  },
})
