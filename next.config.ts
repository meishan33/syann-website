import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    // Next.js 15+ defaults this to 'attachment', which makes iOS Safari refuse
    // to render remote-optimized images inline (even inside <img> tags) — the
    // exact cause of bracelet photos showing blank on mobile but fine on desktop.
    contentDispositionType: "inline",
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