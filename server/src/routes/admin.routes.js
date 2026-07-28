const express = require('express');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  approveOrderSchema,
  rejectOrderSchema,
  cancelOrderSchema,
  markPaymentSchema,
} = require('../validators/orderRequest.validator');
const { publishOrderSchema } = require('../validators/campaign.validator');
const { setCommissionRateSchema } = require('../validators/commission.validator');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const { sendMessageSchema } = require('../validators/chat.validator');
const {
  listOrders,
  getOrder,
  approveOrder,
  publishOrder,
  listCampaignsOverview,
  rejectOrder,
  cancelOrder,
  markPayment,
  listCraftsmen,
  approveCraftsman,
  suspendCraftsman,
  dashboardSummary,
  dashboardCharts,
  getCommissionConfig,
  setCommissionRate,
} = require('../controllers/admin.controller');
const {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const {
  listAllRegionGroups,
  createRegionGroup,
  updateRegionGroup,
  deleteRegionGroup,
} = require('../controllers/regionGroup.controller');
const { createRegionGroupSchema, updateRegionGroupSchema } = require('../validators/regionGroup.validator');
const {
  listAdminConversations,
  getAdminConversation,
  sendAdminReply,
} = require('../controllers/chat.controller');

const router = express.Router();

router.use(authenticate, authorize('superadmin'));

router.get('/dashboard/summary', dashboardSummary);
router.get('/dashboard/charts', dashboardCharts);

router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.post('/orders/:id/approve', validate(approveOrderSchema), approveOrder);
router.post('/orders/:id/publish', validate(publishOrderSchema), publishOrder);
router.post('/orders/:id/reject', validate(rejectOrderSchema), rejectOrder);
router.post('/orders/:id/cancel', validate(cancelOrderSchema), cancelOrder);
router.patch('/orders/:id/payment', validate(markPaymentSchema), markPayment);

router.get('/campaigns', listCampaignsOverview);

router.get('/craftsmen', listCraftsmen);
router.post('/craftsmen/:id/approve', approveCraftsman);
router.post('/craftsmen/:id/suspend', suspendCraftsman);

router.get('/commission-config', getCommissionConfig);
router.put('/commission-config', validate(setCommissionRateSchema), setCommissionRate);

router.get('/products', listAllProducts);
router.post('/products', validate(createProductSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/region-groups', listAllRegionGroups);
router.post('/region-groups', validate(createRegionGroupSchema), createRegionGroup);
router.put('/region-groups/:id', validate(updateRegionGroupSchema), updateRegionGroup);
router.delete('/region-groups/:id', deleteRegionGroup);

router.get('/chat/conversations', listAdminConversations);
router.get('/chat/conversations/:id', getAdminConversation);
router.post('/chat/conversations/:id/messages', validate(sendMessageSchema), sendAdminReply);

module.exports = router;
