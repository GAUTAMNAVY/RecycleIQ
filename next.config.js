/** @type {import('next').NextConfig} */
const nextConfig = {
  presets: ["@next/babel"],
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "static.vecteezy.com",
    ],
  },
};

module.exports = nextConfig;
