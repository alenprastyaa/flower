require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'flower_user',
  password: process.env.DB_PASSWORD || 'flower_pass',
  database: process.env.DB_NAME || 'flower_marketplace',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: 'mysql',
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
};
