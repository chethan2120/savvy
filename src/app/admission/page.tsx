import React from 'react';
import { PageHero } from '@/components/PageHero';
import { AdmissionForm } from '@/components/AdmissionForm';
import { CheckCircle2, ShieldCheck, CreditCard, FileCheck, PhoneCall } from 'lucide-react';

export const metadata = {
  title: 'Admission & Fee Structure | Apply Online for NDT & QA/QC',
  description:
    'Join certified NDT Level 2, QA/QC, Fire & Safety, HVAC, and Revit MEP training. Check fees, flexible payment options, required documents, and submit your admission form.',
};

export default function AdmissionPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Full-bleed hero */}
      <PageHero
        breadcrumbs={[{ label: 'Admission' }]}
        title={<>Student Admission &amp; Enrolment</>}
        description="Start your professional journey in industrial non-destructive testing and quality inspection. Review our simple admission process and submit your application online."
        media={{ type: 'image', src: '/images/hero-admission.png' }}
        mediaAlt="Technical notebook, caliper and enrolment lanyard on a workshop desk"
      />

      {/* Process & Payment Info */}
      <section className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal text-foreground">1. Free Counselling</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Submit your details online or speak directly with our senior counsellors to choose the best program based on your qualification and career goals.
            </p>
          </div>

          <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-periwinkle/30 text-foreground flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal text-foreground">2. Flexible Fee Payment</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pay course fees in convenient installments. We accept UPI, online bank transfers, debit/credit cards, cheques, and cash payments at our Bengaluru training centre.
            </p>
          </div>

          <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-yellow/40 text-foreground flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal text-foreground">3. Document Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your photo and last qualification marksheet. Documents are verified by our admissions cell to issue your official student enrolment card.
            </p>
          </div>
        </div>
      </section>

      {/* Main Admission Application Form */}
      <section className="site-container">
        <div className="max-w-4xl mx-auto">
          <AdmissionForm />
        </div>
      </section>
    </div>
  );
}
