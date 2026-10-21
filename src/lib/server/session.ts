import { cookies } from 'next/headers';
import { getAccount, readSessionToken, SESSION_COOKIE, type InstituteAccount, type InstituteRole } from '@/lib/server/institute-db';

export function currentAccount(): InstituteAccount | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = readSessionToken(token);
  if (!session) return null;
  const account = getAccount(session.sub);
  if (!account || account.status !== 'active' || account.role !== session.role) return null;
  return account;
}

export function requireRole(roles: InstituteRole[]) {
  const account = currentAccount();
  if (!account || !roles.includes(account.role)) return null;
  return account;
}
