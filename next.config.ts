import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/ColtonTollett-Resume.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="ColtonTollett-Resume.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
