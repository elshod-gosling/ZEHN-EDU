import { firebaseConfig } from './account-config.mjs';
import { initialAccount, POLICY, passRemaining } from './credit-policy.mjs';
export const configured = !!firebaseConfig;
const listeners = new Set();
let user = null, account = null, error = null, loading = configured, sdk, auth, db, ref, stopWallet = () => {}, generation = 0;
let clockOffset = 0, pendingSetup;
export const accountState = () => ({ user, account, error, loading, configured });
const emit = () => listeners.forEach(fn => fn(accountState()));
export function subscribe(fn) { listeners.add(fn); fn(accountState()); return () => listeners.delete(fn); }
export function serverNow() { return Date.now() + clockOffset; }
export function remaining() { return passRemaining(account, serverNow()); }
export async function initializeAccount() {
  if (!configured) { loading = false; emit(); return; }
  if (pendingSetup) return pendingSetup;
  pendingSetup = (async () => {
    const [app, identity, store] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js')
    ]);
    sdk = { ...identity, ...store };
    const instance = app.initializeApp(firebaseConfig);
    auth = sdk.getAuth(instance); db = sdk.getFirestore(instance);
    // School PCs: signing in survives navigation in this tab, not later visits.
    await sdk.setPersistence(auth, sdk.browserSessionPersistence);
    sdk.onAuthStateChanged(auth, async next => {
      const current = ++generation; stopWallet(); ref = null; account = null; user = next; error = null; loading = !!next; emit();
      if (!next) { loading = false; emit(); return; }
      try {
        const wallet = sdk.doc(db, 'accounts', next.uid);
        await sdk.runTransaction(db, async tx => { const snap = await tx.get(wallet); if (!snap.exists()) tx.set(wallet, initialAccount(sdk.serverTimestamp())); });
        // A role claim is always checked by Firestore against the private policy.
        // Students cannot promote themselves by modifying this browser code.
        try { await sdk.updateDoc(wallet, { role: 'developer', updatedAt: sdk.serverTimestamp() }); }
        catch (e) { if (e.code !== 'permission-denied') throw e; }
        if (current !== generation) return;
        ref = wallet;
        stopWallet = sdk.onSnapshot(wallet, { includeMetadataChanges: true }, snap => {
          if (current !== generation || snap.metadata.hasPendingWrites || snap.metadata.fromCache) return;
          account = snap.data(); loading = false; error = null; emit();
        }, e => { if (current === generation) { account = null; error = e.code; loading = false; emit(); } });
      } catch (e) { if (current === generation) { account = null; error = e.code; loading = false; emit(); } }
    });
  })().catch(e => { loading = false; error = e.code || 'unavailable'; pendingSetup = null; emit(); throw e; });
  return pendingSetup;
}
export async function signInWithGoogle() {
  if (!configured) throw new Error('setup-required');
  await initializeAccount();
  const provider = new sdk.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
  return sdk.signInWithPopup(auth, provider);
}
export async function createAccount(name, email, password) {
  await initializeAccount();
  const result = await sdk.createUserWithEmailAndPassword(auth, email.trim(), password);
  await sdk.updateProfile(result.user, { displayName: name.trim() });
  emit();
  return result;
}
export async function signIn(email, password) {
  await initializeAccount();
  return sdk.signInWithEmailAndPassword(auth, email.trim(), password);
}
export async function resetPassword(email) {
  await initializeAccount();
  return sdk.sendPasswordResetEmail(auth, email.trim());
}
export async function signOut() { if (auth) await sdk.signOut(auth); }
function requireWallet() { if (!ref || !account || !user || error) throw new Error('sign-in-required'); }
export async function startPractice(subject) {
  requireWallet();
  const wallet = ref;
  return sdk.runTransaction(db, async tx => {
    const snapshot = await tx.get(wallet), data = snapshot.data();
    const subjects = ['coding','office','math','typing'];
    const subjectIndex = subjects.includes(subject) ? subjects.indexOf(subject) : data.cursor % 4;
    const questionId = 'q' + ((data.cursor % 8) * 4 + subjectIndex);
    const questionRef = sdk.doc(db, 'questions', questionId), question = await tx.get(questionRef);
    if (!question.exists()) throw new Error('question-unavailable');
    // Restarting/refreshing a round restarts its server timer, so parallel tabs
    // cannot collect two payouts from one learning interval.
    tx.update(wallet, { phase: 'learning', questionId, answer: '', startedAt: sdk.serverTimestamp(), updatedAt: sdk.serverTimestamp() });
    return { id: questionId, cursor: data.cursor, ...question.data() };
  });
}
export async function finishPractice(round, answer) {
  requireWallet(); const wallet = ref;
  return sdk.runTransaction(db, async tx => {
    const snapshot = await tx.get(wallet), data = snapshot.data();
    if (data.cursor !== round.cursor || data.questionId !== round.id || data.phase !== 'learning') throw new Error('round-changed');
    tx.update(wallet, { phase: 'idle', answer: String(answer), credits: data.credits + POLICY.perRound, earned: data.earned + POLICY.perRound, cursor: data.cursor + 1, lastEarnAt: sdk.serverTimestamp(), updatedAt: sdk.serverTimestamp() });
    return data.credits + POLICY.perRound;
  });
}
export async function redeemPass() {
  requireWallet(); const wallet = ref;
  const pass = await sdk.runTransaction(db, async tx => {
    const snapshot = await tx.get(wallet), data = snapshot.data();
    if (data.role === 'developer') return null;
    // Both decisions are verified again by the rules using request.time.
    if (passRemaining(data, serverNow()) > 0) return data.passUntil;
    if (data.credits < POLICY.passCost) throw new Error('not-enough-credits');
    // A serverTimestamp transform cannot add a duration. The server rules allow
    // an expiry within 3 seconds of five minutes after the request, not arbitrary
    // client dates. Retry clock mismatch after reading the latest server time.
    const until = sdk.Timestamp.fromMillis(serverNow() + POLICY.passSeconds * 1000);
    tx.update(wallet, { credits: data.credits - POLICY.passCost, passUntil: until, updatedAt: sdk.serverTimestamp() });
    return until;
  });
  if (pass) { const snap = await sdk.getDocFromServer(wallet); account = snap.data(); emit(); }
  return pass;
}
export async function syncClock() {
  requireWallet();
  const wallet = ref, before = Date.now();
  await sdk.updateDoc(wallet, { updatedAt: sdk.serverTimestamp() });
  const snap = await sdk.getDocFromServer(wallet); account = snap.data();
  const after = Date.now(); clockOffset = account.updatedAt.toMillis() - (before + after) / 2; emit();
}
