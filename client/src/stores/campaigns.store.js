import { defineStore } from 'pinia'
import * as campaignsApi from '../api/campaigns.api'
import { getSocket } from '../sockets/socket'
import * as EVENTS from '../sockets/events'
import { notify } from '../services/notifications'

export const useCampaignsStore = defineStore('campaigns', {
  state: () => ({
    items: [],
    loading: false,
    // Tracks which socket *instance* listeners are attached to (not just a
    // boolean) — a re-login creates a brand new socket object, and a plain
    // "already subscribed" flag would permanently block re-attaching to it.
    subscribedSocket: null,
  }),

  actions: {
    async fetchOpen() {
      this.loading = true
      try {
        this.items = await campaignsApi.listCraftsmanCampaigns()
      } finally {
        this.loading = false
      }
    },

    removeById(id) {
      this.items = this.items.filter((c) => c.id !== id)
    },

    upsert(campaign) {
      const idx = this.items.findIndex((c) => c.id === campaign.id)
      if (idx === -1) {
        this.items.unshift(campaign)
      } else {
        this.items[idx] = campaign
      }
    },

    // Socket events are treated as incremental deltas on top of the REST
    // fetch, never as the sole source of truth — on every (re)connect we
    // re-fetch so a missed event during a disconnect can't leave a stale list.
    subscribeToSocket() {
      const socket = getSocket()
      if (!socket || this.subscribedSocket === socket) return

      socket.on('connect', () => this.fetchOpen())
      socket.on(EVENTS.CAMPAIGN_CLAIMED, ({ campaignId }) => this.removeById(campaignId))
      socket.on(EVENTS.CAMPAIGN_EXPIRED, ({ campaignId }) => this.removeById(campaignId))
      socket.on(EVENTS.CAMPAIGN_PUBLISHED, (campaign) => {
        this.upsert(campaign)
        notify('Campaign Baru Tersedia', {
          body: `${campaign.title} — buruan klaim sebelum diambil pengrajin lain!`,
          tag: `campaign-${campaign.id}`,
          data: { url: '/pengrajin/kampanye' },
        })
      })

      this.subscribedSocket = socket
    },
  },
})
