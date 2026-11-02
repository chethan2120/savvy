'use client';

import React, { useState } from 'react';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { accreditationSectors, accreditationSteps } from '@/lib/academy-content';

const fieldClass = 'w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#1F1F1F] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/15';

export default function AccreditationPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('loading');
    setMessage('');
    const data = new FormData(form);
    data.set('category', 'contact');
    data.set('courseName', 'Accreditation application');
    const details = [
      `Business: ${data.get('businessName') || ''}`,
      `Sector: ${data.get('sector') || ''}`,
      `Course to accredit: ${data.get('courseToAccredit') || ''}`,
    ].join('\n');
    data.set('message', details);
    data.set('otherCourse', String(data.get('courseToAccredit') || ''));
    try {
      const response = await fetch('/api/contacts', { method: 'POST', body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setStatus('error');
        setMessage(result.message || 'The application could not be sent.');
        return;
      }
      setStatus('success');
      setMessage('Your application has been received. You will get an email within 3 working days.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('The application could not be sent. Please try again.');
    }
  }

  return (
    <div className="bg-white pb-20">
      <PageHeroBanner
        badgeText="Accreditation"
        title="Certify your training in your own right"
        description="Private companies and individuals can apply. Every sector is welcome. Lisa reviews the course against content, assessment and learner-safety standards."
        imageSrc="/images/heroes/about-hero.jpg"
        imageAlt="Savvy training workspace"
      />
      <section className="site-container py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ol className="flex flex-col gap-4">
          {accreditationSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">0{index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-[#1F1F1F]">{step.title}</h2>
              <p className="mt-1 text-sm text-[#565656]">{step.body}</p>
            </li>
          ))}
        </ol>
        <form onSubmit={onSubmit} className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[#1F1F1F]">Apply for accreditation</h2>
          <label className="text-sm font-semibold">Full name
            <input name="fullName" required className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm font-semibold">Business name
            <input name="businessName" required className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm font-semibold">Email
            <input name="email" type="email" required className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm font-semibold">Contact number
            <input name="phone" required className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm font-semibold">Sector
            <select name="sector" required className={`${fieldClass} mt-1`} defaultValue="">
              <option value="" disabled>Choose a sector</option>
              {accreditationSectors.map((item) => <option key={item}>{item}</option>)}
              <option>Other</option>
            </select>
          </label>
          <label className="text-sm font-semibold">Course to accredit
            <input name="courseToAccredit" required className={`${fieldClass} mt-1`} />
          </label>
          <label className="text-sm font-semibold">Documents (PDF, Word or images, up to 5 files, 5 MB each)
            <input name="documents" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" className={`${fieldClass} mt-1`} />
          </label>
          <p className="text-xs text-[#687587]">The reference site stores manuals, lesson plans, assessment materials, insurance and your own qualifications in the applicant account. Files sent here are stored privately for the administrator.</p>
          <button type="submit" disabled={status === 'loading'} className="rounded-full bg-[#0056D2] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {status === 'loading' ? 'Sending…' : 'Submit application'}
          </button>
          {message && <p role="status" className={`text-sm ${status === 'error' ? 'text-red-700' : 'text-[#166534]'}`}>{message}</p>}
        </form>
      </section>
    </div>
  );
}
