/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing CDN
        port: '',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary (alternativa)
      },
    ],
  },
};

module.exports = nextConfig;
