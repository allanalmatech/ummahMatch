import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Required for Capacitor build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    if (process.env.BUILD_FOR_CAPACITOR) {
      // For the mobile build, we exclude the public website pages.
      const appPaths = { ...defaultPathMap };

      // Remove website pages
      delete appPaths['/about'];
      delete appPaths['/faqs'];
      delete appPaths['/privacy'];
      delete appPaths['/terms'];
      
      // The root path '/' is the website's landing page.
      // For the mobile app, we want the root to be the login page.
      // So, we remove the original root and map '/' to the login page.
      delete appPaths['/']; 
      appPaths['/'] = { page: '/login' };
      
      return appPaths;
    }
    
    // For a regular web build, return all the default paths
    return defaultPathMap;
  },
};

export default nextConfig;
