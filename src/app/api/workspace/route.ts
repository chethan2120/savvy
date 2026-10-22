import { NextResponse } from 'next/server';
import {
  assignCategory,
  createCustomCourse,
  saveCourseDetails,
  listAnnouncements,
  listAccounts,
  listCategories,
  listEnrollmentRequests,
  listLeave,
  listMarks,
  markNotificationsRead,
  notificationsFor,
  overviewCounts,
  programs,
  requestLeave,
  reviewEnrollment,
  reviewLeave,
  saveAnnouncement,
  saveCategory,
  saveMark,
  archiveChapter,
  assignInstructor,
  brandingState,
  clearInstructor,
  courseRecord,
  issueCertificate,
  listCertificates,
  orderChapters,
  revokeCertificate,
  refreshCourseCatalog,
  saveChapter,
  savePermissions,
  saveStudentAccess,
  staffAllows,
  studentAccessPolicy,
  type StaffPermissions,
} from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });
  await refreshCourseCatalog();
  const resource = new URL(request.url).searchParams.get('resource');
  if (resource === 'overview' && account.role === 'admin') return NextResponse.json(overviewCounts());
  if (resource === 'requests' && account.role === 'admin') return NextResponse.json({ requests: listEnrollmentRequests() });
  if (resource === 'categories') return NextResponse.json({ categories: listCategories(), courses: programs() });
  if (resource === 'marks') {
    const url = new URL(request.url);
    if (account.role === 'student') return NextResponse.json({ marks: listMarks({ accountId: account.id }) });
    if (account.role === 'staff' && !staffAllows(account, 'viewStudents') && !staffAllows(account, 'markAttendance')) {
      return NextResponse.json({ message: 'You do not have permission to view attendance.' }, { status: 403 });
    }
    return NextResponse.json({
      marks: listMarks({
        accountId: url.searchParams.get('accountId') || undefined,
        role: url.searchParams.get('role') || undefined,
        date: url.searchParams.get('date') || undefined,
        courseId: url.searchParams.get('courseId') || undefined,
      }),
      courses: programs(),
    });
  }
  if (resource === 'directory') {
    if (account.role === 'student' || (account.role === 'staff' && !staffAllows(account, 'viewStudents') && !staffAllows(account, 'markAttendance'))) {
      return NextResponse.json({ message: 'You do not have permission to view that directory.' }, { status: 403 });
    }
    const people = listAccounts()
      .filter((person) => person.role !== 'admin')
      .map((person) => ({ id: person.id, fullName: person.fullName, role: person.role, email: person.email }));
    return NextResponse.json({ people });
  }
  if (resource === 'notifications') return NextResponse.json({ notifications: notificationsFor(account.id) });
  if (resource === 'announcements') return NextResponse.json({ announcements: listAnnouncements(account.role) });
  if (resource === 'leave') return NextResponse.json({ leave: listLeave(account) });
  if (resource === 'course') {
    const result = courseRecord(new URL(request.url).searchParams.get('id') ?? '', account);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
    return NextResponse.json(result);
  }
  if (resource === 'certificates') return NextResponse.json({ certificates: listCertificates(account) });
  if (resource === 'student-access' && account.role === 'admin') return NextResponse.json({ access: studentAccessPolicy(), branding: brandingState() });
  return NextResponse.json({ message: 'Unknown workspace request.' }, { status: 400 });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });
  await refreshCourseCatalog();
  const body = await request.json().catch(() => ({}));
  const resource = String(body.resource ?? '');

  if (resource === 'review-enrollment') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can review enrolment requests.' }, { status: 403 });
    const result = reviewEnrollment(account.id, String(body.id ?? ''), body.decision === 'rejected' ? 'rejected' : 'approved', body.reason ? String(body.reason) : undefined);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'category') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can manage categories.' }, { status: 403 });
    const result = saveCategory({ id: body.id ? String(body.id) : undefined, name: String(body.name ?? ''), description: String(body.description ?? ''), active: body.active !== false });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ category: result.category });
  }

  if (resource === 'course') {
    if (account.role !== 'admin' && !(account.role === 'staff' && staffAllows(account, 'manageCourses'))) {
      return NextResponse.json({ message: 'You do not have permission to edit courses.' }, { status: 403 });
    }
    const lines = (value: unknown) => Array.isArray(value) ? value.map(String) : String(value ?? '').split('\n');
    const amount = (value: unknown) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number(String(value).replace(/[₹,\s]/g, ''));
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    };
    const draft = {
      id: body.id ? String(body.id) : undefined,
      title: String(body.title ?? ''),
      duration: String(body.duration ?? ''),
      description: String(body.description ?? ''),
      shortDescription: String(body.shortDescription ?? ''),
      categoryId: String(body.categoryId ?? ''),
      priceInr: amount(body.priceInr),
      studyHours: amount(body.studyHours),
      manualChapterCount: amount(body.manualChapterCount),
      certificate: String(body.certificate ?? ''),
      prerequisites: lines(body.prerequisites),
      outcomes: lines(body.outcomes),
      visible: body.visible !== false,
    };
    const result = draft.id ? saveCourseDetails(draft) : createCustomCourse(draft);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ course: result.course });
  }

  if (resource === 'assign-category') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can move courses between categories.' }, { status: 403 });
    const result = assignCategory(String(body.courseId ?? ''), String(body.categoryId ?? ''));
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'permissions') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can change permissions.' }, { status: 403 });
    const permissions = body.permissions as StaffPermissions;
    const result = savePermissions(String(body.accountId ?? ''), {
      manageCourses: Boolean(permissions?.manageCourses),
      markAttendance: Boolean(permissions?.markAttendance),
      uploadMaterials: Boolean(permissions?.uploadMaterials),
      viewStudents: Boolean(permissions?.viewStudents),
      manageAnnouncements: Boolean(permissions?.manageAnnouncements),
      viewEnrollments: Boolean(permissions?.viewEnrollments),
      viewAssignedCourses: permissions?.viewAssignedCourses !== false,
      viewAllCourses: Boolean(permissions?.viewAllCourses),
      editCourses: Boolean(permissions?.editCourses),
      manageChapters: Boolean(permissions?.manageChapters),
      addChapters: Boolean(permissions?.addChapters),
      editChapters: Boolean(permissions?.editChapters),
      publishChapters: Boolean(permissions?.publishChapters),
      viewEnrolledStudents: permissions?.viewEnrolledStudents !== false,
      assignTeachingStaff: Boolean(permissions?.assignTeachingStaff),
      manageEnrolments: Boolean(permissions?.manageEnrolments),
    });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ account: result.account });
  }

  if (resource === 'mark') {
    if (!staffAllows(account, 'markAttendance')) return NextResponse.json({ message: 'You do not have permission to mark attendance.' }, { status: 403 });
    const status = body.status === 'absent' || body.status === 'late' ? body.status : 'present';
    const result = saveMark(account.id, { accountId: String(body.accountId ?? ''), courseId: String(body.courseId ?? ''), date: String(body.date ?? ''), status });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'read-notifications') {
    markNotificationsRead(account.id);
    return NextResponse.json({ ok: true });
  }

  if (resource === 'announcement') {
    if (account.role !== 'admin' && !staffAllows(account, 'manageAnnouncements')) {
      return NextResponse.json({ message: 'You do not have permission to publish announcements.' }, { status: 403 });
    }
    const audience = body.audience === 'staff' || body.audience === 'students' ? body.audience : 'both';
    const result = saveAnnouncement({ id: body.id ? String(body.id) : undefined, title: String(body.title ?? ''), body: String(body.body ?? ''), audience, published: body.published !== false });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ announcement: result.announcement });
  }

  if (resource === 'leave') {
    if (account.role !== 'staff') return NextResponse.json({ message: 'Staff members submit leave requests.' }, { status: 403 });
    const result = requestLeave(account.id, { startDate: String(body.startDate ?? ''), endDate: String(body.endDate ?? ''), reason: String(body.reason ?? '') });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'review-leave') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can review leave.' }, { status: 403 });
    const result = reviewLeave(String(body.id ?? ''), body.decision === 'rejected' ? 'rejected' : 'approved');
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'chapter') {
    const hours = body.studyHours === '' || body.studyHours == null ? null : Number(body.studyHours);
    const result = saveChapter(account, {
      id: body.id ? String(body.id) : undefined,
      courseId: String(body.courseId ?? ''),
      title: String(body.title ?? ''),
      description: String(body.description ?? ''),
      sortOrder: body.sortOrder == null ? undefined : Number(body.sortOrder),
      studyHours: hours,
      objectives: String(body.objectives ?? ''),
      content: String(body.content ?? ''),
      status: body.status === 'published' ? 'published' : 'draft',
    });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 403 });
    return NextResponse.json({ chapter: result.chapter });
  }

  if (resource === 'archive-chapter') {
    const result = archiveChapter(account, String(body.id ?? ''));
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'order-chapters') {
    const result = orderChapters(account, String(body.courseId ?? ''), Array.isArray(body.ids) ? body.ids.map(String) : []);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'assign-instructor') {
    const result = assignInstructor(account, String(body.courseId ?? ''), String(body.accountId ?? ''));
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'clear-instructor') {
    const result = clearInstructor(account, String(body.courseId ?? ''), String(body.accountId ?? ''));
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  if (resource === 'student-access') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can change student access.' }, { status: 403 });
    if (!body.access || typeof body.access !== 'object') return NextResponse.json({ message: 'Student access was not provided.' }, { status: 400 });
    return NextResponse.json({ access: saveStudentAccess(body.access) });
  }

  if (resource === 'issue-certificate') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can issue certificates.' }, { status: 403 });
    const result = issueCertificate(account.id, { studentId: String(body.studentId ?? ''), courseId: String(body.courseId ?? ''), completionDate: body.completionDate ? String(body.completionDate) : null });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ certificate: result.certificate });
  }

  if (resource === 'revoke-certificate') {
    if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can revoke certificates.' }, { status: 403 });
    const result = revokeCertificate(String(body.id ?? ''));
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ certificate: result.certificate });
  }

  return NextResponse.json({ message: 'Unknown workspace action.' }, { status: 400 });
}
