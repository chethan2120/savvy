import React from 'react';
import { PageHero } from '@/components/PageHero';
import { defaultSettings } from '@/lib/data';

export const metadata = {
  title: 'Privacy Policy | Savvy Training Institute',
  description: 'Privacy Policy and data protection guidelines for Savvy Training Institute students and visitors.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      <PageHero
        breadcrumbs={[{ label: 'Privacy Policy' }]}
        title="Privacy Policy"
        description="Last updated: July 24, 2026"
        media={{ type: 'image', src: '/images/hero-legal.png' }}
        mediaAlt="Layered document edges"
        compact
      />

      <section className="site-container max-w-4xl">
        <div className="editorial-card p-8 md:p-12 bg-surface flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-normal text-foreground">1. Data Collection</h2>
          <p>
            Savvy Training Institute collects personal information provided voluntarily through our admission forms, contact inquiries, and newsletter signups. This information includes your name, email address, phone number, qualification, city, and uploaded marksheets or photos.
          </p>

          <h2 className="text-xl font-normal text-foreground">2. Purpose of Data Use</h2>
          <p>
            Your information is used strictly to process course enrolments, communicate training schedules, verify prerequisites, provide job placement assistance, and respond to your inquiries.
          </p>

          <h2 className="text-xl font-normal text-foreground">3. Information Security &amp; Sharing</h2>
          <p>
            We implement strict database security protocols and Row Level Security (RLS) policies via Supabase. We do not sell, rent, or trade student data to third-party marketers.
          </p>

          <h2 className="text-xl font-normal text-foreground">4. Contact Us</h2>
          <p>
            For any questions regarding your data privacy, contact us at {defaultSettings.email_primary} or call {defaultSettings.phone_primary}. The email address is a placeholder and is not a working inbox yet.
          </p>
        </div>
      </section>
    </div>
  );
}
