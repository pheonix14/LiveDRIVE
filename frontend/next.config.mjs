/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let basePath = process.env.BASE_PATH || '';

if (!basePath && isGithubActions && process.env.GITHUB_REPOSITORY) {
  const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
  if (repoName && !repoName.endsWith('.github.io')) {
    basePath = `/${repoName}`;
  }
}

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: false,
  basePath: basePath ? basePath : undefined,
  assetPrefix: basePath ? basePath : undefined,
};

export default nextConfig;
