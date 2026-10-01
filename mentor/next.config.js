/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@backend'],
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'mongodb+srv://yaswanthrajanaindiann_db_user:tqbKymYPuizCSofy@cluster0.52cflca.mongodb.net/careerEcoSystem?appName=Cluster0',
  },
};

module.exports = nextConfig;
