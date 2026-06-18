/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent botframework-webchat from being bundled server-side
      const externals = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...externals, 'botframework-webchat'];
    }
    return config;
  },
};

module.exports = nextConfig;
