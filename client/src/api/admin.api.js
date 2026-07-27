import http from './http'

export function listOrders(params = {}) {
  return http.get('/admin/orders', { params }).then((r) => r.data)
}

export function getOrder(id) {
  return http.get(`/admin/orders/${id}`).then((r) => r.data.data)
}

export function approveOrder(id, payload) {
  return http.post(`/admin/orders/${id}/approve`, payload).then((r) => r.data.data)
}

export function rejectOrder(id, payload) {
  return http.post(`/admin/orders/${id}/reject`, payload).then((r) => r.data.data)
}

export function cancelOrder(id, payload) {
  return http.post(`/admin/orders/${id}/cancel`, payload).then((r) => r.data.data)
}

export function markPayment(id, status) {
  return http.patch(`/admin/orders/${id}/payment`, { status }).then((r) => r.data.data)
}

export function listCraftsmen() {
  return http.get('/admin/craftsmen').then((r) => r.data.data)
}

export function approveCraftsman(id) {
  return http.post(`/admin/craftsmen/${id}/approve`).then((r) => r.data.data)
}

export function suspendCraftsman(id) {
  return http.post(`/admin/craftsmen/${id}/suspend`).then((r) => r.data.data)
}

export function fetchDashboardSummary() {
  return http.get('/admin/dashboard/summary').then((r) => r.data.data)
}

export function fetchDashboardCharts() {
  return http.get('/admin/dashboard/charts').then((r) => r.data.data)
}

export function getCommissionConfig() {
  return http.get('/admin/commission-config').then((r) => r.data.data)
}

export function setCommissionRate(rate_percent) {
  return http.put('/admin/commission-config', { rate_percent }).then((r) => r.data.data)
}
