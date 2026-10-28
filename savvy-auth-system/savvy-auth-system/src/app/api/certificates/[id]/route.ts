import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type PDFImage } from 'pdf-lib';
import { brandingFile, brandingState, certificateFor, publicIdentity } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const PAGE_W = 842;
const PAGE_H = 595;
const INK = rgb(0.063, 0.169, 0.275);
const FOREST = rgb(0, 0.329, 0.239);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to download a certificate.' }, { status: 401 });
  const certificate = certificateFor(account, params.id);
  if (!certificate) return NextResponse.json({ message: 'That certificate was not found.' }, { status: 404 });
  if (certificate.status !== 'issued') return NextResponse.json({ message: 'This certificate has been revoked and can no longer be downloaded.' }, { status: 403 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const identity = publicIdentity(brandingState());

  page.drawRectangle({ x: 18, y: 18, width: PAGE_W - 36, height: PAGE_H - 36, borderColor: FOREST, borderWidth: 2.5 });
  page.drawRectangle({ x: 28, y: 28, width: PAGE_W - 56, height: PAGE_H - 56, borderColor: FOREST, borderWidth: 0.6 });

  await drawLogo(pdf, page, bold);
  center(page, 'Certificate of Completion', bold, 26, 430, INK);
  center(page, 'This is to certify that', font, 12, 392, INK);
  center(page, certificate.studentName, bold, 28, 356, INK);
  page.drawLine({ start: { x: 341, y: 346 }, end: { x: 501, y: 346 }, thickness: 0.6, color: FOREST });
  center(page, 'has successfully completed the course', font, 13, 318, INK);
  center(page, certificate.courseTitle, bold, 18, 292, FOREST);

  const issued = formatDate(certificate.issueDate.slice(0, 10));
  const facts = [`Certificate No.  ${certificate.number}`, `Issued on  ${issued}`];
  if (certificate.completionDate) facts.push(`Completion date  ${formatDate(certificate.completionDate)}`);
  center(page, facts.join('      '), font, 11, 250, INK);

  await drawAsset(pdf, page, font, brandingFile('signature'), 120, 78, identity.signatoryName, identity.signatoryDesignation || (identity.hasSignature ? 'Authorized signatory' : ''));
  await drawQr(pdf, page, font, request, certificate.number);
  await drawAsset(pdf, page, font, brandingFile('seal'), 620, 78, '', identity.hasSeal ? 'Institute seal' : '');

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${certificate.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

function center(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color: ReturnType<typeof rgb>) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: Math.max(48, (PAGE_W - width) / 2), y, size, font, color });
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function drawLogo(pdf: PDFDocument, page: PDFPage, bold: PDFFont) {
  const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo.jpg');
  if (existsSync(logoPath)) {
    try {
      const image = await pdf.embedJpg(readFileSync(logoPath));
      const size = 86;
      page.drawImage(image, { x: (PAGE_W - size) / 2, y: 488, width: size, height: size });
      return;
    } catch {
      /* Text heading below. */
    }
  }
  center(page, 'SAVVY TRAINING INSTITUTE', bold, 16, 520, FOREST);
}

async function drawQr(pdf: PDFDocument, page: PDFPage, font: PDFFont, request: Request, number: string) {
  try {
    const origin = new URL(request.url).origin;
    const target = `${origin}/verify-certificate?id=${encodeURIComponent(number)}`;
    const png = await QRCode.toBuffer(target, { margin: 0, width: 240, errorCorrectionLevel: 'M', color: { dark: '#102B46', light: '#ffffff' } });
    const image = await pdf.embedPng(png);
    page.drawImage(image, { x: 381, y: 92, width: 80, height: 80 });
    center(page, 'Scan to verify', font, 8, 78, INK);
  } catch {
    /* A missing QR must not stop the certificate file. */
  }
}

async function drawAsset(
  pdf: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  file: string | null,
  x: number,
  y: number,
  name: string,
  caption: string,
) {
  let imageBottom = y + 18;
  if (file && existsSync(file)) {
    try {
      const bytes = readFileSync(file);
      const image: PDFImage = file.toLowerCase().endsWith('.png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const scale = Math.min(140 / image.width, 64 / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      page.drawImage(image, { x, y: y + 28, width, height });
      imageBottom = y + 22;
      page.drawLine({ start: { x, y: imageBottom }, end: { x: x + Math.max(width, 120), y: imageBottom }, thickness: 0.6, color: INK });
    } catch {
      page.drawLine({ start: { x, y: imageBottom }, end: { x: x + 120, y: imageBottom }, thickness: 0.6, color: INK });
    }
  } else if (name || caption) {
    page.drawLine({ start: { x, y: imageBottom }, end: { x: x + 120, y: imageBottom }, thickness: 0.6, color: INK });
  }
  if (name) page.drawText(name, { x, y: y + 8, size: 11, font, color: INK });
  if (caption) page.drawText(caption, { x, y, size: 9, font, color: INK });
}
