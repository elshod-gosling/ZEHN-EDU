export const POLICY = Object.freeze({ perRound: 10, roundSeconds: 60, passCost: 100, passSeconds: 300 });
export function passRemaining(account, now = Date.now()) {
  if (account?.role === 'developer') return Infinity;
  return Math.max(0, Math.ceil(((account?.passUntil?.toMillis?.() ?? 0) - now) / 1000));
}
export function canRedeem(account, now = Date.now()) {
  return !!account && (account.role === 'developer' || account.credits >= POLICY.passCost || passRemaining(account, now) > 0);
}
export function initialAccount(serverTime) {
  return { role: 'student', credits: 0, earned: 0, cursor: 0, phase: 'idle', questionId: '', answer: '', startedAt: serverTime, lastEarnAt: serverTime, passUntil: serverTime, updatedAt: serverTime };
}
// Only visible, focused time counts in the normal learning UI; long frame gaps
// cannot turn a sleeping/background tab into completed practice.
export function advancePractice(elapsed, deltaMs, active) {
  return active ? Math.min(POLICY.roundSeconds * 1000, elapsed + Math.max(0, Math.min(deltaMs, 1500))) : elapsed;
}
