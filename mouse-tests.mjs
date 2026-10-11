import assert from 'node:assert/strict';
import {createMouseCapture} from './dist/arena/mouse.mjs';
class Document extends EventTarget{pointerLockElement=null;exitPointerLock(){this.pointerLockElement=null;this.dispatchEvent(new Event('pointerlockchange'));}}
const doc=new Document();let calls=0,allow=false,changes=[];
const canvas={ownerDocument:doc,requestPointerLock(){calls++;if(!allow)return Promise.reject(new Error('denied'));doc.pointerLockElement=this;doc.dispatchEvent(new Event('pointerlockchange'));return Promise.resolve();}};
const capture=createMouseCapture(canvas,{onChange:value=>changes.push(value),timeout:30});
assert.equal(await capture.request(),false,'Rejected capture stays unlocked');allow=true;assert.equal(await capture.request(),true,'A later click retries successfully');assert.equal(calls,2);assert.equal(capture.locked,true);capture.release();assert.equal(capture.locked,false);assert.deepEqual(changes,[true,false]);
canvas.requestPointerLock=function(){calls++;setTimeout(()=>{doc.pointerLockElement=this;doc.dispatchEvent(new Event('pointerlockchange'));},3);};assert.equal(await capture.request(),true,'Legacy event-only API works');capture.release();
canvas.requestPointerLock=()=>undefined;const a=capture.request(),b=capture.request();assert.equal(a,b,'Deduplicate pending capture');assert.equal(await a,false,'Timeout cannot report false success');
canvas.requestPointerLock=()=>{throw Error('sandbox');};assert.equal(await capture.request(),false,'Synchronous browser errors are handled');capture.dispose();
const focusOrder=[];let rejectOld;
const focusCanvas={ownerDocument:doc,focus(){focusOrder.push('focus');},requestPointerLock(){focusOrder.push('request');return new Promise((resolve,reject)=>{rejectOld=reject;});}};
const focusCapture=createMouseCapture(focusCanvas,{timeout:15});
assert.equal(await focusCapture.request(),false);assert.deepEqual(focusOrder,['focus','request'],'Canvas is focused synchronously before capture');
focusCanvas.requestPointerLock=()=>undefined;const fresh=focusCapture.request();rejectOld(new Error('late rejection'));await Promise.resolve();
doc.pointerLockElement=focusCanvas;doc.dispatchEvent(new Event('pointerlockchange'));assert.equal(await fresh,true,'A stale rejection cannot fail the next request');focusCapture.release();
const cancelled=focusCapture.request();focusCapture.cancel();assert.equal(await cancelled,false,'Cancelling resolves a pending request');doc.pointerLockElement=focusCanvas;doc.dispatchEvent(new Event('pointerlockchange'));assert.equal(focusCapture.locked,false,'Late capture after cancelling is immediately released');focusCapture.dispose();
console.log('PASS: pointer capture success, rejection, retry, Esc/release, legacy APIs, concurrent requests, timeout, synchronous denial.');
console.log('PASS: focus before capture, stale-request isolation, cancellation and late-release.');
