import http from './http'

export function listPublicProducts() {
  return http.get('/public/products').then((r) => r.data.data)
}

export function listAdminProducts() {
  return http.get('/admin/products').then((r) => r.data.data)
}

export function createProduct(payload) {
  return http.post('/admin/products', payload).then((r) => r.data.data)
}

export function updateProduct(id, payload) {
  return http.put(`/admin/products/${id}`, payload).then((r) => r.data.data)
}

export function deleteProduct(id) {
  return http.delete(`/admin/products/${id}`)
}
