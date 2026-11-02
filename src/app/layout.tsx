import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import '@/styles/globals.css';
import { AppShell } from '@/components/layout/AppShell';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  title: 'Savvy Training Institute | Professional Development & Certification',
  description:
    'Premier professional training institute delivering industry-standard certification courses in NDT Level II, QA/QC Inspection, Fire & Safety, and Advanced MEP Engineering.',
  keywords: [
    'NDT Level II',
    'QA QC Course',
    'Fire and Safety Diploma',
    'HVAC Engineering',
    'Revit MEP BIM',
    'CSWIP 3.1 Welding Inspector',
    'ASNT Certification',
    'Technical Training Institute',
  ],
  authors: [{ name: 'Savvy Training Institute' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Savvy Training Institute | Professional Development & Certification',
    description:
      'Premier professional training institute delivering industry-standard certification courses.',
    url: '/',
    siteName: 'Savvy Training Institute',
    locale: 'en_GB',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/brand/logo.jpg', type: 'image/jpeg' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/brand/logo.jpg',
    apple: '/brand/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} js-reveal scroll-smooth`}>
      <body className={`${sourceSans.className} antialiased bg-white text-[#010101]`}>
        <noscript>
          <style>{`main.public-site section, main.public-site .reveal-stagger > * { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
