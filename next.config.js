/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middlewareClientMaxBodySize: 200 * 1024 * 1024, // 200 MB — allow large video uploads through the proxy
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? 'http://localhost:3002';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;