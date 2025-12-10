/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 Force Dynamic Runtime (no static export issues)
  output: "standalone",

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
