import { NextResponse } from 'next/server';
import {
  createForumThread,
  deleteForumThread,
  deleteGuestFeedback,
  deleteReview,
  listFeedbackForAdmin,
  listForumThreads,
  listPublicFeedback,
  listPublicReviews,
  listReviewsForAdmin,
  moderateThread,
  replyToThread,
  setFeedbackStatus,
  setReplyApproval,
  setReviewStatus,
  submitGuestFeedback,
  submitStudentReview,
  websiteCourses,
} from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const account = currentAccount();
  const manage = new URL(request.url).searchParams.get('manage') === '1';
  const isAdmin = account?.role === 'admin';
  return NextResponse.json({
    ok: true,
    reviews: manage && isAdmin ? listReviewsForAdmin() : listPublicReviews(),
    feedback: manage && isAdmin ? listFeedbackForAdmin() : listPublicFeedback(),
    threads: listForumThreads(manage && isAdmin),
    courses: websiteCourses().map((course) => ({ id: course.id, title: course.title })),
    canModerate: isAdmin,
    signedIn: Boolean(account),
  });
}

export async function POST(request: Request) {
  const account = currentAccount();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }
  if (String(body.website || '').trim()) return NextResponse.json({ ok: true });
  const type = String(body.type || '');
  const isAdmin = account?.role === 'admin';

  if (type === 'review-status' || type === 'delete-review' || type === 'moderate' || type === 'feedback-status' || type === 'delete-feedback' || type === 'delete-thread' || type === 'reply-status') {
    if (!isAdmin) return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
    const result = type === 'review-status'
      ? setReviewStatus(String(body.id || ''), body.status === 'approved' || body.status === 'rejected' ? body.status : 'pending')
      : type === 'delete-review'
        ? deleteReview(String(body.id || ''))
      : type === 'feedback-status'
        ? setFeedbackStatus(String(body.id || ''), body.status === 'approved' || body.status === 'hidden' ? body.status : 'pending')
        : type === 'delete-feedback'
          ? deleteGuestFeedback(String(body.id || ''))
          : type === 'delete-thread'
            ? deleteForumThread(String(body.id || ''))
            : type === 'reply-status'
              ? setReplyApproval(String(body.threadId || ''), String(body.replyId || ''), body.approved === true)
              : moderateThread(String(body.id || ''), body.action === 'hide' || body.action === 'restore' || body.action === 'report' ? body.action : 'report');
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (type === 'feedback') {
    const rating = body.rating === '' || body.rating == null ? undefined : Number(body.rating);
    const result = submitGuestFeedback({
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      body: String(body.body || ''),
      courseTitle: String(body.courseTitle || ''),
      rating,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (type === 'thread') {
    const result = createForumThread({
      title: String(body.title || ''),
      body: String(body.body || ''),
      category: String(body.category || ''),
      authorId: account?.id || 'guest',
      authorName: String(body.name || account?.fullName || ''),
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (type === 'reply') {
    const result = replyToThread({
      threadId: String(body.threadId || ''),
      body: String(body.body || ''),
      authorId: account?.id || 'guest',
      authorName: String(body.name || account?.fullName || ''),
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (type === 'review') {
    if (!account || account.role !== 'student') {
      return NextResponse.json({ ok: false, message: 'Use the public feedback form, or sign in as a student to review a course.' }, { status: 403 });
    }
    const course = websiteCourses().find((item) => item.id === body.courseId || item.slug === body.courseId);
    if (!course) return NextResponse.json({ ok: false, message: 'Choose a published course.' }, { status: 400 });
    const result = submitStudentReview({
      courseId: course.id,
      courseTitle: course.title,
      authorId: account.id,
      authorName: account.fullName,
      rating: Number(body.rating),
      body: String(body.body || ''),
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ ok: false, message: 'Unknown action.' }, { status: 400 });
}
