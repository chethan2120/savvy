'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle2,
  AlertCircle, ShieldCheck, Building, Loader2
} from 'lucide-react';
import { getCachedCourses } from '@/lib/api-cache';
import { shopProducts, STRATEGY_CALL_LABEL } from '@/lib/academy-content';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';

interface CourseOption {
  id: string;
  title: string;
  category?: string;
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('course') || '';
  const preselectedCourseName = searchParams.get('courseName') || '';
  const preselectedItem = searchParams.get('item') || '';
  const strategyCall = searchParams.get('enquiry') === 'strategy';

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(strategyCall ? `strategy:${STRATEGY_CALL_LABEL}` : preselectedItem ? `shop:${preselectedItem}` : preselectedCourseId);
  const [otherCourse, setOtherCourse] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Anti-spam honeypot
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('savvy-enquiry');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setLocation(data.location || '');
      setMessage(data.message || '');
      if (!preselectedCourseId && !preselectedCourseName && !preselectedItem && !strategyCall) {
        setSelectedCourse(data.selectedCourse || '');
        setOtherCourse(data.otherCourse || '');
      }
    } catch {
      sessionStorage.removeItem('savvy-enquiry');
    }
  }, [preselectedCourseId, preselectedCourseName, preselectedItem, strategyCall]);

  useEffect(() => {
    if (preselectedItem) setSelectedCourse(`shop:${preselectedItem}`);
  }, [preselectedItem]);

  useEffect(() => {
    if (strategyCall) setSelectedCourse(`strategy:${STRATEGY_CALL_LABEL}`);
  }, [strategyCall]);

  useEffect(() => {
    sessionStorage.setItem('savvy-enquiry', JSON.stringify({
      fullName, phone, email, location, selectedCourse, otherCourse, message,
    }));
  }, [fullName, phone, email, location, selectedCourse, otherCourse, message]);

  // Fetch courses dynamically for the dropdown (deduplicated & cached)
  useEffect(() => {
    let mounted = true;
    getCachedCourses()
      .then((data) => {
        if (mounted && data?.courses) {
          setCourses(data.courses);
          if (preselectedCourseId || preselectedCourseName) {
            const matched = data.courses.find(
              (c: any) =>
                c.id === preselectedCourseId ||
                c.slug === preselectedCourseId ||
                (preselectedCourseName && c.title.toLowerCase() === preselectedCourseName.toLowerCase()) ||
                (preselectedCourseId && c.title.toLowerCase() === preselectedCourseId.toLowerCase())
            );
            if (matched) {
              setSelectedCourse(matched.id);
            } else if (preselectedCourseId) {
              setSelectedCourse(preselectedCourseId);
            } else if (preselectedCourseName) {
              setSelectedCourse('other');
              setOtherCourse(preselectedCourseName);
            }
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [preselectedCourseId, preselectedCourseName]);

  // If preselectedCourseName was passed and doesn't match an ID, select 'other' with that name
  useEffect(() => {
    if (preselectedCourseName && courses.length > 0) {
      const exists = courses.some((c) => c.id === selectedCourse);
      if (!exists) {
        const matched = courses.find((c) => c.title.toLowerCase() === preselectedCourseName.toLowerCase());
        if (matched) {
          setSelectedCourse(matched.id);
        } else {
          setSelectedCourse('other');
          setOtherCourse(preselectedCourseName);
        }
      }
    }
  }, [preselectedCourseName, courses, selectedCourse]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Contact number is required.';
    } else if (phone.replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Enter a valid phone number (minimum 7 digits).';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!location.trim()) {
      newErrors.location = 'Location (City / Country) is required.';
    }

    if (!selectedCourse) {
      newErrors.course = 'Please select a course of interest.';
    } else if (selectedCourse === 'other' && !otherCourse.trim()) {
      newErrors.otherCourse = 'Please specify the course you are interested in.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // Silent spam rejection if honeypot was populated
    if (honeypot) {
      setStatus('success');
      setStatusMessage('Your enquiry has been received.');
      return;
    }

    if (!validate()) {
      setStatus('error');
      setStatusMessage('Please correct the highlighted fields before submitting.');
      return;
    }

    setStatus('submitting');
    setStatusMessage('');

    // Determine course title
    let courseName = '';
    let courseId = '';

    if (selectedCourse === 'other') {
      courseName = otherCourse.trim();
    } else if (selectedCourse.startsWith('shop:')) {
      courseName = selectedCourse.slice(5);
    } else if (selectedCourse.startsWith('strategy:')) {
      courseName = STRATEGY_CALL_LABEL;
    } else {
      const match = courses.find((c) => c.id === selectedCourse || c.title === selectedCourse);
      if (match) {
        courseId = match.id;
        courseName = match.title;
      } else {
        courseName = preselectedCourseName || selectedCourse;
      }
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          courseId: courseId || undefined,
          courseName,
          otherCourse: selectedCourse === 'other' ? otherCourse.trim() : undefined,
          message: message.trim() || undefined,
          category: selectedCourse.startsWith('strategy:') ? 'strategy' : 'contact',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setStatus('success');
        setStatusMessage(
          data.message ||
            'Thank you for your enquiry. An academic advisor from Savvy Training Institute will contact you shortly.'
        );
        // Reset form
        setFullName('');
        setPhone('');
        setEmail('');
        setLocation('');
        setSelectedCourse('');
        setOtherCourse('');
        setMessage('');
        setErrors({});
      } else {
        setStatus('error');
        setStatusMessage(data.message || 'Submission could not be completed. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network connectivity error. Please verify your connection and retry.');
    }
  };

  return (
    <div className="bg-white pb-24">
      {/* Header Banner with Consistent 16:9 Hero Image */}
      <PageHeroBanner
        variant="contact"
        badgeText="Contact us"
        title="Talk to the institute about your next step"
        description="Ask about a qualification, an online course, a resource or support for your training business. The form below is the way to reach the academy."
        imageSrc="/images/heroes/contact-hero.jpg"
        imageAlt="Two people in a consultation at a training office"
        actionHref="#enquiry"
        actionLabel="Send an enquiry"
        priority={true}
      />

      {/* Main Two-Column Layout */}
      <div className="site-container mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (5 cols): Institute Information & Assurance */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 border border-[#F0E2E7] shadow-xs">
              <h2 className="text-xl font-bold text-[#1F1F1F] mb-2">
                Admissions Office
              </h2>
              <p className="text-xs text-[#565656] leading-relaxed mb-6 font-normal">
                Our advisors assist students and corporate sponsors across India, the UK, the Middle East, and internationally.
              </p>

              <div className="flex flex-col gap-5 text-xs text-[#565656]">
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FBEAF0] border border-[#B14B6C]/20 shadow-2xs flex items-center justify-center shrink-0 text-[#B14B6C]">
                    <MapPin className="w-4 h-4 text-[#B14B6C]" />
                  </div>
                  <div>
                    <strong className="block text-[#1F1F1F]">Training Centre Location</strong>
                    <span className="text-[#565656] leading-relaxed block mt-0.5 font-normal">
                      Savvy Training Institute, Main Training Complex, Bengaluru, Karnataka, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FBEAF0] border border-[#B14B6C]/20 shadow-2xs flex items-center justify-center shrink-0 text-[#B14B6C]">
                    <Phone className="w-4 h-4 text-[#B14B6C]" />
                  </div>
                  <div>
                    <strong className="block text-[#1F1F1F]">Phone &amp; WhatsApp</strong>
                    <span className="text-[#565656] leading-relaxed block mt-0.5 font-normal">
                      +91 90000 12345 / 919000012345
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FBEAF0] border border-[#B14B6C]/20 shadow-2xs flex items-center justify-center shrink-0 text-[#B14B6C]">
                    <Mail className="w-4 h-4 text-[#B14B6C]" />
                  </div>
                  <div>
                    <strong className="block text-[#1F1F1F]">Admissions Enquiries</strong>
                    <span className="text-[#565656] leading-relaxed block mt-0.5 font-normal">
                      admissions@savvytraining.example
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FBEAF0] border border-[#B14B6C]/20 shadow-2xs flex items-center justify-center shrink-0 text-[#B14B6C]">
                    <Clock className="w-4 h-4 text-[#B14B6C]" />
                  </div>
                  <div>
                    <strong className="block text-[#1F1F1F]">Office &amp; Lab Hours</strong>
                    <span className="text-[#565656] leading-relaxed block mt-0.5 font-normal">
                      Monday to Saturday: 09:00 AM – 06:30 PM (IST)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Security Note */}
            <div className="bg-gradient-to-br from-[#7A2E49] via-[#B14B6C] to-[#E7A0B6] rounded-3xl p-8 text-white shadow-md border border-[#B14B6C]/30">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
                <h3 className="text-sm font-bold">Privacy &amp; Verification</h3>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-normal">
                Your submitted contact information is stored strictly in the institute&apos;s administrative database for authorized academic review. We never share or sell student contact details.
              </p>
            </div>
          </div>

          {/* Right Column (7 cols): Properly Labelled Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0E2E7] shadow-xs">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] mb-1">
                Course Enquiry Form
              </h2>
              <p className="text-xs text-[#565656] mb-8 font-normal">
                Fields marked with an asterisk (<span className="text-rose-500">*</span>) are required.
              </p>

              {/* Status Notifications */}
              {status === 'success' && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block text-sm font-bold text-emerald-800">
                      Enquiry Submitted Successfully
                    </strong>
                    {statusMessage}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block text-sm font-bold text-rose-800">
                      Submission Notice
                    </strong>
                    {statusMessage}
                  </div>
                </div>
              )}

              <form id="enquiry" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Honeypot field (hidden from real users) */}
                <input
                  type="text"
                  name="institution_verification_token"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* 1. Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="e.g. Alexander Wright"
                    required
                    disabled={status === 'submitting'}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                        : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* 2 & 3: Contact Number + Email Address (2-column on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Contact Number */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                      Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="e.g. +44 7700 900077 or +91 98765 43210"
                      required
                      disabled={status === 'submitting'}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none ${
                        errors.phone
                          ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                          : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="e.g. alexander@example.com"
                      required
                      disabled={status === 'submitting'}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none ${
                        errors.email
                          ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                          : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* 4. Location (Typed text input) */}
                <div>
                  <label htmlFor="location" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                    Your Location (City, Country) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({ ...errors, location: '' });
                    }}
                    placeholder="e.g. London, United Kingdom or Bengaluru, India"
                    required
                    disabled={status === 'submitting'}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none ${
                      errors.location
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                        : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                    }`}
                  />
                  {errors.location && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.location}</p>
                  )}
                </div>

                {/* 5. Course of Interest Dropdown */}
                <div>
                  <label htmlFor="course" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                    Course or shop item <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      if (errors.course) setErrors({ ...errors, course: '' });
                    }}
                    required
                    disabled={status === 'submitting'}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] transition-colors focus:outline-none cursor-pointer ${
                      errors.course
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                        : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                    }`}
                  >
                    <option value="">— Select a Course —</option>
                    <option value={`strategy:${STRATEGY_CALL_LABEL}`}>{STRATEGY_CALL_LABEL}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.category ? `(${c.category})` : ''}
                      </option>
                    ))}
                    {shopProducts.map((product) => (
                      <option key={product.slug} value={`shop:${product.title}`}>
                        Shop: {product.title}
                      </option>
                    ))}
                    <option value="other">Other / Custom Course Request</option>
                  </select>
                  {errors.course && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.course}</p>
                  )}
                </div>

                {/* 6. Other Course Text Input (Revealed when 'other' is selected) */}
                {selectedCourse === 'other' && (
                  <div className="anim-pop-in">
                    <label htmlFor="otherCourse" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                      Specify Requested Course / Qualification <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="otherCourse"
                      type="text"
                      value={otherCourse}
                      onChange={(e) => {
                        setOtherCourse(e.target.value);
                        if (errors.otherCourse) setErrors({ ...errors, otherCourse: '' });
                      }}
                      placeholder="e.g. Advanced Phased Array (PAUT) or API 510 Pressure Vessel Inspector"
                      required
                      disabled={status === 'submitting'}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none ${
                        errors.otherCourse
                          ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                          : 'border-[#F0E2E7] bg-white focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]'
                      }`}
                    />
                    {errors.otherCourse && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.otherCourse}</p>
                    )}
                  </div>
                )}

                {/* 7. Message (Optional) */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                    Message or Specific Questions (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your educational background, preferred schedule (weekday/weekend), or any specific training queries..."
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E2E7] bg-white text-sm text-[#1F1F1F] placeholder-[#A08B94] transition-colors focus:outline-none focus:border-[#B14B6C] focus:ring-1 focus:ring-[#B14B6C]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full bg-[#B14B6C] hover:bg-[#8E3854] text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Submit Official Course Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <Suspense fallback={<div className="site-container py-24 text-center text-sm text-[#687587]">Loading contact page...</div>}>
      <ContactPageContent />
    </Suspense>
  );
}
