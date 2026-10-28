import { NextResponse } from 'next/server';
import { submitContactEnquiry, listContactEnquiries, updateContactEnquiryStatus } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, message: 'Invalid submission data.' }, { status: 400 });
    }

    const result = submitContactEnquiry({
      fullName: String(body.fullName ?? body.full_name ?? body.name ?? ''),
      phone: String(body.phone ?? body.contactNumber ?? ''),
      email: String(body.email ?? ''),
      location: String(body.location ?? ''),
      courseId: body.courseId ? String(body.courseId) : undefined,
      courseName: body.courseName ?? body.course_applied ? String(body.courseName ?? body.course_applied) : undefined,
      otherCourse: body.otherCourse ? String(body.otherCourse) : undefined,
      message: body.message ? String(body.message) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    // Mirror to Supabase contact_submissions if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('contact_submissions').insert({
          name: result.enquiry.fullName,
          phone: result.enquiry.phone,
          email: result.enquiry.email,
          city: result.enquiry.location,
          course_applied: result.enquiry.courseName,
          message: [
            result.enquiry.message,
            result.enquiry.otherCourse ? `Other course: ${result.enquiry.otherCourse}` : '',
            `Location: ${result.enquiry.location}`,
          ].filter(Boolean).join(' | '),
        });
      } catch (err) {
        // Log silently; primary backend store is already updated
        console.error('Failed to mirror contact enquiry to Supabase:', err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Thank you for reaching out to Savvy Training Institute. Our academic advisor will contact you shortly.',
      enquiryId: result.enquiry.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ ok: false, message: 'An unexpected error occurred while saving your enquiry.' }, { status: 500 });
  }
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

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '15', 10)));

  const allFiltered = listContactEnquiries({ query, course, status, startDate, endDate });
  const total = allFiltered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = allFiltered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    ok: true,
    enquiries: paginated,
    total,
    page,
    limit,
    totalPages,
  });
}

export async function PATCH(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Unauthorized. Administrator access required.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  const status = body.status;

  if (!id || !status) {
    return NextResponse.json({ ok: false, message: 'Enquiry ID and valid status are required.' }, { status: 400 });
  }

  const result = updateContactEnquiryStatus(id, status);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, enquiry: result.enquiry });
}
