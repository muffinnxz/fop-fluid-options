/** @type {import('next').NextConfig} */

require("dotenv").config();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    REACT_APP_EPNS_OWNER: process.env.REACT_APP_EPNS_OWNER,
  },
}

module.exports = nextConfig
