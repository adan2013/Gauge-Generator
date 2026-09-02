import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png")],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
