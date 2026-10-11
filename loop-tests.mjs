import assert from 'node:assert/strict';
import {createFrameLoop} from './dist/arena/loop.mjs';
function harness(hz){
 let time=0,pending=new Map(),id=0,ticks=0,renders=0;
 const loop=createFrameLoop({update:()=>ticks++,render:()=>renders++,now:()=>time,requestFrame:fn=>{pending.set(++id,fn);return id;},cancelFrame:id=>pending.delete(id)});
 function advance(ms){time+=ms;const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(time));}
 loop.start();loop.start();assert.equal(pending.size,1,'Starting twice cannot create duplicate render loops');
 for(let f=0;f<hz;f++)advance(1000/hz);
 assert.equal(renders,hz,`Render every callback at ${hz} Hz`);assert.equal(ticks,20,`Combat remains 20 Hz at ${hz} Hz`);
 loop.stop();assert.equal(pending.size,0);const priorTicks=ticks;advance(30000);loop.start();advance(1000/hz);assert(ticks-priorTicks<=1,'Returning to a tab does not simulate the hidden interval');
 const prior=ticks;advance(5000);assert(ticks-prior<=3,'A stalled frame has bounded simulation work');loop.stop();
}
for(const hz of [60,75,120,144,240])harness(hz);
console.log('PASS: display-paced 60/75/120/144/240 Hz rendering, fixed 20 Hz combat, one loop, background resume, bounded stalls.');
