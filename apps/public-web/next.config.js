/** @type {import('next').NextConfig} */
const nextConfig = { poweredByHeader: false, experimental: { cpus: 1 }, images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] } };
module.exports = nextConfig;
