const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { CraftsmanProfile, PortfolioItem, User } = require('../models');

const listPublicCraftsmen = asyncHandler(async (req, res) => {
  const where = {};
  const { Op } = require('sequelize');
  if (req.query.city) where.city = { [Op.like]: `%${req.query.city}%` };

  const craftsmen = await CraftsmanProfile.findAll({
    where,
    include: [{ model: User, as: 'user', where: { is_active: true, is_approved: true }, attributes: [] }],
    attributes: ['id', 'store_name', 'slug', 'bio', 'avatar_url', 'cover_image_url', 'city', 'rating_avg', 'rating_count'],
    order: [['rating_avg', 'DESC']],
  });

  res.json({ data: craftsmen });
});

const getPublicCraftsmanBySlug = asyncHandler(async (req, res) => {
  const craftsman = await CraftsmanProfile.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: User, as: 'user', where: { is_active: true, is_approved: true }, attributes: [] },
      { model: PortfolioItem, as: 'portfolioItems', order: [['created_at', 'DESC']] },
    ],
  });

  if (!craftsman) throw new ApiError(404, 'Toko tidak ditemukan');
  res.json({ data: craftsman });
});

const getMyProfile = asyncHandler(async (req, res) => {
  res.json({ data: req.craftsmanProfile });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  await req.craftsmanProfile.update(req.body);
  res.json({ data: req.craftsmanProfile });
});

const listMyPortfolio = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.findAll({
    where: { craftsman_profile_id: req.craftsmanProfile.id },
    order: [['created_at', 'DESC']],
  });
  res.json({ data: items });
});

const addPortfolioItem = asyncHandler(async (req, res) => {
  const item = await PortfolioItem.create({
    craftsman_profile_id: req.craftsmanProfile.id,
    image_url: req.body.image_url,
    caption: req.body.caption || null,
    is_featured: Boolean(req.body.is_featured),
  });
  res.status(201).json({ data: item });
});

const deletePortfolioItem = asyncHandler(async (req, res) => {
  const item = await PortfolioItem.findByPk(req.params.id);
  if (!item || item.craftsman_profile_id !== req.craftsmanProfile.id) {
    throw new ApiError(404, 'Portfolio item not found');
  }
  await item.destroy();
  res.status(204).send();
});

module.exports = {
  listPublicCraftsmen,
  getPublicCraftsmanBySlug,
  getMyProfile,
  updateMyProfile,
  listMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
};
