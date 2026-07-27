import http from './http'

export function submitOrder(payload) {
  return http.post('/public/orders', payload).then((r) => r.data.data)
}

export function trackOrder(token) {
  return http.get(`/public/orders/track/${token}`).then((r) => r.data.data)
}

export function submitRating(token, payload) {
  return http.post(`/public/orders/track/${token}/rating`, payload).then((r) => r.data.data)
}
