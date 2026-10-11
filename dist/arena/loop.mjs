// Render every display callback; advance combat on its independent fixed clock.
export function createFrameLoop({update,render,step=50,maxDelta=150,requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),now=()=>performance.now()}){
 let active=false,handle=null,previous=0,accumulator=0;
 function frame(time){
  if(!active)return;
  const delta=Math.max(0,Math.min(maxDelta,time-previous));previous=time;
  accumulator+=delta;
  while(accumulator+1e-8>=step){update();accumulator-=step;}
  render(time,delta,Math.max(0,accumulator/step));
  if(active)handle=requestFrame(frame);
 }
 return {
  get active(){return active;},
  start(){if(active)return;active=true;previous=now();accumulator=0;handle=requestFrame(frame);},
  stop(){active=false;if(handle!==null)cancelFrame(handle);handle=null;accumulator=0;}
 };
}
