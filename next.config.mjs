/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Turbopack config
  turbopack: {
    root: import.meta.dirname,
  },

  // Enable gzip/brotli compression
  compress: true,

  // Optimise images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Add performance-focused HTTP headers on every route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow browser to cache static assets aggressively
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Hint browser to prefetch DNS for external deps
          { key: 'Link', value: '<https://fonts.googleapis.com>; rel=preconnect' },
        ],
      },
      {
        // Cache Next.js static chunks for 1 year
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Experimental: enable package import optimisation to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
