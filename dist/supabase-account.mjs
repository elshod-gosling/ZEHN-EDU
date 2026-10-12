import { supabaseConfig } from './supabase-config.mjs';
import { passRemaining } from './credit-policy.mjs';
export const configured = !!(supabaseConfig.url && supabaseConfig.publishableKey);
const listeners = new Set();
let user = null, account = null, error = null, loading = configured, recovery = false;
let client, pendingSetup, generation = 0, clockOffset = 0, poll;
export const accountState = () => ({ user, account, error, loading, recovery, configured });
const emit = () => listeners.forEach(fn => fn(accountState()));
export function subscribe(fn) { listeners.add(fn); fn(accountState()); return () => listeners.delete(fn); }
export const serverNow = () => Date.now() + clockOffset;
export const remaining = () => passRemaining(account, serverNow());
const timestamp = value => ({ toMillis: () => new Date(value).getTime() });
function applyWallet(data, before = Date.now(), after = Date.now()) {
  account = { ...data, passUntil: timestamp(data.passUntil) };
  if (data.serverNow) clockOffset = new Date(data.serverNow).getTime() - (before + after) / 2;
  error = null; loading = false; emit();
}
function unwrap(result) { if (result.error) throw result.error; return result.data; }
async function rpc(name, args) {
  const current = generation, before = Date.now();
  const data = unwrap(await client.rpc(name, args));
  if (current !== generation || !user) throw new Error('sign-in-required');
  return { data, before, after: Date.now() };
}
async function refreshWallet() {
  if (!user) return;
  const current = generation;
  try { const result = await rpc('levelup_get_wallet'); applyWallet(result.data, result.before, result.after); }
  catch (e) { if (current === generation) { error = e.code || 'unavailable'; loading = false; emit(); } }
}
function acceptSession(event, session) {
  const next = session?.user;
  if (event === 'PASSWORD_RECOVERY') recovery = true;
  if (next?.id === user?.uid && account && !error) { emit(); return; }
  generation++; clearInterval(poll); account = null; error = null;
  user = next ? { ...next, uid: next.id, displayName: next.user_metadata?.display_name || '' } : null;
  loading = !!user;
  if (!user) recovery = false;
  emit();
  // Keep Auth callbacks synchronous to avoid deadlocking the session lock.
  if (user) {
    const current = generation;
    setTimeout(() => { if (current === generation) void refreshWallet(); }, 0);
    poll = setInterval(() => { if (!document.hidden) void refreshWallet(); }, 15000);
  }
}
export async function initializeAccount() {
  if (!configured) { loading = false; emit(); return; }
  if (pendingSetup) return pendingSetup;
  pendingSetup = (async () => {
    const { createClient } = await import('./vendor/supabase.mjs');
    client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'levelup-session' }
    });
    client.auth.onAuthStateChange(acceptSession);
  })().catch(e => { pendingSetup = null; loading = false; error = e.code || 'unavailable'; emit(); throw e; });
  return pendingSetup;
}
async function requireClient() { if (!configured) throw new Error('setup-required'); await initializeAccount(); return client; }
function requireWallet() { if (!user || !account || error) throw new Error('sign-in-required'); }
export async function createAccount(name, email, password) {
  const api = await requireClient();
  const result = unwrap(await api.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() }, emailRedirectTo: new URL('./?credits=1', location.href).href } }));
  return { ...result, confirmationRequired: !result.session };
}
export async function signIn(email, password) {
  const api = await requireClient();
  return unwrap(await api.auth.signInWithPassword({ email: email.trim(), password }));
}
export async function signOut() { if (client) unwrap(await client.auth.signOut({ scope: 'local' })); }
export async function resetPassword(email) {
  const api = await requireClient();
  return unwrap(await api.auth.resetPasswordForEmail(email.trim(), { redirectTo: new URL('./?credits=1', location.href).href }));
}
export async function updatePassword(password) {
  const api = await requireClient();
  unwrap(await api.auth.updateUser({ password })); recovery = false; emit();
}
export async function startPractice(subject) {
  requireWallet();
  return (await rpc('levelup_start_round', { subject: ['coding','office','math','typing'].includes(subject) ? subject : null })).data;
}
export async function finishPractice(round, answer) {
  requireWallet();
  const result = await rpc('levelup_finish_round', { round_id: round.id, round_cursor: round.cursor, submitted_answer: String(answer) });
  applyWallet(result.data, result.before, result.after); return account.credits;
}
export async function redeemPass() {
  requireWallet();
  if (account.role === 'developer') return null;
  const result = await rpc('levelup_redeem_pass');
  applyWallet(result.data, result.before, result.after); return account.passUntil;
}
export async function syncClock() {
  requireWallet();
  if (account.role === 'developer') return;
  const result = await rpc('levelup_get_wallet'); applyWallet(result.data, result.before, result.after);
}
export const reconnect = refreshWallet;
