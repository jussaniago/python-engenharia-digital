import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bim_platform',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  apsClientId: process.env.APS_CLIENT_ID,
  apsClientSecret: process.env.APS_CLIENT_SECRET,
  apsBucketKey: process.env.APS_BUCKET_KEY,
  apsRegion: process.env.APS_REGION || 'US'
};
