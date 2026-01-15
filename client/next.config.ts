import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL:
      process.env.NODE_ENV === "development"
        ? "http://localhost:4000"
        : "https://delycia.com",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "files.expressme.in",
      },
      {
        protocol: "https",
        hostname: "images.immediate.co.uk",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "google.com",
      }
    ],
  },
  // Turn on this for better performance build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // // Fix header size issues
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Transfer-Encoding',
  //           value: 'chunked',
  //         },
  //       ],
  //     },
  //   ];
  // },
  // Reduce hydration mismatch issues
  reactStrictMode: false,
};

export default nextConfig;
