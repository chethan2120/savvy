'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

/**
 * The printable certificate face. Used both by the student portal (own
 * certificates) and by the public verification page (regenerated from an
 * institute-issued ID), so the printed document is byte-identical either way.
 *
 * The QR code encodes the public verification URL for this certificate number,
 * so a scan re-runs the lookup and re-renders this same document.
 */
export interface CertificateFace {
  certificate_no: string;
  student_name: string;
  course_title: string;
  grade?: string;
  issue_date: string;
  expiry_date?: string;
  instructor_name?: string;
  enrollment_no?: string;
  course_start?: string;
  course_end?: string;
  status?: 'issued' | 'revoked';
}

export function verificationUrl(certificateNo: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.ndtis.in';
  return `${origin}/verify-certificate?id=${encodeURIComponent(certificateNo)}`;
}

export function fmtCertDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

type Identity = {
  hasSeal: boolean;
  hasSignature: boolean;
  signatoryName: string;
  signatoryDesignation: string;
};

const EMPTY_IDENTITY: Identity = { hasSeal: false, hasSignature: false, signatoryName: '', signatoryDesignation: '' };

export const CertificateDocument: React.FC<{ cert: CertificateFace; setupHints?: boolean }> = ({ cert, setupHints = false }) => {
  const [qr, setQr] = useState('');
  const [identity, setIdentity] = useState<Identity>(EMPTY_IDENTITY);
  const url = verificationUrl(cert.certificate_no);
  const revoked = cert.status === 'revoked';

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { margin: 0, width: 320, errorCorrectionLevel: 'M', color: { dark: '#102B46ff', light: '#ffffffff' } })
      .then((dataUrl) => {
        if (!cancelled) setQr(dataUrl);
      })
      .catch(() => undefined);
    fetch('/api/branding', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && body) setIdentity({ ...EMPTY_IDENTITY, ...body });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      id="certificate-print"
      className={`bg-[#fbfbf9] text-[#102B46] px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12 border-[10px] border-double ${revoked ? 'border-red-700' : 'border-[#00543d]'}`}
    >
      <div className="border border-[#00543d]/25 px-4 py-8 sm:px-8 md:px-10">
        {revoked && (
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-red-700">
            Revoked — this certificate is not valid
          </p>
        )}
        <div className="flex justify-center">
          <SavvyLogo markClassName="h-14 w-14 shrink-0" />
        </div>
        <h2 className="mt-8 text-center font-serif text-3xl font-normal tracking-wide text-[#102B46] md:text-4xl">
          Certificate of Completion
        </h2>
        <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-[#102B46]/70">This is to certify that</p>
        <p className="mt-3 text-center font-serif text-3xl text-[#102B46] md:text-4xl">{cert.student_name}</p>
        <div className="mx-auto mt-3 h-px w-40 bg-[#00543d]/50" />
        <p className="mt-5 text-center text-sm text-[#102B46]/80">has successfully completed the course</p>
        <p className="mt-2 text-center text-xl font-semibold text-[#00543d]">{cert.course_title}</p>
        {cert.grade ? <p className="mt-2 text-center text-sm text-[#102B46]/70">Grade {cert.grade}</p> : null}

        <dl className="mt-8 flex flex-wrap items-start justify-center gap-x-10 gap-y-4 text-center">
          <Field k="Certificate No." v={cert.certificate_no} />
          <Field k="Issued on" v={fmtCertDate(cert.issue_date)} />
          {cert.course_end ? <Field k="Completion date" v={fmtCertDate(cert.course_end)} /> : null}
          {cert.course_start ? <Field k="Course start" v={fmtCertDate(cert.course_start)} /> : null}
          {cert.expiry_date ? <Field k="Valid until" v={fmtCertDate(cert.expiry_date)} /> : null}
          {cert.enrollment_no ? <Field k="Enrolment ID" v={cert.enrollment_no} /> : null}
        </dl>

        <div className="mt-12 grid grid-cols-1 items-end gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-end gap-1">
            {identity.hasSignature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/api/branding?asset=signature" alt="Authorized signature" className="h-16 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="h-16" />
            )}
            <span className="w-40 border-t border-[#102B46]/30" />
            {identity.signatoryName ? <span className="text-sm text-[#102B46]">{identity.signatoryName}</span> : null}
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#102B46]/60">
              {identity.signatoryDesignation || (identity.hasSignature ? 'Authorized signatory' : '')}
            </span>
            {setupHints && !identity.hasSignature ? (
              <span className="max-w-[12rem] text-center text-[10px] text-[#102B46]/55">Upload the authorized signature in Account Settings.</span>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={`QR code to verify certificate ${cert.certificate_no}`} className="h-20 w-20" />
            ) : (
              <div className="h-20 w-20 border border-[#00543d]/30" />
            )}
            <span className="text-center text-[8px] uppercase leading-tight tracking-wider text-[#102B46]/50">
              Scan to verify
            </span>
          </div>

          <div className="flex flex-col items-center justify-end gap-1">
            {identity.hasSeal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/api/branding?asset=seal" alt="Institute seal" className="h-20 w-20 object-contain" />
            ) : (
              <span className="h-20 w-20" />
            )}
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#102B46]/60">{identity.hasSeal ? 'Institute seal' : ''}</span>
            {setupHints && !identity.hasSeal ? (
              <span className="max-w-[12rem] text-center text-[10px] text-[#102B46]/55">Upload the institute seal in Account Settings.</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-black/45 uppercase tracking-wider text-[9px]">{k}</span>
      <span className="font-semibold text-black/80">{v}</span>
    </div>
  );
}
