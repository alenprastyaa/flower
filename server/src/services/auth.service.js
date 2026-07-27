const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user, craftsmanProfileId) {
  return jwt.sign(
    { sub: user.id, role: user.role, craftsmanProfileId: craftsmanProfileId ?? null },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn, algorithm: 'HS256' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken };
