import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // lib/bracelet-image.ts reads lib/assets/bracelet-watermark.png via
  // fs.readFileSync at runtime — Next's automatic file tracer doesn't pick up
  // binary assets only referenced that way, so the serverless bundle for this
  // route silently excluded it, making the watermark a no-op composite in
  // production (worked locally where the whole repo is on disk).
  outputFileTracingIncludes: {
    '/api/analyze': ['./lib/assets/**/*'],
  },

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