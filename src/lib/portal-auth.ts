import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/friendly-error';
import { clearDemoSession } from '@/lib/demo-auth';

export type PortalRole = 'admin' | 'staff' | 'student' | 'none';
export type SignInRole = 'admin' | 'staff' | 'student';

export type PortalIdentity = {
  role: PortalRole;
  name: string | null;
  email: string | null;
  userId: string | null;
};

/**
 * Which portal the current session is entitled to.
 *
 * The institute session cookie is checked first. A Supabase session is used
 * only when that cookie is absent, so a student session cannot open the admin
 * portal and an admin session cannot open the student portal.
 */
export async function resolveIdentity(): Promise<PortalIdentity> {
  const response = await fetch('/api/auth/session', { cache: 'no-store' });
  if (response.ok) {
    const body = await response.json();
    if (body.account?.role === 'admin' || body.account?.role === 'staff' || body.account?.role === 'student') {
      return {
        role: body.account.role,
        name: body.account.fullName ?? null,
        email: body.account.email ?? null,
        userId: body.account.id ?? null,
      };
    }
  }

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return { role: 'none', name: null, email: null, userId: null };

  const [{ data: admin }, { data: staff }, { data: student }] = await Promise.all([
    supabase.rpc('is_admin'),
    supabase.rpc('is_staff'),
    supabase.rpc('is_student'),
  ]);

  const role: PortalRole = admin === true ? 'admin' : staff === true ? 'staff' : student === true ? 'student' : 'none';
  return {
    role,
    name: (session.session.user.user_metadata?.full_name as string | undefined) ?? null,
    email: session.session.user.email ?? null,
    userId: session.session.user.id,
  };
}

export async function resolveRole(): Promise<PortalRole> {
  return (await resolveIdentity()).role;
}

/**
 * Sign in and confirm the account belongs to the requested portal. Known
 * institute accounts are checked on the server. Unknown identifiers fall
 * through to Supabase Auth.
 */
export async function signInAs(
  want: SignInRole,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const identifier = email.trim();
  if (!identifier) return { ok: false, message: 'Enter your email or phone number.' };
  if (!password) return { ok: false, message: 'Enter your password. Use the eye icon to check what you typed.' };

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password, role: want }),
  });
  const body = await response.json().catch(() => ({}));
  if (response.ok) {
    clearDemoSession();
    return { ok: true };
  }
  if (body.code !== 'unknown') {
    return { ok: false, message: body.message || 'Sign-in failed. Try again.' };
  }

  clearDemoSession();
  const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
  if (error) return { ok: false, message: friendlyError(error, 'account') };

  const role = await resolveRole();
  if (role === want) return { ok: true };

  const { data: status } = await supabase.rpc('my_account_status');
  await supabase.auth.signOut();

  if (status === 'pending') {
    return { ok: false, message: 'Your account is awaiting administrator approval. You can sign in after it is approved.' };
  }
  if (status === 'rejected') {
    return { ok: false, message: 'This application was not approved. You can submit it again from the student registration form.' };
  }
  if (status === 'disabled') {
    return { ok: false, message: 'This account is disabled. Contact the institute office if you think this is a mistake.' };
  }
  if (status === 'suspended') {
    return { ok: false, message: 'This account is suspended and cannot open protected pages.' };
  }

  const where = want === 'admin' ? 'an administrator' : want === 'staff' ? 'a staff member' : 'a student';
  return { ok: false, message: `That account is not ${where}. Choose the matching login option.` };
}

/** Ends the institute session and any Supabase session. */
export async function signOutPortal() {
  clearDemoSession();
  await fetch('/api/auth/logout', { method: 'POST' });
  void supabase.auth.signOut();
}
