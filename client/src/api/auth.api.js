import http from './http'

export function login(email, password) {
  return http.post('/auth/login', { email, password }).then((r) => r.data.data)
}

export function registerCraftsman(payload) {
  return http.post('/auth/register', payload).then((r) => r.data.data)
}

export function fetchMe() {
  return http.get('/auth/me').then((r) => r.data.data)
}
