// Supports both Promise-based and event-only Pointer Lock implementations.
export function createMouseCapture(canvas,{onChange=()=>{},timeout=1800}={}){
 const doc=canvas.ownerDocument;let pending=null,finish=null,timer=null,lastError=null,promiseBased=false;
 function settle(ok,error=null){lastError=error;clearTimeout(timer);const resolve=finish;finish=null;pending=null;resolve?.(ok);}
 function changed(){const locked=doc.pointerLockElement===canvas;if(locked)settle(true);onChange(locked);}
 function failed(){if(finish&&!promiseBased)settle(false,new Error('Pointer lock rejected by browser'));}
 doc.addEventListener('pointerlockchange',changed);doc.addEventListener('pointerlockerror',failed);
 return {
  get locked(){return doc.pointerLockElement===canvas;},get error(){return lastError;},
  request(){
   if(doc.pointerLockElement===canvas)return Promise.resolve(true);
   if(pending)return pending;
   lastError=null;promiseBased=false;
   const result=new Promise(resolve=>{finish=resolve;});pending=result;
   timer=setTimeout(()=>settle(false,new Error('Pointer lock timed out')),timeout);
   try{const attempt=canvas.requestPointerLock();if(attempt&&typeof attempt.then==='function'){promiseBased=true;attempt.then(()=>{if(doc.pointerLockElement===canvas)settle(true);},error=>{if(finish)settle(false,error);});}}
   catch(error){settle(false,error);}
   return result;
  },
  release(){if(doc.pointerLockElement===canvas)doc.exitPointerLock();},
  dispose(){settle(false);doc.removeEventListener('pointerlockchange',changed);doc.removeEventListener('pointerlockerror',failed);}
 };
}
