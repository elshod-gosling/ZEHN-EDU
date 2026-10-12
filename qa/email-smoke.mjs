// Disposable production smoke check: no emails are sent and no credentials are
// logged. The test wallet and generated identity are removed in finally.
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocFromServer, serverTimestamp, terminate } from 'firebase/firestore';
import { firebaseConfig } from '../dist/account-config.mjs';
import { initialAccount } from '../dist/credit-policy.mjs';
const require = createRequire(import.meta.url), cli = require('firebase-tools/lib/auth');
const owner = cli.getGlobalDefaultAccount();
const admin = await cli.getAccessToken(owner.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase']);
const email = `levelup-qa-${randomUUID()}@example.com`, password = randomBytes(32).toString('base64url');
const app=initializeApp(firebaseConfig,'email-smoke'), auth=getAuth(app), db=getFirestore(app);
let uid, walletCreated=false;
try {
  const result=await createUserWithEmailAndPassword(auth,email,password); uid=result.user.uid;
  await updateProfile(result.user,{displayName:'LevelUp QA'});
  assert.equal(result.user.emailVerified,false);
  const wallet=doc(db,'accounts',uid);
  await setDoc(wallet,initialAccount(serverTimestamp())); walletCreated=true;
  assert.equal((await getDocFromServer(wallet)).data().credits,0);
  await signOut(auth);
  const returning=await signInWithEmailAndPassword(auth,email,password);
  assert.equal(returning.user.uid,uid); assert.equal(returning.user.displayName,'LevelUp QA');
  assert.equal((await getDocFromServer(wallet)).data().role,'student');
  console.log('PASS: live non-Gmail signup, profile, student wallet, sign-out and password sign-in.');
} finally {
  if (uid) {
    if(walletCreated){
      const response=await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/accounts/${uid}`,{method:'DELETE',headers:{Authorization:'Bearer '+admin.access_token}});
      if(!response.ok)throw new Error('Could not clean up QA wallet: '+response.status);
    }
    if(!auth.currentUser)await signInWithEmailAndPassword(auth,email,password);
    await deleteUser(auth.currentUser);
    console.log('PASS: disposable QA wallet and identity removed.');
  }
  await terminate(db); await deleteApp(app);
}
