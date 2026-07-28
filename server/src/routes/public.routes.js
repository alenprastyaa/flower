const express = require('express');
const validate = require('../middleware/validate');
const { submitOrderSchema } = require('../validators/orderRequest.validator');
const { submitRatingSchema } = require('../validators/rating.validator');
const { submitOrder, trackOrder, submitRating } = require('../controllers/orderRequest.controller');
const { listPublicCampaigns } = require('../controllers/campaign.controller');
const { listPublicCraftsmen, getPublicCraftsmanBySlug } = require('../controllers/craftsmanProfile.controller');
const { listPublicActiveProducts, listPublicProductTaxonomy } = require('../controllers/product.controller');
const { listPublicActiveRegionGroups } = require('../controllers/regionGroup.controller');
const { listProvinces, listRegencies, listDistricts, listVillages } = require('../controllers/region.controller');
const { sendMessageSchema, sendVisitorMessageSchema } = require('../validators/chat.validator');
const { getOrderConversation, sendOrderMessage, getVisitorConversation, sendVisitorMessage } = require('../controllers/chat.controller');

const router = express.Router();

router.post('/orders', validate(submitOrderSchema), submitOrder);
router.get('/orders/track/:token', trackOrder);
router.post('/orders/track/:token/rating', validate(submitRatingSchema), submitRating);
router.get('/orders/track/:token/chat', getOrderConversation);
router.post('/orders/track/:token/chat', validate(sendMessageSchema), sendOrderMessage);
router.get('/chat/visitor/:visitorId', getVisitorConversation);
router.post('/chat/visitor/:visitorId/messages', validate(sendVisitorMessageSchema), sendVisitorMessage);
router.get('/campaigns', listPublicCampaigns);
router.get('/craftsmen', listPublicCraftsmen);
router.get('/craftsmen/:slug', getPublicCraftsmanBySlug);
router.get('/products', listPublicActiveProducts);
router.get('/products/taxonomy', listPublicProductTaxonomy);
router.get('/region-groups', listPublicActiveRegionGroups);

router.get('/regions/provinces', listProvinces);
router.get('/regions/regencies/:provinceCode', listRegencies);
router.get('/regions/districts/:regencyCode', listDistricts);
router.get('/regions/villages/:districtCode', listVillages);

module.exports = router;
