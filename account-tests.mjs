import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { initialAccount, POLICY, passRemaining } from './dist/credit-policy.mjs';

// Execute the actual account controller with a deterministic Firebase adapter.
// Reopening creates a fresh JS context; only persistent browser storage survives.
const source=fs.readFileSync('dist/account.mjs','utf8')
  .replace(/^import .*;$/gm,'').replace(/export /g,'')
  .replace(/import\('https:\/\/www\.gstatic\.com\/firebasejs\/13\.0\.0\/firebase-([^']+)\.js'\)/g,'loadSDK("$1")')
  + '\nthis.controller={initializeAccount,accountState,subscribe,signIn,signOut,syncClock,redeemPass,remaining};';
const stamp=ms=>({toMillis:()=>ms});
function browser(storage, wallet) {
  const auth={currentUser:storage.user}, calls={transactions:0,writes:0,reads:0}, backend={available:true};
  let changed;
  const snapshot=()=>({exists:()=>true,data:()=>({...wallet}),metadata:{hasPendingWrites:false,fromCache:false}});
  const sdk={
    initializeApp:()=>({}), getAuth:()=>auth, getFirestore:()=>({}), browserLocalPersistence:'local', browserSessionPersistence:'session',
    setPersistence:async(_,mode)=>{storage.mode=mode;},
    onAuthStateChanged:(_,callback)=>{changed=callback; void callback(auth.currentUser);},
    signInWithEmailAndPassword:async(_,email)=>{const user={uid:'student',email}; storage.user=auth.currentUser=user; await changed(user); return {user};},
    signOut:async()=>{storage.user=auth.currentUser=null; await changed(null);},
    doc:(_,collection,id)=>({collection,id}), serverTimestamp:()=>stamp(Date.now()), Timestamp:{fromMillis:stamp},
    runTransaction:async(_,callback)=>{
      calls.transactions++;
      if(!backend.available)throw Object.assign(new Error('unavailable'),{code:'unavailable'});
      return callback({get:async()=>snapshot(),set:(_,data)=>Object.assign(wallet,data),update:(_,patch)=>Object.assign(wallet,patch)});
    },
    updateDoc:async(_,patch)=>{
      calls.writes++;
      if(!backend.available)throw Object.assign(new Error('unavailable'),{code:'unavailable'});
      if(patch.role==='developer'&&wallet.role!=='developer')throw Object.assign(new Error('permission-denied'),{code:'permission-denied'});
      Object.assign(wallet,patch);
    },
    onSnapshot:(_,options,callback)=>{callback(snapshot()); return ()=>{};},
    getDocFromServer:async()=>{calls.reads++; if(!backend.available)throw Object.assign(new Error('unavailable'),{code:'unavailable'}); return snapshot();}
  };
  const context=vm.createContext({console,Date,Math,Set,Promise,firebaseConfig:{projectId:'test'},initialAccount,POLICY,passRemaining,loadSDK:async()=>sdk});
  vm.runInContext(source,context);
  return {controller:context.controller,calls,backend,close:()=>{if(storage.mode==='session')storage.user=null;}};
}
async function ready(controller) {
  await controller.initializeAccount();
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Account did not settle')),1000);
    controller.subscribe(state=>{if(!state.loading){clearTimeout(timeout); if(state.error)reject(new Error(state.error)); else resolve();}});
  });
}
const storage={user:{uid:'owner',email:'owner@example.com'}}, developerWallet={...initialAccount(stamp(0)),role:'developer'};
const first=browser(storage,developerWallet); await ready(first.controller);
assert.equal(storage.mode,'local','Sign-in must survive a closed tab/window');
first.backend.available=false;
const before={...first.calls};
await first.controller.syncClock(); await first.controller.redeemPass();
assert.deepEqual(first.calls,before,'Confirmed developer entry must not call the backend again');
assert.equal(first.controller.remaining(),Infinity);
first.close();
const reopened=browser(storage,developerWallet); await ready(reopened.controller);
assert.equal(reopened.controller.accountState().user.uid,'owner','Reopening must restore the saved identity');
await reopened.controller.signOut();
const afterSignOut=browser(storage,developerWallet); await ready(afterSignOut.controller);
assert.equal(afterSignOut.controller.accountState().user,null,'Explicit sign-out must clear persistent storage');

const studentWallet={...initialAccount(stamp(0)),credits:100}, student=browser({user:{uid:'student',email:'kid@example.com'}},studentWallet);
await ready(student.controller);
await student.controller.syncClock(); await student.controller.redeemPass();
assert.equal(studentWallet.credits,0,'Students still spend exactly 100 credits');
const spent={...student.calls}; await student.controller.redeemPass();
assert.equal(studentWallet.credits,0,'Resuming a student pass must not charge twice');
assert.equal(student.calls.writes,spent.writes);
assert(student.controller.remaining()>0&&student.controller.remaining()<=300);
student.backend.available=false;
await assert.rejects(student.controller.syncClock(),{code:'unavailable'},'Student clock failures must not bypass pass checks');
console.log('PASS: persistent reopen, explicit sign-out, developer entry without extra requests, student payment and active-pass reuse.');
