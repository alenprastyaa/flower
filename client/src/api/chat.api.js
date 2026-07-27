import http from './http'

export function getOrderChat(token) {
  return http.get(`/public/orders/track/${token}/chat`).then((r) => r.data.data)
}

export function sendOrderChatMessage(token, body) {
  return http.post(`/public/orders/track/${token}/chat`, { body }).then((r) => r.data.data)
}

export function getVisitorChat(visitorId) {
  return http.get(`/public/chat/visitor/${visitorId}`).then((r) => r.data.data)
}

export function sendVisitorChatMessage(visitorId, body, name) {
  return http.post(`/public/chat/visitor/${visitorId}/messages`, { body, name }).then((r) => r.data.data)
}

export function listAdminConversations() {
  return http.get('/admin/chat/conversations').then((r) => r.data.data)
}

export function getAdminConversation(id) {
  return http.get(`/admin/chat/conversations/${id}`).then((r) => r.data.data)
}

export function sendAdminReply(id, body) {
  return http.post(`/admin/chat/conversations/${id}/messages`, { body }).then((r) => r.data.data)
}

export function getGroupChat() {
  return http.get('/chat/group').then((r) => r.data.data)
}

export function sendGroupMessage(body) {
  return http.post('/chat/group', { body }).then((r) => r.data.data)
}
