/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {protocol: 'https',
      hostname:'yt3.ggpht.com',
      }
    ],
  },
}

module.exports = nextConfig

const withPWA = require('next-pwa')({
    dest: 'public'
  })

module.exports = withPWA({
  reactStrinctMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
    ],
  },
});