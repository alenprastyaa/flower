import http from './http'

export function listPublicCraftsmen(params = {}) {
  return http.get('/public/craftsmen', { params }).then((r) => r.data.data)
}

export function getPublicCraftsmanBySlug(slug) {
  return http.get(`/public/craftsmen/${slug}`).then((r) => r.data.data)
}

export function getMyProfile() {
  return http.get('/craftsman/profile').then((r) => r.data.data)
}

export function updateMyProfile(payload) {
  return http.put('/craftsman/profile', payload).then((r) => r.data.data)
}

export function listMyPortfolio() {
  return http.get('/craftsman/portfolio').then((r) => r.data.data)
}

export function addPortfolioItem(payload) {
  return http.post('/craftsman/portfolio', payload).then((r) => r.data.data)
}

export function deletePortfolioItem(id) {
  return http.delete(`/craftsman/portfolio/${id}`)
}
