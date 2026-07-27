import http from './http'

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data.url)
}
