import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import PublicLayout from '../layouts/PublicLayout.vue'
import CraftsmanLayout from '../layouts/CraftsmanLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

import Home from '../pages/public/Home.vue'
import Login from '../pages/public/Login.vue'
import RegisterCraftsman from '../pages/public/RegisterCraftsman.vue'
import OrderRequestForm from '../pages/public/OrderRequestForm.vue'
import OrderSubmittedConfirmation from '../pages/public/OrderSubmittedConfirmation.vue'
import OrderTracking from '../pages/public/OrderTracking.vue'
import CampaignBoard from '../pages/public/CampaignBoard.vue'
import CraftsmenDirectory from '../pages/public/CraftsmenDirectory.vue'
import CraftsmanStorefront from '../pages/public/CraftsmanStorefront.vue'
import CraftsmanDashboard from '../pages/craftsman/Dashboard.vue'
import CraftsmanOpenCampaigns from '../pages/craftsman/OpenCampaigns.vue'
import CraftsmanMyOrders from '../pages/craftsman/MyOrders.vue'
import CraftsmanProfileEditor from '../pages/craftsman/ProfileEditor.vue'
import AdminDashboard from '../pages/admin/Dashboard.vue'
import AdminProducts from '../pages/admin/Products.vue'
import ReviewQueue from '../pages/admin/ReviewQueue.vue'
import AdminCampaigns from '../pages/admin/Campaigns.vue'
import AllOrders from '../pages/admin/AllOrders.vue'
import Craftsmen from '../pages/admin/Craftsmen.vue'
import CommissionSettings from '../pages/admin/CommissionSettings.vue'
import AdminChatInbox from '../pages/admin/ChatInbox.vue'
import GroupChat from '../pages/shared/GroupChat.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'masuk', name: 'login', component: Login },
      { path: 'daftar-pengrajin', name: 'register-craftsman', component: RegisterCraftsman },
      { path: 'pesan/:productId', name: 'order-request', component: OrderRequestForm },
      { path: 'pesan/sukses/:token', name: 'order-submitted', component: OrderSubmittedConfirmation },
      { path: 'lacak/:token', name: 'order-tracking', component: OrderTracking },
      { path: 'campaigns', name: 'campaign-board', component: CampaignBoard },
      { path: 'toko', name: 'craftsmen-directory', component: CraftsmenDirectory },
      { path: 'toko/:slug', name: 'craftsman-storefront', component: CraftsmanStorefront },
    ],
  },
  {
    path: '/pengrajin',
    component: CraftsmanLayout,
    meta: { requiresAuth: true, roles: ['pengrajin'] },
    children: [
      { path: '', redirect: '/pengrajin/dashboard' },
      { path: 'dashboard', name: 'craftsman-dashboard', component: CraftsmanDashboard },
      { path: 'kampanye', name: 'craftsman-campaigns', component: CraftsmanOpenCampaigns },
      { path: 'pesanan', name: 'craftsman-my-orders', component: CraftsmanMyOrders },
      { path: 'etalase', name: 'craftsman-profile-editor', component: CraftsmanProfileEditor },
      { path: 'komunitas', name: 'craftsman-group-chat', component: GroupChat },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['superadmin'] },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'produk', name: 'admin-products', component: AdminProducts },
      { path: 'tinjau', name: 'admin-review-queue', component: ReviewQueue },
      { path: 'kampanye', name: 'admin-campaigns', component: AdminCampaigns },
      { path: 'pesanan', name: 'admin-all-orders', component: AllOrders },
      { path: 'pengrajin', name: 'admin-craftsmen', component: Craftsmen },
      { path: 'komisi', name: 'admin-commission', component: CommissionSettings },
      { path: 'chat-pembeli', name: 'admin-chat-inbox', component: AdminChatInbox },
      { path: 'komunitas', name: 'admin-group-chat', component: GroupChat },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (!requiresAuth) return next()

  if (!auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  const allowedRoles = to.matched.flatMap((r) => r.meta.roles || [])
  if (allowedRoles.length && !allowedRoles.includes(auth.role)) {
    return next(auth.role === 'superadmin' ? '/admin/dashboard' : '/pengrajin/dashboard')
  }

  return next()
})

export default router
