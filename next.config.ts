import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "@sparticuz/chromium",
  ],

  outputFileTracingIncludes: {
    "/api/scraper/**/*": [
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/puppeteer/**/*",
      "./node_modules/puppeteer-core/**/*",
      "./node_modules/puppeteer-extra/**/*",
      "./node_modules/puppeteer-extra-plugin-stealth/**/*",
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;