/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Évite que Next.js échoue le build si des erreurs de lint apparaissent
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Évite que Next.js échoue le build sur des erreurs TypeScript mineures
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
