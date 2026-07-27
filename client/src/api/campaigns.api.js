import http from './http'

export function listPublicCampaigns() {
  return http.get('/public/campaigns').then((r) => r.data.data)
}

export function listCraftsmanCampaigns() {
  return http.get('/craftsman/campaigns').then((r) => r.data.data)
}

export function claimCampaign(campaignId) {
  return http.post(`/craftsman/campaigns/${campaignId}/claim`).then((r) => r.data.data)
}

export function publishOrder(orderId, payload) {
  return http.post(`/admin/orders/${orderId}/publish`, payload).then((r) => r.data.data)
}

export function listCampaignsOverview(params = {}) {
  return http.get('/admin/campaigns', { params }).then((r) => r.data.data)
}
