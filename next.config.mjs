/** @type {import('next').NextConfig} */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

const nextConfig = {
  // Next.js does not expose VITE_* to the browser. Copy them onto the names
  // the existing client already reads.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabasePublishableKey,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wwndtis.in',
      },
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
  async redirects() {
    return [
      {
        source: '/contact-us-2',
        destination: '/contact-us',
        permanent: true,
      },
      {
        source: '/mep-revit-course',
        destination: '/course/revit-mep-training-course-fees',
        permanent: true,
      },
      {
        source: '/cswip-welding-inspector-course',
        destination: '/course/cswip-3-1-course',
        permanent: true,
      },
      {
        source: '/ndt-level-2-course',
        destination: '/course/ndt-level-2-course',
        permanent: true,
      },
      {
        source: '/qa-and-qc-course',
        destination: '/course/qa-and-qc-course',
        permanent: true,
      },
      {
        source: '/fire-safety-course',
        destination: '/course/fire-safety-course',
        permanent: true,
      },
      {
        source: '/hvac-course',
        destination: '/course/hvac-course',
        permanent: true,
      },
      {
        source: '/revit-mep-training-course-fees',
        destination: '/course/revit-mep-training-course-fees',
        permanent: true,
      },
      {
        source: '/cswip-3-1-course',
        destination: '/course/cswip-3-1-course',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
