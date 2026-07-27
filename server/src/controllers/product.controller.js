const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Product } = require('../models');

const listPublicActiveProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { is_active: true },
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC'],
    ],
  });
  res.json({ data: products });
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

module.exports = { listPublicActiveProducts, listAllProducts, createProduct, updateProduct, deleteProduct };
