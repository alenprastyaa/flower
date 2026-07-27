const ID_KEY = 'visitor_id'
const NAME_KEY = 'visitor_name'
const LAST_READ_KEY = 'visitor_chat_last_read'

export function getVisitorId() {
  let id = localStorage.getItem(ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ID_KEY, id)
  }
  return id
}

export function getVisitorName() {
  return localStorage.getItem(NAME_KEY) || ''
}

export function setVisitorName(name) {
  localStorage.setItem(NAME_KEY, name)
}

export function getLastReadAt() {
  return localStorage.getItem(LAST_READ_KEY) || null
}

export function setLastReadAt(iso) {
  localStorage.setItem(LAST_READ_KEY, iso)
}
