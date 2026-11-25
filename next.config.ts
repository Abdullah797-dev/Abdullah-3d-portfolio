import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Allow the preview origin for dev cross-origin requests
  allowedDevOrigins: ["https://preview-chat-4a780a39-a58f-42b0-a422-09753d8625a8.space-z.ai"],
};

export default nextConfig;
