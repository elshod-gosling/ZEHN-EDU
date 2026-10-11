// Supports both Promise-based and event-only Pointer Lock implementations.
export function createMouseCapture(canvas,{onChange=()=>{},timeout=10000}={}){
 const doc=canvas.ownerDocument;let pending=null,finish=null,timer=null,lastError=null,promiseBased=false,attemptId=0,wanted=false;
 function settle(ok,error=null,id=attemptId){if(id!==attemptId)return;lastError=error;clearTimeout(timer);const resolve=finish;finish=null;pending=null;resolve?.(ok);}
 function changed(){const locked=doc.pointerLockElement===canvas;if(locked&&!wanted){doc.exitPointerLock();return;}if(locked)settle(true);onChange(locked);}
 function failed(){if(finish&&!promiseBased)settle(false,new Error('Pointer lock rejected by browser'));}
 doc.addEventListener('pointerlockchange',changed);doc.addEventListener('pointerlockerror',failed);
 return {
  get locked(){return doc.pointerLockElement===canvas;},get error(){return lastError;},
  request(){
   wanted=true;
   if(doc.pointerLockElement===canvas)return Promise.resolve(true);
   if(pending)return pending;
   lastError=null;promiseBased=false;const id=++attemptId;
   const result=new Promise(resolve=>{finish=resolve;});pending=result;
   timer=setTimeout(()=>settle(false,new Error('Pointer lock timed out'),id),timeout);
   try{
    // Keep focus and capture in the same trusted click, before any await/fullscreen.
    canvas.focus?.({preventScroll:true});
    if(typeof canvas.requestPointerLock!=='function')throw new DOMException('This browser does not support Pointer Lock','NotSupportedError');
    const attempt=canvas.requestPointerLock();
    if(attempt&&typeof attempt.then==='function'){promiseBased=true;attempt.then(()=>{if(id===attemptId&&doc.pointerLockElement===canvas)settle(true,null,id);},error=>{if(finish)settle(false,error,id);});}
   }
   catch(error){settle(false,error,id);}
   return result;
  },
  cancel(){wanted=false;settle(false);attemptId++;if(doc.pointerLockElement===canvas)doc.exitPointerLock();},
  release(){wanted=false;if(doc.pointerLockElement===canvas)doc.exitPointerLock();},
  dispose(){this.cancel();doc.removeEventListener('pointerlockchange',changed);doc.removeEventListener('pointerlockerror',failed);}
 };
}
