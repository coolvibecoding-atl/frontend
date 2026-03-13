/* eslint-disable */
// Redis configuration for BullMQ
// In production, use environment variables for security

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB) || 0,
};

module.exports = { redisConfig };