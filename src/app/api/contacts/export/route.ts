import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { listContactEnquiries } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

/**
 * Sanitizes untrusted user strings against CSV / Excel Formula Injection (DDE injection).
 * If a value starts with =, +, -, @, or tab/return, prepend a single quote so Excel treats it as plain text.
 */
function sanitizeFormulaInjection(value: unknown): string {
  if (value == null) return '';
  const str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Unauthorized. Administrator access required.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query') || undefined;
  const course = url.searchParams.get('course') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const startDate = url.searchParams.get('startDate') || undefined;
  const endDate = url.searchParams.get('endDate') || undefined;

  // Retrieve ALL matching enquiries respecting filters
  const enquiries = listContactEnquiries({ query, course, status, startDate, endDate });

  const rows = enquiries.map((enq, index) => ({
    '#': index + 1,
    'Submission Date & Time': enq.createdAt ? new Date(enq.createdAt).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }) : '',
    'Full Name': sanitizeFormulaInjection(enq.fullName),
    'Contact Number': sanitizeFormulaInjection(enq.phone),
    'Email Address': sanitizeFormulaInjection(enq.email),
    'Location': sanitizeFormulaInjection(enq.location),
    'Course of Interest': sanitizeFormulaInjection(enq.courseName),
    'Other Course Request': sanitizeFormulaInjection(enq.otherCourse || '—'),
    'Status': enq.status.toUpperCase(),
    'Message': sanitizeFormulaInjection(enq.message || '—'),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [
    {
      '#': '',
      'Submission Date & Time': '',
      'Full Name': 'No matching enquiries found',
      'Contact Number': '',
      'Email Address': '',
      'Location': '',
      'Course of Interest': '',
      'Other Course Request': '',
      'Status': '',
      'Message': '',
    }
  ]);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5 },   // #
    { wch: 22 },  // Date
    { wch: 24 },  // Name
    { wch: 18 },  // Phone
    { wch: 28 },  // Email
    { wch: 20 },  // Location
    { wch: 32 },  // Course
    { wch: 25 },  // Other
    { wch: 14 },  // Status
    { wch: 45 },  // Message
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Enquiries');

  // Generate binary buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const filename = `Savvy-Contact-Enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
