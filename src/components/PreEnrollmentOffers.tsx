'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { preEnrollmentOffersData, coursesData, defaultSettings } from '@/lib/data';
import type { PreEnrollmentOffer } from '@/lib/types';
import { Tag, Clock, Users, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/**
 * Pre-enrolment offers: students lock a seat (and a discount) before the batch
 * starts. The claim form writes a lead to `pre_enrollments`, which is
 * insert-only for the public.
 */
export const PreEnrollmentOffers: React.FC<{ offers?: PreEnrollmentOffer[] }> = ({
  offers = preEnrollmentOffersData,
}) => {
  const [claiming, setClaiming] = useState<PreEnrollmentOffer | null>(null);

  return (
    <section className="py-16 bg-surface border-y border-border">
      <div className="site-container flex flex-col gap-8">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-safety-orange font-semibold">
            Pre-Enrolment Offers
          </span>
          <h2 className="text-headline font-normal text-foreground">Book your seat before the batch opens</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Limited seats per batch. Pre-enrol now to lock the current fee, claim your discount code, and get priority
            access to our placement cell the day your course ends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="editorial-card bg-background p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-normal text-foreground">{offer.title}</h3>
                {offer.discount_label && (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow/40 text-foreground">
                    {offer.discount_label}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{offer.description}</p>

              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-auto">
                {offer.coupon_code && (
                  <span className="flex items-center gap-1.5 font-semibold text-forest">
                    <Tag className="w-3.5 h-3.5" /> {offer.coupon_code}
                  </span>
                )}
                {offer.valid_till && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Till {fmt(offer.valid_till)}
                  </span>
                )}
                {typeof offer.seats_left === 'number' && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {offer.seats_left} seats left
                  </span>
                )}
              </div>

              <button onClick={() => setClaiming(offer)} className="pill-button-forest text-xs py-2.5">
                Claim Offer &amp; Pre-Enrol
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {claiming && <ClaimDialog offer={claiming} onClose={() => setClaiming(null)} />}
    </section>
  );
};

function ClaimDialog({ offer, onClose }: { offer: PreEnrollmentOffer; onClose: () => void }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    course_slug: offer.course_slug ?? '',
    source: 'youtube',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setState('error');
      setMsg(`Backend not connected — please call ${defaultSettings.phone_primary} to pre-enrol.`);
      return;
    }
    setState('sending');
    const { error } = await supabase.from('pre_enrollments').insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      course_slug: form.course_slug || null,
      offer_id: offer.id,
      coupon_code: offer.coupon_code ?? null,
      source: form.source,
    });
    if (error) {
      setState('error');
      setMsg(error.message || 'Could not submit right now. Please try again.');
      return;
    }
    setState('done');
  };

  const input = 'w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="editorial-card bg-surface p-7 w-full max-w-md flex flex-col gap-5 my-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-normal text-foreground">{offer.title}</h3>
            {offer.coupon_code && (
              <span className="text-xs text-forest font-semibold">Code: {offer.coupon_code}</span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {state === 'done' ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <CheckCircle2 className="w-10 h-10 text-forest" />
            <p className="text-sm text-foreground">Seat reserved. Our counsellor will call you shortly.</p>
            <p className="text-xs text-muted-foreground">
              Quote code <span className="font-semibold text-forest">{offer.coupon_code}</span> when you confirm admission.
            </p>
            <button onClick={onClose} className="pill-button-secondary text-xs py-2 px-5">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input required placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={input} />
            <input required type="tel" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
            <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
            <select value={form.course_slug} onChange={(e) => setForm({ ...form, course_slug: e.target.value })} className={input}>
              <option value="">Select a course</option>
              {coursesData.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={input}>
              <option value="youtube">I found you on YouTube</option>
              <option value="website">Website</option>
              <option value="referral">Friend / referral</option>
              <option value="other">Other</option>
            </select>

            {state === 'error' && (
              <div className="flex items-start gap-2 p-3 text-xs bg-red-50 rounded-xl border border-red-200 text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{msg}</span>
              </div>
            )}

            <button type="submit" disabled={state === 'sending'} className="pill-button-forest text-xs py-3 flex items-center justify-center gap-2">
              {state === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
              {state === 'sending' ? 'Reserving…' : 'Reserve My Seat'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
