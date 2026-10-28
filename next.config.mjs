/** @type {import('next').NextConfig} */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Next.js does not expose VITE_* to the browser. Copy them onto the names
  // the existing client already reads.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabasePublishableKey,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/contact-us-2',
        destination: '/contact-us',
        permanent: true,
      },
      {
        source: '/mep-revit-course',
        destination: '/courses/revit-mep-training-course-fees',
        permanent: true,
      },
      {
        source: '/cswip-welding-inspector-course',
        destination: '/courses/cswip-3-1-course',
        permanent: true,
      },
      {
        source: '/ndt-level-2-course',
        destination: '/courses/ndt-level-2-course',
        permanent: true,
      },
      {
        source: '/qa-and-qc-course',
        destination: '/courses/qa-and-qc-course',
        permanent: true,
      },
      {
        source: '/fire-safety-course',
        destination: '/courses/fire-safety-course',
        permanent: true,
      },
      {
        source: '/hvac-course',
        destination: '/courses/hvac-course',
        permanent: true,
      },
      {
        source: '/revit-mep-training-course-fees',
        destination: '/courses/revit-mep-training-course-fees',
        permanent: true,
      },
      {
        source: '/cswip-3-1-course',
        destination: '/courses/cswip-3-1-course',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
