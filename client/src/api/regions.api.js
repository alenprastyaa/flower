import http from './http'

export function listProvinces() {
  return http.get('/public/regions/provinces').then((r) => r.data.data)
}

export function listRegencies(provinceCode) {
  return http.get(`/public/regions/regencies/${provinceCode}`).then((r) => r.data.data)
}

export function listDistricts(regencyCode) {
  return http.get(`/public/regions/districts/${regencyCode}`).then((r) => r.data.data)
}

export function listVillages(districtCode) {
  return http.get(`/public/regions/villages/${districtCode}`).then((r) => r.data.data)
}
