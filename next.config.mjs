/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "ramen-style-finder";

const nextConfig = {
  reactStrictMode: true,
  output: isGitHubPages ? "export" : "standalone",
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  basePath: isGitHubPages ? `/${repoName}` : "",
  assetPrefix: isGitHubPages ? `/${repoName}/` : "",
  poweredByHeader: false,
};

export default nextConfig;

