import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { passRemaining } from './dist/credit-policy.mjs';
const source=fs.readFileSync('dist/supabase-account.mjs','utf8').replace(/^import .*;$/gm,'').replace(/export /g,'')
  .replace("import('./vendor/supabase.mjs')",'loadSDK()')+'\nthis.controller={initializeAccount,accountState,subscribe,createAccount,signIn,signOut,resetPassword,updatePassword,syncClock,redeemPass,startPractice,finishPractice,remaining};';
const sessionStore={user:{id:'owner',email:'owner@example.com',user_metadata:{display_name:'Owner'}}};
let authOptions;
function browser(wallet) {
  let changed, stopped=false;
  const calls=[], sdk={createClient:(_,key,options)=>{
    authOptions=options.auth;
    return { auth:{
      onAuthStateChange:fn=>{changed=fn; fn('INITIAL_SESSION',{user:sessionStore.user});},
      signOut:async()=>{sessionStore.user=null;changed('SIGNED_OUT',null);return {data:{},error:null};},
      signUp:async args=>{calls.push(['signup',args]);return {data:{user:{id:'new'},session:null},error:null};},
      signInWithPassword:async args=>{calls.push(['login',args]);return {data:{},error:null};},
      resetPasswordForEmail:async(...args)=>{calls.push(['reset',...args]);return {data:{},error:null};},
      updateUser:async args=>{calls.push(['update',args]);return {data:{},error:null};}
    }, rpc:async(name,args)=>{calls.push([name,args]);return {data:{...wallet,serverNow:new Date().toISOString()},error:null};} };
  }};
  const context=vm.createContext({console,Date,Math,Set,Promise,URL,supabaseConfig:{url:'https://test.supabase.co',publishableKey:'public-test'},passRemaining,loadSDK:async()=>sdk,document:{hidden:false},location:{href:'https://example.com/levelup/'},setTimeout:(fn)=>setTimeout(()=>{if(!stopped)fn();},0),setInterval:()=>1,clearInterval:()=>{}});
  vm.runInContext(source,context);
  return {controller:context.controller,calls,recovery:()=>changed('PASSWORD_RECOVERY',{user:sessionStore.user}),close:()=>{stopped=true;if(!authOptions.persistSession)sessionStore.user=null;}};
}
async function ready(controller) {
  await controller.initializeAccount();
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Timed out')),1000);controller.subscribe(s=>{if(!s.loading){clearTimeout(timer);resolve();}});});
}
const wallet={role:'developer',credits:0,earned:0,passUntil:new Date(0).toISOString()};
const first=browser(wallet);await ready(first.controller);
assert.equal(authOptions.persistSession,true);assert.equal(authOptions.autoRefreshToken,true);
assert.equal(first.controller.accountState().user.displayName,'Owner');
const count=first.calls.length;await first.controller.syncClock();await first.controller.redeemPass();assert.equal(first.calls.length,count,'Developer entry skips extra requests');
first.close();const reopened=browser(wallet);await ready(reopened.controller);assert.equal(reopened.controller.accountState().user.uid,'owner');
const signup=await reopened.controller.createAccount(' Student ',' student@outlook.com ','password123');assert(signup.confirmationRequired);
assert.equal(reopened.calls.at(-1)[1].email,'student@outlook.com');assert.equal(reopened.calls.at(-1)[1].options.data.display_name,'Student');
await reopened.controller.resetPassword('student@outlook.com');assert.equal(reopened.calls.at(-1)[2].redirectTo,'https://example.com/levelup/?credits=1');
reopened.recovery();assert.equal(reopened.controller.accountState().recovery,true);await reopened.controller.updatePassword('new-password');assert.equal(reopened.controller.accountState().recovery,false);
await reopened.controller.signOut();reopened.close();const signedOut=browser(wallet);await ready(signedOut.controller);assert.equal(signedOut.controller.accountState().user,null);
sessionStore.user={id:'student',email:'student@example.com'};
const student=browser({...wallet,role:'student',credits:100,passUntil:new Date(Date.now()+300000).toISOString()});await ready(student.controller);
await student.controller.syncClock();assert.equal(student.calls.at(-1)[0],'levelup_get_wallet');await student.controller.redeemPass();assert.equal(student.calls.at(-1)[0],'levelup_redeem_pass');
await student.controller.startPractice('math');assert.equal(student.calls.at(-1)[1].subject,'math');assert(student.controller.remaining()>0);
console.log('PASS: Supabase persistent reopen/sign-out, email signup confirmation, password recovery, developer bypass and server-owned credit operations.');
