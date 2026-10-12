import assert from 'node:assert/strict';
import {DuelRoom,normalizeRoomCode} from './dist/arena/room.mjs';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
class Peer {
 constructor(message,state){this.state=state;this.closed=false;this.accepted=[];}
 async host(){return 'offer';}async join(offer){assert.equal(offer,'offer');return 'answer';}
 async accept(answer){this.accepted.push(answer);this.state('ready');}close(){this.closed=true;}send(){}
}
const records=new Map();let i=0;
const api={async createRoom(offer){const id=++i;records.set(id,{offer,code:'AB12CD34',answer:null});return {id,code:'AB12CD34'};},async joinRoom(code){assert.equal(code,'AB12CD34');return {id:i,offer:records.get(i).offer};},async answerRoom(id,answer){records.get(id).answer=answer;},async roomStatus(id){return records.get(id);},async closeRoom(id){records.delete(id);}};
assert.equal(normalizeRoomCode('ab12-cd34'),'AB12CD34');
const states=[],host=new DuelRoom(()=>{},s=>states.push(s),{api,Peer,pollMs:5,timeoutMs:1000});
const guest=new DuelRoom(()=>{},()=>{},{api,Peer,pollMs:5,timeoutMs:1000});
assert.equal(await host.host(),'AB12CD34');await guest.join('ab12 cd34');
await delay(30);assert.equal(states.at(-1),'ready');assert.deepEqual(host.peer.accepted,['answer']);assert.equal(host.ready,true);
await delay(20);assert.equal(host.peer.accepted.length,1,'Answer is applied once');host.close();guest.close();
let resolveCreate,deleted=[];
const slowApi={...api,createRoom:()=>new Promise(r=>resolveCreate=r),closeRoom:async id=>deleted.push(id)};
const cancelled=new DuelRoom(()=>{},()=>assert.fail('Late state after cancellation'),{api:slowApi,Peer});
const pending=cancelled.host();await delay(0);cancelled.close();resolveCreate({id:'late',code:'AB12CD34'});assert.equal(await pending,null);assert.deepEqual(deleted,['late']);assert.equal(cancelled.id,null);
const timedStates=[],timed=new DuelRoom(()=>{},(s,e)=>timedStates.push([s,e?.message]),{api,Peer,pollMs:5,timeoutMs:20});
await timed.host();await delay(35);assert.deepEqual(timedStates.at(-1),['failed','connection-timeout']);assert.equal(timed.peer,null);
const invalid=new DuelRoom(()=>{},()=>{},{api,Peer});await assert.rejects(invalid.join('bad'),/room-not-found/);assert.equal(invalid.peer,null);
console.log('PASS: automatic offer/answer exchange, one-time acceptance, stale-create cleanup, cancellation, timeout and code normalization.');
