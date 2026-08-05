/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // reactCompiler: true,
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH,
  distDir: 'docs',
};

export default nextConfig;
