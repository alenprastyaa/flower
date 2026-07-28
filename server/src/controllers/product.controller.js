const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const { Product } = require('../models');

const listPublicActiveProducts = asyncHandler(async (req, res) => {
  const where = { is_active: true };

  // A product with no region_group_id is universal (shown for every region);
  // one tagged to a region is only shown when that region is selected.
  const { regionGroupId } = req.query;
  if (regionGroupId) {
    where.region_group_id = { [Op.or]: [Number(regionGroupId), null] };
  }

  const products = await Product.findAll({
    where,
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC'],
    ],
  });
  res.json({ data: products });
});

// Navigation structure only (category_group / category / region_group_id) —
// includes inactive products so a category/region button can appear as soon
// as an admin tags a product for it, even before it's published live. Never
// exposes name/price/image for inactive rows.
const listPublicProductTaxonomy = asyncHandler(async (req, res) => {
  const rows = await Product.findAll({
    attributes: ['category_group', 'category', 'region_group_id'],
  });
  res.json({ data: rows });
});

const listAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC'],
    ],
  });
  res.json({ data: products });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await product.update(req.body);
  res.json({ data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await product.destroy();
  res.status(204).send();
});

module.exports = {
  listPublicActiveProducts,
  listPublicProductTaxonomy,
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
