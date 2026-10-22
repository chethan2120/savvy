import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { defaultSettings } from '@/lib/data';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * `viewport-fit=cover` is what makes the `env(safe-area-inset-*)` padding in
 * globals.css actually resolve on notched phones; without it the drawer CTA
 * and the WhatsApp button sit under the home indicator.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f9f9' },
    { media: '(prefers-color-scheme: dark)', color: '#00543d' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://savvytraining.example'),
  title: {
    default: 'Savvy Training Institute | Best NDT Level 2 & QA/QC Training in India',
    template: '%s | Savvy Training Institute',
  },
  description:
    'Training programmes in NDT Level II, QA/QC Inspection, Fire & Safety, HVAC, and Revit MEP.',
  keywords: [
    'NDT Level 2 Course',
    'ASNT Level 2 Certification',
    'Best NDT Training Institute in India',
    'QA/QC Course Bengaluru',
    'Fire and Safety Diploma',
    'HVAC Training',
    'Revit MEP Course',
    'CSWIP 3.1 Welding Inspector',
  ],
  authors: [{ name: 'Savvy Training Institute' }],
  creator: 'Savvy Training Institute',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://savvytraining.example',
    siteName: 'Savvy Training Institute',
    title: 'Savvy Training Institute | NDT Level 2 & QA/QC Certification',
    description:
      'NDT Level II, QA/QC, Fire & Safety, HVAC, and Revit MEP training programmes.',
    images: [
      {
        url: '/images/library/inspection.jpg',
        width: 1200,
        height: 630,
        alt: 'Savvy Training Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: defaultSettings.site_name,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://savvytraining.example',
    telephone: defaultSettings.phone_primary,
    email: defaultSettings.email_primary,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Training Centre',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    sameAs: [
      defaultSettings.facebook_url,
      defaultSettings.youtube_url,
      defaultSettings.twitter_url,
      defaultSettings.instagram_url,
    ].filter(Boolean),
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans min-h-[100svh] flex flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll>
          <SiteChrome>{children}</SiteChrome>
        </SmoothScroll>
      </body>
    </html>
  );
}
