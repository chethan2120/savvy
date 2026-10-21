'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    if (!isSupabaseConfigured) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-xs text-forest bg-forest/10 border border-forest/20 p-3 rounded-xl">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Thank you! You are subscribed to our newsletter.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          aria-label="Email address for newsletter"
          className="w-full bg-white/5 border border-white/15 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-forest pr-10"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label="Subscribe"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center hover:bg-forest/80 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
      {status === 'error' && (
        <p className="text-[11px] text-red-200">
          We could not save that subscription. Please try again, or call the institute.
        </p>
      )}
    </form>
  );
};
