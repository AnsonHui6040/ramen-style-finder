/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "ramen-style-finder";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGitHubPages ? `/${repoName}` : "",
  assetPrefix: isGitHubPages ? `/${repoName}/` : "",
};

export default nextConfig;
