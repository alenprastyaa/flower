import { defineStore } from 'pinia'
import * as authApi from '../api/auth.api'
import { connectSocket, disconnectSocket } from '../sockets/socket'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state) => state.user?.role || null,
  },

  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      connectSocket(token)
    },

    async login(email, password) {
      const { token, user } = await authApi.login(email, password)
      this.setSession(token, user)
      return user
    },

    async register(payload) {
      return authApi.registerCraftsman(payload)
    },

    async refreshMe() {
      if (!this.token) return null
      const user = await authApi.fetchMe()
      this.user = { ...this.user, ...user }
      localStorage.setItem('auth_user', JSON.stringify(this.user))
      return this.user
    },

    // Called once on app boot if a token already exists in localStorage,
    // so a page refresh reconnects the socket instead of leaving it idle
    // until the next login.
    restoreSocketSession() {
      if (this.token) connectSocket(this.token)
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      disconnectSocket()
    },
  },
})
