import QRCode from 'qrcode';
import type { CertificateFace } from '@/components/CertificateDocument';
import { verificationUrl, fmtCertDate } from '@/components/CertificateDocument';

/**
 * Builds the certificate as a standalone file and saves it to the visitor's
 * downloads. The verification page uses this instead of an on-screen preview:
 * the visitor types their ID and the certificate arrives as a file.
 *
 * The document is fully self-contained — inline CSS and an embedded QR image —
 * so it opens and prints identically offline, and it opens the print dialog on
 * load so "save as PDF" is one step away.
 */
async function fetchDataUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export async function downloadCertificate(cert: CertificateFace): Promise<void> {
  const url = verificationUrl(cert.certificate_no);
  const [qr, logo, seal, signature, identity] = await Promise.all([
    QRCode.toDataURL(url, {
      margin: 0,
      width: 320,
      errorCorrectionLevel: 'M',
      color: { dark: '#102B46ff', light: '#ffffffff' },
    }).catch(() => ''),
    fetchDataUrl('/brand/logo.jpg'),
    fetchDataUrl('/api/branding?asset=seal'),
    fetchDataUrl('/api/branding?asset=signature'),
    fetch('/api/branding', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
  ]);

  const html = certificateHtml(cert, qr, url, {
    logo,
    seal,
    signature,
    signatoryName: identity?.signatoryName || '',
    signatoryDesignation: identity?.signatoryDesignation || '',
  });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${safeName(cert.certificate_no)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke late: Safari cancels the download if the URL dies too early.
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

function safeName(certificateNo: string) {
  return `Certificate-${certificateNo.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function esc(value?: string) {
  return (value ?? '—').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

function certificateHtml(
  cert: CertificateFace,
  qr: string,
  url: string,
  assets: { logo: string; seal: string; signature: string; signatoryName: string; signatoryDesignation: string },
) {
  const field = (k: string, v: string) =>
    `<div class="field"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(cert.certificate_no)} — ${esc(cert.student_name)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px; background: #f2f1ee; color: #0a0b0c;
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  }
  .sheet {
    max-width: 1000px; margin: 0 auto; background: #fbfbf9; color: #102B46;
    border: 10px double #00543d; padding: 36px;
  }
  .sheet.revoked { border-color: #b91c1c; }
  .revoked-note { margin: 0 0 18px; text-align: center; color: #b91c1c; letter-spacing: .18em; text-transform: uppercase; font-size: 11px; font-weight: 700; }
  .inner { border: 1px solid rgba(0,84,61,.25); padding: 36px; text-align: center; }
  .brand { display: flex; align-items: center; justify-content: center; }
  .brand img { width: 112px; height: 112px; object-fit: contain; }
  h1 { font-family: Georgia, "Times New Roman", serif; color: #102B46; font-size: 34px; font-weight: 400; margin: 28px 0 8px; }
  .lede { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: rgba(16,43,70,.7); margin: 18px 0 0; }
  .person { font-family: Georgia, "Times New Roman", serif; font-size: 32px; margin: 12px 0 0; }
  .rule { width: 160px; margin: 12px auto 0; border-top: 1px solid rgba(0,84,61,.5); }
  .course-lead { font-size: 14px; color: rgba(16,43,70,.8); margin: 18px 0 0; }
  .course { font-size: 20px; font-weight: 650; color: #00543d; margin: 8px 0 0; }
  .fields { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin: 28px 0 8px; }
  .field { display: flex; flex-direction: column; gap: 2px; min-width: 140px; }
  .k { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: rgba(16,43,70,.5); }
  .v { font-size: 12px; font-weight: 600; color: #102B46; }
  .sign { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-top: 48px; }
  .sig, .seal-slot, .qr { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 140px; }
  .sig img, .seal-slot img { max-height: 72px; max-width: 160px; object-fit: contain; }
  .sig .line { width: 160px; border-top: 1px solid rgba(16,43,70,.3); }
  .sig .who { font-size: 14px; color: #102B46; }
  .sig .role, .seal-slot .role { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: rgba(16,43,70,.6); }
  .qr img { width: 80px; height: 80px; display: block; }
  .qr span { display: block; font-size: 8px; letter-spacing: .1em; text-transform: uppercase; color: rgba(16,43,70,.5); margin-top: 6px; }
  .verify { margin: 18px auto 0; font-size: 10px; color: rgba(0,0,0,.5); word-break: break-all; max-width: 1000px; text-align: center; }
  .hint { max-width: 1000px; margin: 16px auto 0; font-size: 12px; color: #4a4a4a; text-align: center; }
  @media print { body { background: #fff; padding: 0; } .sheet { border-width: 4px; } .hint { display: none; } }
</style>
</head>
<body>
  <div class="sheet${cert.status === 'revoked' ? ' revoked' : ''}">
    <div class="inner">
      ${cert.status === 'revoked' ? '<p class="revoked-note">Revoked — this certificate is not valid</p>' : ''}
      <div class="brand">
        ${assets.logo ? `<img src="${assets.logo}" alt="Savvy Training Institute" />` : '<p>SAVVY TRAINING INSTITUTE</p>'}
      </div>
      <h1>Certificate of Completion</h1>
      <p class="lede">This is to certify that</p>
      <p class="person">${esc(cert.student_name)}</p>
      <div class="rule"></div>
      <p class="course-lead">has successfully completed the course</p>
      <p class="course">${esc(cert.course_title)}</p>
      ${cert.grade ? `<p class="course-lead">Grade ${esc(cert.grade)}</p>` : ''}
      <div class="fields">
        ${field('Certificate No.', cert.certificate_no)}
        ${field('Issued on', fmtCertDate(cert.issue_date))}
        ${cert.course_end ? field('Completion date', fmtCertDate(cert.course_end)) : ''}
        ${cert.course_start ? field('Course start', fmtCertDate(cert.course_start)) : ''}
        ${cert.expiry_date ? field('Valid until', fmtCertDate(cert.expiry_date)) : ''}
        ${cert.enrollment_no ? field('Enrolment ID', cert.enrollment_no) : ''}
      </div>
      <div class="sign">
        <div class="sig">
          ${assets.signature ? `<img src="${assets.signature}" alt="Authorized signature" />` : '<span style="height:72px"></span>'}
          <span class="line"></span>
          ${assets.signatoryName ? `<span class="who">${esc(assets.signatoryName)}</span>` : ''}
          ${assets.signatoryDesignation || assets.signature ? `<span class="role">${esc(assets.signatoryDesignation || 'Authorized signatory')}</span>` : ''}
        </div>
        <div class="qr">
          ${qr ? `<img src="${qr}" alt="QR code that opens the verification page for ${esc(cert.certificate_no)}" />` : ''}
          <span>Scan to verify</span>
        </div>
        <div class="seal-slot">
          ${assets.seal ? `<img src="${assets.seal}" alt="Institute seal" />` : '<span style="height:72px"></span>'}
          ${assets.seal ? '<span class="role">Institute seal</span>' : ''}
        </div>
      </div>
    </div>
  </div>
  <p class="verify">${esc(url)}</p>
  <p class="hint">Print this page, or choose “Save as PDF” in the print dialog, to keep a PDF copy.</p>
  <script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 400); });</script>
</body>
</html>`;
}
