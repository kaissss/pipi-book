import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  // Railway (and most PaaS) inject PORT at runtime — always honour it.
  port: parseInt(process.env.PORT ?? '4000', 10) || 4000,
  url: process.env.APP_URL || 'http://localhost:4000',
  // Comma-separated list of allowed frontend origins for CORS.
  // Empty in development => allow all; set in production to lock down.
  corsOrigins: (process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Swagger is on by default; set ENABLE_SWAGGER=false to disable in production.
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const lineConfig = registerAs('line', () => ({
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  redirectUri: process.env.LINE_REDIRECT_URI,
  messagingChannelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
  messagingChannelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET,
}));

export const ecpayConfig = registerAs('ecpay', () => ({
  merchantId: process.env.ECPAY_MERCHANT_ID,
  hashKey: process.env.ECPAY_HASH_KEY,
  hashIv: process.env.ECPAY_HASH_IV,
  apiUrl: process.env.ECPAY_API_URL,
  returnUrl: process.env.ECPAY_RETURN_URL,
  orderResultUrl: process.env.ECPAY_ORDER_RESULT_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
  slotLockTtl: parseInt(process.env.SLOT_LOCK_TTL_SECONDS ?? '300', 10) || 300,
}));
