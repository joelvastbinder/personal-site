/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/icon.png",
      },
      {
        source: "/apple-touch-icon.png",
        destination: "/icon.png",
      },
    ]
  },
}

export default nextConfig
