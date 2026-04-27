/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './dist',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
      },
    ],
  },
}

export default nextConfig