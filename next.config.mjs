const apiTarget = process.env.TOKRIII_API_PROXY_TARGET || 'http://127.0.0.1:5223'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['next.jsx', 'next.js'],
  images: { disableStaticImages: true },
  async headers() {
    const headersList = []

    // Safeguard 1: Non-production hosts (staging, preview, internal IP, localhost)
    // ALWAYS emit X-Robots-Tag: noindex, nofollow regardless of environment variables.
    // This guarantees staging (e.g. server.tokriii.com) remains noindex even if
    // TOKRIII_INDEXING_ENABLED is accidentally set to 'true'.
    headersList.push({
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: '(?!(www\\.)?tokriii\\.com(:[0-9]+)?$).*',
        },
      ],
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow',
        },
      ],
    })

    // Safeguard 2: If indexing is not explicitly enabled, emit noindex, nofollow
    // across all domains (including production domain).
    if (process.env.TOKRIII_INDEXING_ENABLED !== 'true') {
      headersList.push({
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      })
    }

    return headersList
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
