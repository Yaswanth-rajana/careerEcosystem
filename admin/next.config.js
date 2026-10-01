const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  transpilePackages: ['@backend'],
  webpack: (config) => {
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));
    return config;
  },
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'mongodb+srv://yaswanthrajanaindiann_db_user:tqbKymYPuizCSofy@cluster0.52cflca.mongodb.net/careerEcoSystem?appName=Cluster0',
  },
};

module.exports = nextConfig;

