import http from './http'

export function listMyOrders(params = {}) {
  return http.get('/craftsman/orders', { params }).then((r) => r.data.data)
}

export function updateOrderStatus(id, payload) {
  return http.patch(`/craftsman/orders/${id}/status`, payload).then((r) => r.data.data)
}

export function fetchDashboardSummary() {
  return http.get('/craftsman/dashboard/summary').then((r) => r.data.data)
}
