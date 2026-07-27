const isSupported = 'serviceWorker' in navigator && 'Notification' in window

let registrationPromise = null

export function isNotificationSupported() {
  return isSupported
}

export function getPermission() {
  return isSupported ? Notification.permission : 'unsupported'
}

export async function registerServiceWorker() {
  if (!isSupported) return null
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed', err)
      return null
    })
  }
  return registrationPromise
}

export async function requestNotificationPermission() {
  if (!isSupported) return 'unsupported'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

// Shows a notification through the active service worker so it keeps working
// while the tab is open but not focused. Only fires when permission is
// already granted and the tab isn't the one currently in front of the user.
export async function notify(title, options = {}) {
  if (!isSupported || Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return

  const registration = await registerServiceWorker()
  if (registration?.active) {
    registration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options: { icon: '/favicon.svg', badge: '/favicon.svg', ...options },
    })
  } else {
    // Fallback for the brief window before the SW is controlling the page.
    new Notification(title, options)
  }
}
