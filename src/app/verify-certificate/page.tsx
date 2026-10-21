import React, { Suspense } from 'react';
import { PageHero } from '@/components/PageHero';
import { CertificateVerifier } from '@/components/CertificateVerifier';

export const metadata = {
  title: 'Verify & Regenerate Certificate | Savvy Training Institute',
  description:
    'Enter the certificate number or enrolment ID issued by Savvy Training Institute to verify a certificate and regenerate a printable copy. Every certificate also carries a QR code that opens this page.',
};

export default function VerifyCertificatePage() {
  return (
    <div className="flex flex-col gap-10 pb-20">
      <PageHero
        breadcrumbs={[{ label: 'Verify Certificate' }]}
        title={<>Certificate Verification &amp; Regeneration</>}
        description={
          <>
            Lost your certificate? Enter the Certificate Number or the Enrolment ID given to you by the
            institute to verify its authenticity and regenerate a printable copy instantly. Employers can use
            the same page — or simply scan the QR code printed on the certificate.
          </>
        }
        media={{ type: 'image', src: '/images/hero-legal.png' }}
        mediaAlt="Certificate document"
      />

      <section className="site-container">
        <Suspense fallback={null}>
          <CertificateVerifier />
        </Suspense>
      </section>
    </div>
  );
}
