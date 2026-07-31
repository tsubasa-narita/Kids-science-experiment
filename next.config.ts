import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositoryBasePath = "/Kids-science-experiment";

const nextConfig: NextConfig = {
  ...(isGitHubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.pages.json" },
        basePath: repositoryBasePath,
        assetPrefix: repositoryBasePath,
      }
    : {}),
};

export default nextConfig;
