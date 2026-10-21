'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { VerifiedCertificate } from '@/lib/types';
import { fmtCertDate } from '@/components/CertificateDocument';
import { downloadCertificate } from '@/lib/certificate-file';
import { friendlyError } from '@/lib/friendly-error';
import { defaultSettings } from '@/lib/data';
import {
  Search, Loader2, AlertCircle, ShieldCheck, ShieldAlert, QrCode, Download, Award, CheckCircle2,
} from 'lucide-react';

type Status = 'idle' | 'searching' | 'found' | 'notfound' | 'error';

export const CertificateVerifier: React.FC = () => {
  const params = useSearchParams();
  const prefill = params.get('id') ?? '';

  const [query, setQuery] = useState(prefill);
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<VerifiedCertificate[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [saving, setSaving] = useState('');

  const save = useCallback(async (cert: VerifiedCertificate) => {
    setSaving(cert.certificate_no);
    await downloadCertificate(cert);
    setSaving('');
    setSaved((prev) => (prev.includes(cert.certificate_no) ? prev : [...prev, cert.certificate_no]));
  }, []);

  const lookup = useCallback(async (raw: string) => {
    const id = raw.trim();
    setSaved([]);
    if (id.length < 6) {
      setStatus('error');
      setErrorMsg('Enter the full certificate number or enrolment ID — at least 6 characters.');
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus('error');
      setErrorMsg(`Verification needs a connected backend. Call the institute office on ${defaultSettings.phone_primary}.`);
      return;
    }
    setStatus('searching');
    setResults([]);
    const { data, error } = await supabase.rpc('verify_certificate', { p_query: id });
    if (error) {
      setStatus('error');
      setErrorMsg(friendlyError(error, 'certificate'));
      return;
    }
    const rows = (data as VerifiedCertificate[]) ?? [];
    setResults(rows);
    setStatus(rows.length ? 'found' : 'notfound');
  }, []);

  // A QR scan lands here with ?id=… — verify immediately.
  useEffect(() => {
    if (prefill) lookup(prefill);
  }, [prefill, lookup]);

  return (
    <div className="flex flex-col gap-8">
      <div className="editorial-card bg-surface p-8 max-w-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(query);
          }}
          className="flex flex-col gap-4"
        >
          <label htmlFor="cert-id" className="text-xs font-semibold text-foreground">
            Certificate number or enrolment ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="cert-id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SAV-2026-0101"
              className="flex-1 bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
            />
            <button
              type="submit"
              disabled={status === 'searching'}
              className="pill-button-forest text-xs py-3 px-6 flex items-center justify-center gap-2"
            >
              {status === 'searching' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {status === 'searching' ? 'Verifying' : 'Verify'}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-forest" />
            Verification shows the certificate details first. Download it afterwards with the button on the result.
            Every certificate carries a QR code that opens this page with the ID filled in.
          </p>
        </form>

        {status === 'error' && (
          <div className="mt-4 flex items-start gap-2 p-3 text-xs bg-red-50 rounded-xl border border-red-200 text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'notfound' && (
          <div className="mt-4 flex items-start gap-2 p-3 text-xs bg-yellow/20 rounded-xl border border-border text-foreground">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-safety-orange" />
            <span>
              No certificate matches that ID. Check the spelling, or call the admissions office at{' '}
              <a href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`} className="underline">{defaultSettings.phone_primary}</a>.
            </span>
          </div>
        )}
      </div>

      {status === 'found' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-forest" />
            {results.length} certificate{results.length > 1 ? 's' : ''} verified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((cert) => (
              <div key={cert.certificate_no} className="editorial-card p-6 bg-surface flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {cert.course_title}
                    </span>
                    <span className="text-lg font-normal text-foreground">{cert.student_name}</span>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      cert.is_valid ? 'bg-forest/10 text-forest' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {cert.is_valid ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {cert.is_revoked ? 'Revoked' : cert.is_valid ? 'Verified' : 'Expired'}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                  <div><dt className="text-muted-foreground">Certificate no.</dt><dd className="font-medium text-foreground">{cert.certificate_no}</dd></div>
                  <div><dt className="text-muted-foreground">Enrolment ID</dt><dd className="font-medium text-foreground">{cert.enrollment_no}</dd></div>
                  <div><dt className="text-muted-foreground">Grade</dt><dd className="font-medium text-foreground">{cert.grade}</dd></div>
                  <div><dt className="text-muted-foreground">Issued</dt><dd className="font-medium text-foreground">{fmtCertDate(cert.issue_date)}</dd></div>
                  {cert.course_start && <div><dt className="text-muted-foreground">Course start</dt><dd className="font-medium text-foreground">{fmtCertDate(cert.course_start)}</dd></div>}
                  {cert.course_end && <div><dt className="text-muted-foreground">Course end</dt><dd className="font-medium text-foreground">{fmtCertDate(cert.course_end)}</dd></div>}
                  {cert.expiry_date && <div><dt className="text-muted-foreground">Valid until</dt><dd className="font-medium text-foreground">{fmtCertDate(cert.expiry_date)}</dd></div>}
                  {cert.instructor_name && <div><dt className="text-muted-foreground">Examiner</dt><dd className="font-medium text-foreground">{cert.instructor_name}</dd></div>}
                </dl>

                {/* Download is deliberately a second, separate step: verifying
                    is what an employer came for, and the file only lands on the
                    device when someone asks for it. */}
                <div className="mt-auto flex flex-col gap-2">
                  {cert.is_revoked && (
                    <p className="text-xs text-red-700">This certificate has been revoked and is not valid.</p>
                  )}
                  <button
                    onClick={() => save(cert)}
                    disabled={saving === cert.certificate_no || Boolean(cert.is_revoked)}
                    className="pill-button-forest text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    {saving === cert.certificate_no ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {saved.includes(cert.certificate_no) ? 'Download again' : 'Download certificate'}
                  </button>
                  {saved.includes(cert.certificate_no) && (
                    <span className="text-xs text-forest flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to your downloads.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Opening the downloaded file offers “Save as PDF” in the print dialog.
          </p>
        </div>
      )}
    </div>
  );
};
