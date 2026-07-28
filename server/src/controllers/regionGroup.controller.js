const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { RegionGroup } = require('../models');

const listPublicActiveRegionGroups = asyncHandler(async (req, res) => {
  const regionGroups = await RegionGroup.findAll({
    where: { is_active: true },
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  });
  res.json({ data: regionGroups });
});

const listAllRegionGroups = asyncHandler(async (req, res) => {
  const regionGroups = await RegionGroup.findAll({
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  });
  res.json({ data: regionGroups });
});

const createRegionGroup = asyncHandler(async (req, res) => {
  const regionGroup = await RegionGroup.create(req.body);
  res.status(201).json({ data: regionGroup });
});

const updateRegionGroup = asyncHandler(async (req, res) => {
  const regionGroup = await RegionGroup.findByPk(req.params.id);
  if (!regionGroup) throw new ApiError(404, 'Region group not found');
  await regionGroup.update(req.body);
  res.json({ data: regionGroup });
});

const deleteRegionGroup = asyncHandler(async (req, res) => {
  const regionGroup = await RegionGroup.findByPk(req.params.id);
  if (!regionGroup) throw new ApiError(404, 'Region group not found');
  await regionGroup.destroy();
  res.status(204).send();
});

module.exports = {
  listPublicActiveRegionGroups,
  listAllRegionGroups,
  createRegionGroup,
  updateRegionGroup,
  deleteRegionGroup,
};
