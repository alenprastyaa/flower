const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { uniqueSlug } = require('../utils/slugify');
const { sequelize, User, CraftsmanProfile } = require('../models');
const { hashPassword, comparePassword, signToken } = require('../services/auth.service');

const registerCraftsman = asyncHandler(async (req, res) => {
  const { email, password, full_name, phone, store_name, bio, province, city } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Email sudah terdaftar');
  }

  const slug = await uniqueSlug(store_name, async (candidate) => {
    const found = await CraftsmanProfile.findOne({ where: { slug: candidate } });
    return Boolean(found);
  });

  const passwordHash = await hashPassword(password);

  const result = await sequelize.transaction(async (t) => {
    const user = await User.create(
      {
        role: 'pengrajin',
        email,
        password_hash: passwordHash,
        full_name,
        phone,
        is_active: true,
        is_approved: false,
      },
      { transaction: t }
    );

    const profile = await CraftsmanProfile.create(
      {
        user_id: user.id,
        store_name,
        slug,
        bio: bio || null,
        province,
        city,
      },
      { transaction: t }
    );

    return { user, profile };
  });

  res.status(201).json({
    data: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      is_approved: result.user.is_approved,
      storeSlug: result.profile.slug,
    },
    message: 'Pendaftaran berhasil. Akun akan aktif setelah disetujui admin.',
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email },
    include: [{ model: CraftsmanProfile, as: 'craftsmanProfile' }],
  });

  if (!user) throw new ApiError(401, 'Email atau password salah');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Email atau password salah');

  if (!user.is_active) throw new ApiError(403, 'Akun dinonaktifkan, hubungi admin');
  if (user.role === 'pengrajin' && !user.is_approved) {
    throw new ApiError(403, 'Akun Anda masih menunggu persetujuan admin');
  }

  const craftsmanProfileId = user.craftsmanProfile ? user.craftsmanProfile.id : null;
  const token = signToken(user, craftsmanProfileId);

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_approved: user.is_approved,
        craftsmanProfile: user.craftsmanProfile
          ? { id: user.craftsmanProfile.id, storeName: user.craftsmanProfile.store_name, slug: user.craftsmanProfile.slug }
          : null,
      },
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: CraftsmanProfile, as: 'craftsmanProfile' }],
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      is_active: user.is_active,
      is_approved: user.is_approved,
      craftsmanProfile: user.craftsmanProfile
        ? { id: user.craftsmanProfile.id, storeName: user.craftsmanProfile.store_name, slug: user.craftsmanProfile.slug }
        : null,
    },
  });
});

module.exports = { registerCraftsman, login, me };
