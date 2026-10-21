/**
 * Clears a leftover development session from earlier builds.
 * Passwords are not stored in the browser. Demo accounts sign in through
 * the server, which keeps a hashed password.
 */
export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('savvy-demo-role');
}
