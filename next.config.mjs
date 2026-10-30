const apiTarget = process.env.TOKRIII_API_PROXY_TARGET || 'http://127.0.0.1:5223'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['next.jsx', 'next.js'],
  images: { disableStaticImages: true },
  async headers() {
    if (process.env.TOKRIII_INDEXING_ENABLED !== 'true') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-Robots-Tag',
              value: 'noindex, nofollow',
            },
          ],
        },
      ]
    }
    return []
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiTarget}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiTarget}/uploads/:path*` },
    ]
  },
  webpack(config, { webpack }) {
    config.module.rules.push({ test: /\.(png|jpe?g|gif|webp|svg)$/i, type: 'asset/resource', generator: { filename: 'static/media/[name].[contenthash][ext]' } })
    config.plugins.push(new webpack.DefinePlugin({
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api/v1'),
      'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(process.env.TOKRIII_GA_MEASUREMENT_ID || ''),
    }))
    return config
  },
}

export default nextConfig
