'use client';

import React, { useState } from 'react';
import { careerAvailability, careerSpecialisms, mentorshipServices } from '@/lib/academy-content';

const fieldClass = 'w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#1F1F1F] focus:border-[#0056D2] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/15';

function Shell({
  title,
  children,
  onSubmit,
  status,
  message,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-[#1F1F1F]">{title}</h2>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {children}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0056D2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00419e] disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Submit'}
      </button>
      {message && (
        <p role="status" className={`text-sm ${status === 'error' ? 'text-red-700' : 'text-[#166534]'}`}>
          {message}
        </p>
      )}
    </form>
  );
}

export function CareerEnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/contacts', { method: 'POST', body: new FormData(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setStatus('error');
        setMessage(data.message || 'The CV could not be submitted.');
        return;
      }
      setStatus('success');
      setMessage('Your CV has been added. Savvy will email you when there is a match. Your details are only shared with matched employers.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('The form could not be sent. Please try again.');
    }
  }

  return (
    <Shell title="Submit your CV" onSubmit={onSubmit} status={status} message={message}>
      <input type="hidden" name="category" value="career" />
      <label className="text-sm font-semibold text-[#1F1F1F]">Full name
        <input name="fullName" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Email
        <input name="email" type="email" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Contact number <span className="font-normal text-[#687587]">(optional)</span>
        <input name="phone" className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Location
        <input name="location" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Specialism
        <select name="specialism" required className={`${fieldClass} mt-1`} defaultValue="">
          <option value="" disabled>Choose a specialism</option>
          {careerSpecialisms.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Availability
        <select name="availability" required className={`${fieldClass} mt-1`} defaultValue="">
          <option value="" disabled>Choose availability</option>
          {careerAvailability.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">CV (PDF or Word, up to 5 MB)
        <input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className={`${fieldClass} mt-1`} />
      </label>
    </Shell>
  );
}

export function MentorshipEnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'mentorship',
          fullName: data.get('fullName'),
          email: data.get('email'),
          phone: data.get('phone'),
          supportType: data.get('supportType'),
          message: data.get('message'),
          courseName: data.get('supportType'),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setStatus('error');
        setMessage(result.message || 'The request could not be sent.');
        return;
      }
      setStatus('success');
      setMessage('Thank you. Lisa will be in touch.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('The form could not be sent. Please try again.');
    }
  }

  return (
    <Shell title="Request support" onSubmit={onSubmit} status={status} message={message}>
      <label className="text-sm font-semibold text-[#1F1F1F]">Full name
        <input name="fullName" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Email
        <input name="email" type="email" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Contact number
        <input name="phone" required className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Type of support required
        <select name="supportType" required className={`${fieldClass} mt-1`} defaultValue="">
          <option value="" disabled>I need help with</option>
          {mentorshipServices.map((item) => <option key={item.option}>{item.option}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-[#1F1F1F]">Business plans or requirements
        <textarea name="message" required rows={5} className={`${fieldClass} mt-1`} />
      </label>
    </Shell>
  );
}
