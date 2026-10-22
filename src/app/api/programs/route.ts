import { NextResponse } from 'next/server';
import { courseLinksFor, enrollmentCounts, programs, refreshCourseCatalog, rosterForStaff, staffAllows } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET() {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to view programs.' }, { status: 401 });
  await refreshCourseCatalog();
  const catalog = programs();
  const showCounts = account.role === 'admin' || (account.role === 'staff' && (staffAllows(account, 'viewEnrolledStudents') || staffAllows(account, 'viewStudents')));
  return NextResponse.json({
    programs: catalog,
    links: courseLinksFor(account),
    counts: showCounts ? enrollmentCounts() : {},
    roster: account.role === 'staff' ? rosterForStaff(account.id) : [],
  });
}
