const express = require('express');
const authenticate = require('../middleware/authenticate');
const { authorize, requireApprovedCraftsman, attachOwnCraftsmanProfile } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateOrderStatusSchema, updateProfileSchema } = require('../validators/craftsman.validator');
const { addPortfolioItemSchema } = require('../validators/craftsmanProfile.validator');
const { listOpenCampaignsForCraftsman } = require('../controllers/campaign.controller');
const { claim, listMyOrders, updateOrderStatus, dashboardSummary } = require('../controllers/craftsman.controller');
const {
  getMyProfile,
  updateMyProfile,
  listMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} = require('../controllers/craftsmanProfile.controller');

const router = express.Router();

router.use(authenticate, authorize('pengrajin'));

router.get('/campaigns', listOpenCampaignsForCraftsman);
router.post('/campaigns/:id/claim', requireApprovedCraftsman, claim);

router.get('/orders', requireApprovedCraftsman, listMyOrders);
router.patch('/orders/:id/status', requireApprovedCraftsman, validate(updateOrderStatusSchema), updateOrderStatus);

router.get('/dashboard/summary', requireApprovedCraftsman, dashboardSummary);

router.get('/profile', attachOwnCraftsmanProfile, getMyProfile);
router.put('/profile', attachOwnCraftsmanProfile, validate(updateProfileSchema), updateMyProfile);

router.get('/portfolio', attachOwnCraftsmanProfile, listMyPortfolio);
router.post('/portfolio', attachOwnCraftsmanProfile, validate(addPortfolioItemSchema), addPortfolioItem);
router.delete('/portfolio/:id', attachOwnCraftsmanProfile, deletePortfolioItem);

module.exports = router;
