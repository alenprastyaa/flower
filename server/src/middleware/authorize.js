const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { User, CraftsmanProfile } = require('../models');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not allowed for this role'));
    }
    return next();
  };
}

// Fresh-from-DB check for sensitive craftsman actions (claim, campaign list):
// a suspended pengrajin must be blocked immediately, not only after their JWT expires.
const requireApprovedCraftsman = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'pengrajin') {
    throw new ApiError(403, 'Not allowed for this role');
  }

  const user = await User.findByPk(req.user.id, {
    include: [{ model: CraftsmanProfile, as: 'craftsmanProfile' }],
  });

  if (!user || !user.is_active) {
    throw new ApiError(403, 'Account is suspended');
  }
  if (!user.is_approved) {
    throw new ApiError(403, 'Account is pending admin approval');
  }
  if (!user.craftsmanProfile) {
    throw new ApiError(404, 'Craftsman profile not found');
  }

  req.craftsmanProfile = user.craftsmanProfile;
  next();
});

// Lighter check for a pengrajin's own resources (profile, portfolio) that
// should stay editable while an account is still pending admin approval —
// only suspension (is_active=false) blocks these, not is_approved.
const attachOwnCraftsmanProfile = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'pengrajin') {
    throw new ApiError(403, 'Not allowed for this role');
  }

  const user = await User.findByPk(req.user.id, {
    include: [{ model: CraftsmanProfile, as: 'craftsmanProfile' }],
  });

  if (!user || !user.is_active) {
    throw new ApiError(403, 'Account is suspended');
  }
  if (!user.craftsmanProfile) {
    throw new ApiError(404, 'Craftsman profile not found');
  }

  req.craftsmanProfile = user.craftsmanProfile;
  next();
});

module.exports = { authorize, requireApprovedCraftsman, attachOwnCraftsmanProfile };
