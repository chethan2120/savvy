/**
 * Turn a backend error into something a person can act on.
 *
 * Supabase surfaces Postgres and GoTrue messages verbatim — an admin was being
 * shown `duplicate key value violates unique constraint
 * "enrollments_student_id_course_id_key"` and a student was told only "Invalid
 * login credentials". Every user-facing catch runs through here instead, so the
 * message says what went wrong and what to do next.
 */

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

/** Message shown when nothing more specific matches — never a raw error string. */
const FALLBACK = 'Something went wrong on our side. Please try again, and contact the institute office on +91 7290095961 if it keeps happening.';

/**
 * `context` names the thing being acted on ("student", "certificate", …) so a
 * generic constraint violation can still name the record it is about.
 */
export function friendlyError(error: unknown, context?: string): string {
  const err = (error ?? {}) as SupabaseLikeError;
  const raw = (err.message ?? String(error ?? '')).trim();
  const lower = raw.toLowerCase();
  const subject = context ?? 'record';

  if (!raw) return FALLBACK;
  if (err.code === 'PGRST205' || lower.includes('schema cache')) {
    return 'The institute database tables are not installed in Supabase yet. Account, course, and attendance records are being read from the server store instead.';
  }

  // --- Sign-in -------------------------------------------------------------
  if (lower.includes('invalid login credentials')) {
    return 'That email and password do not match. Check both and try again — passwords are case sensitive.';
  }
  if (lower.includes('email not confirmed')) {
    return 'This account has not been confirmed yet. Ask the institute office to activate it for you.';
  }
  if (lower.includes('too many requests') || err.status === 429 || lower.includes('rate limit')) {
    return 'Too many attempts in a row. Wait a minute and try again.';
  }
  if (lower.includes('password') && lower.includes('at least')) {
    return 'Choose a longer password — at least 8 characters.';
  }

  // --- Postgres constraint violations --------------------------------------
  if (err.code === '23505' || lower.includes('duplicate key value')) {
    if (lower.includes('enrollments')) return 'This student is already enrolled in that course.';
    if (lower.includes('certificate')) return 'A certificate with that number already exists.';
    if (lower.includes('email')) return 'An account already uses that email address.';
    return `That ${subject} already exists.`;
  }
  if (err.code === '23503' || lower.includes('violates foreign key')) {
    return `This ${subject} is still linked to other records, so it cannot be removed yet.`;
  }
  if (err.code === '23502' || lower.includes('null value in column')) {
    return 'A required field is empty. Fill in every field marked with * and try again.';
  }
  if (err.code === '23514' || lower.includes('violates check constraint')) {
    return 'One of the values entered is not allowed. Check the form and try again.';
  }

  // --- Permissions / RLS ---------------------------------------------------
  if (
    err.code === '42501' ||
    lower.includes('row-level security') ||
    lower.includes('permission denied') ||
    lower.includes('not authorized')
  ) {
    return 'Your account does not have permission to do that. Sign in again, or ask an administrator.';
  }
  if (lower.includes('jwt') || lower.includes('session') || err.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  // --- Storage -------------------------------------------------------------
  if (lower.includes('bucket not found')) {
    return 'File storage is not set up yet. Ask the site administrator to run the latest database setup.';
  }
  if (lower.includes('object not found') || err.status === 404) {
    return 'That file is no longer available. It may have been removed.';
  }
  if (lower.includes('exceeded the maximum allowed size') || lower.includes('payload too large') || err.status === 413) {
    return 'That file is too large. Choose a file under 5 MB.';
  }
  if (lower.includes('mime type') || lower.includes('invalid file')) {
    return 'That file type is not accepted here. Upload a JPG, PNG or PDF.';
  }
  if (lower.includes('already exists') && lower.includes('resource')) {
    return 'A file with that name was already uploaded. Rename it and try again.';
  }

  // --- Network -------------------------------------------------------------
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('timeout')) {
    return 'We could not reach the server. Check your internet connection and try again.';
  }

  // A RAISE EXCEPTION from one of our own functions is already written for a
  // person ("Only an administrator can create a student login."), so it passes
  // through — anything else would be a raw database string.
  if (/^[A-Z][^{}_]*[.!]$/.test(raw) && raw.length < 200) return raw;

  return FALLBACK;
}
