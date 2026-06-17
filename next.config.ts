import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [

      {
        protocol: "https",
        hostname: "placehold.co",
      },

      {
        protocol: "https",
        hostname: "miegraogjaypuirqeasq.supabase.co",
      },

    ],
  },

};

export default nextConfig;