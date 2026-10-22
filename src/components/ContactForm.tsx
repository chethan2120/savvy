'use client';

import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CheckCircle, Loader2, AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { defaultSettings } from '@/lib/data';
import { useCourseCatalog } from '@/lib/useCourseCatalog';

export const ContactForm: React.FC = () => {
  const { courses } = useCourseCatalog();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_applied: 'NDT Level II Course',
    subject: '',
    message: '',
    honeypot: '', // Spam protection honeypot field
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (courses.length && !courses.some((course) => course.title === formData.course_applied)) {
      setFormData((current) => ({ ...current, course_applied: courses[0].title }));
    }
  }, [courses, formData.course_applied]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Silent honeypot rejection for bot submissions
    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    // Honest behaviour: never claim the message was saved when no backend is
    // connected. Route the user to a direct contact channel instead.
    if (!isSupabaseConfigured) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const { error } = await supabase.from('contact_submissions').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course_applied: formData.course_applied,
          subject: formData.subject || 'General Enquiry',
          message: formData.message,
          status: 'unread',
          source_page: 'contact-us',
        },
      ]);
      if (error) throw error;
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="editorial-card p-8 text-center flex flex-col items-center gap-3 bg-surface border-forest/30">
        <CheckCircle className="w-10 h-10 text-forest" />
        <h4 className="text-xl font-normal text-foreground">Message Sent</h4>
        <p className="text-xs text-muted-foreground">
          Thank you for contacting Savvy Training Institute. Our representative will respond to your query shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="editorial-card p-6 md:p-8 flex flex-col gap-5 bg-surface">
      <h3 className="text-xl font-normal text-foreground">Send Us a Message</h3>

      {status === 'error' && (
        <div
          role="alert"
          className="flex flex-col gap-3 p-4 text-xs bg-yellow/20 rounded-xl border border-border"
        >
          <div className="flex items-start gap-2 text-foreground">
            <AlertCircle className="w-4 h-4 shrink-0 text-safety-orange mt-0.5" />
            <span>
              We couldn&apos;t submit your message online just now. Please reach us
              directly — we respond fast on call and WhatsApp.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`}
              className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> {defaultSettings.phone_primary}
            </a>
            <a
              href={`https://wa.me/${defaultSettings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button-forest text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Honeypot field (hidden from human users) */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Your Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Course Applied For</label>
          <select
            name="course_applied"
            value={formData.course_applied}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          >
            {courses.length === 0 && <option value="">No courses available</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Message *</label>
        <textarea
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we help you?"
          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="pill-button-forest py-3 text-sm font-medium w-full md:w-auto self-start"
      >
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
};
