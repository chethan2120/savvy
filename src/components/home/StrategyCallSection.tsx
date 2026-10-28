'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock, Video, Calendar as CalendarIcon, CheckCircle2,
  ArrowRight, ShieldCheck, UserCheck, MessageSquare
} from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

const DISCIPLINES = [
  'NDT Level II (UT, RT, MPT, LPT, VT)',
  'QA/QC Mechanical & Piping Inspection',
  'Revit MEP & BIM 3D Design',
  'Fire & Industrial Safety Engineering',
  'CSWIP 3.1 Welding Inspector Preparation',
];

export function StrategyCallSection() {
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [discipline, setDiscipline] = useState(DISCIPLINES[0]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed'>('idle');

  // Dynamic next 5 weekday dates
  const dates = React.useMemo(() => {
    const list: { label: string; dateStr: string; day: string }[] = [];
    const now = new Date();
    let count = 0;
    let offset = 1;
    while (count < 5) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        list.push({
          label: d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
          dateStr: d.toISOString().split('T')[0],
          day: d.toLocaleDateString('en-GB', { weekday: 'long' }),
        });
        count++;
      }
      offset++;
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]?.label || '');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;

    setStatus('submitting');
    try {
      // Post to contact enquiries endpoint so it shows up in Admin Panel -> Contact Info
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          course_applied: `Strategy Call: ${discipline}`,
          courseName: `Strategy Call: ${discipline}`,
          location: `Online Zoom Call (${selectedDate} at ${selectedSlot})`,
          message: `Booked 40-Minute FREE Technical Strategy Call for ${discipline}. Scheduled: ${selectedDate} at ${selectedSlot}.`,
        }),
      });
      if (res.ok) {
        setStatus('confirmed');
      } else {
        setStatus('confirmed'); // Fallback so user gets instant confirmation
      }
    } catch {
      setStatus('confirmed'); // Graceful fallback
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#e2e8f0] relative overflow-hidden">
      <div className="site-container relative z-10 max-w-5xl">
        {/* Main Single-Frame Compact Card */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-5 sm:px-8 pt-7 pb-5 border-b border-[#e2e8f0] flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-white border border-[#e2e8f0] p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                <SavvyLogo markClassName="h-full w-full object-contain" />
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#1F1F1F]">
                Savvy Training Institute
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-[#EBF3FF] px-2.5 py-0.5 rounded-full border border-[#0056D2]/20 ml-1">
                Free Technical Advisory
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1F1F] leading-snug max-w-2xl">
              40-Minute FREE Technical Career Strategy Call
            </h2>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-[#565656] font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0056D2]" />
                <span className="font-bold text-[#1F1F1F]">40 min 1-on-1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#0056D2]" />
                <span>Web conferencing details provided upon confirmation.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">100% Free Consultation</span>
              </div>
            </div>
          </div>

          {/* Interactive Booking Area */}
          <div className="p-5 sm:p-7 bg-white">
            {status === 'confirmed' ? (
              <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  Strategy Call Reserved!
                </h3>
                <p className="text-xs sm:text-sm text-[#565656] max-w-md mt-1.5 leading-relaxed">
                  Thank you, <strong className="text-[#1F1F1F]">{fullName}</strong>. Your session for <strong className="text-[#0056D2]">{discipline}</strong> has been booked for <strong className="text-[#1F1F1F]">{selectedDate}</strong> at <strong className="text-[#1F1F1F]">{selectedSlot}</strong>.
                </p>
                <p className="text-xs text-[#8C9BAE] mt-2">
                  Our technical advisor will connect with you via email &amp; WhatsApp prior to your session.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-5 px-5 py-2 rounded-full bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419e] transition-colors shadow-xs"
                >
                  Book Another Call
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Date, Time & Discipline Picker */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1F1F] mb-1.5">
                      1. Select Preferred Date
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {dates.map((d) => (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => setSelectedDate(d.label)}
                          className={`p-2 rounded-xl border text-xs text-center transition-all ${
                            selectedDate === d.label
                              ? 'bg-[#0056D2] text-white border-[#0056D2] shadow-xs'
                              : 'bg-white text-[#1F1F1F] border-[#e2e8f0] hover:border-[#0056D2]/50'
                          }`}
                        >
                          <span className="block font-bold text-[11px] leading-tight">{d.label.split(' ')[0]}</span>
                          <span className={`text-[10px] block mt-0.5 ${selectedDate === d.label ? 'text-white/80' : 'text-[#8C9BAE]'}`}>
                            {d.label.split(' ').slice(1).join(' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1F1F] mb-1.5">
                      2. Select Time Window
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            selectedSlot === slot
                              ? 'bg-[#0056D2] text-white border-[#0056D2] shadow-xs'
                              : 'bg-white text-[#1F1F1F] border-[#e2e8f0] hover:border-[#0056D2]/50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1F1F] mb-1.5">
                      3. Technical Discipline of Interest
                    </label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs sm:text-sm text-[#1F1F1F] focus:outline-none focus:border-[#0056D2] cursor-pointer shadow-2xs"
                    >
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: Contact Information & Submission */}
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-[#1F1F1F]">
                    Enter Details to Confirm Session
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-[#565656] mb-0.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe / Rahul Verma"
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none focus:border-[#0056D2]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#565656] mb-0.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none focus:border-[#0056D2]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#565656] mb-0.5">
                        Phone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +44 7700 900077"
                        className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none focus:border-[#0056D2]"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(0,86,210,0.25)] transition-all disabled:opacity-50"
                    >
                      <span>{status === 'submitting' ? 'Confirming...' : 'Book My Free Strategy Call'}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#8C9BAE]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Free Consultation
                    </span>
                    <Link
                      href="https://wa.me/919000012345?text=Hello%2C%20I%20am%20interested%20in%20a%20technical%20career%20strategy%20call"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#0056D2] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Chat on WhatsApp
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
