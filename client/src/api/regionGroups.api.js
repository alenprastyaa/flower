import http from './http'

export function listPublicRegionGroups() {
  return http.get('/public/region-groups').then((r) => r.data.data)
}

export function listAdminRegionGroups() {
  return http.get('/admin/region-groups').then((r) => r.data.data)
}

export function createRegionGroup(payload) {
  return http.post('/admin/region-groups', payload).then((r) => r.data.data)
}

export function updateRegionGroup(id, payload) {
  return http.put(`/admin/region-groups/${id}`, payload).then((r) => r.data.data)
}

export function deleteRegionGroup(id) {
  return http.delete(`/admin/region-groups/${id}`)
}
