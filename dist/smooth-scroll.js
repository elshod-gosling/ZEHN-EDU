// Use the browser's smooth animation for mouse-wheel scrolling; keep native
// trackpad, touch, calculator gestures, and reduced-motion behavior intact.
(() => {
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let target=null,destination=0,lastWheel=0;
  const reset=()=>{target=null;lastWheel=0;};
  document.addEventListener('pointerdown',reset,{passive:true});
  document.addEventListener('keydown',reset,{passive:true});
  function scrollerFor(element,delta) {
    const modal=document.querySelector('dialog[open]');
    if(modal&&!modal.contains(element))return null;
    for(let node=element;node&&node!==document.body;node=node.parentElement){
      const maximum=node.scrollHeight-node.clientHeight;
      if(maximum>1&&/(auto|scroll)/.test(getComputedStyle(node).overflowY)&&
        (delta>0?node.scrollTop<maximum-1:node.scrollTop>0))return node;
    }
    if(modal)return null;
    const root=document.scrollingElement,maximum=root.scrollHeight-root.clientHeight;
    return maximum>1&&(delta>0?root.scrollTop<maximum-1:root.scrollTop>0)?root:null;
  }
  document.addEventListener('wheel',event=>{
    if(event.defaultPrevented||reduced.matches||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(!event.deltaY)return;
    if(event.deltaMode===0&&Math.abs(event.deltaY)<40){reset();return;}
    const element=event.target instanceof Element?event.target:document.documentElement;
    if(element.closest('iframe,select,textarea,[contenteditable="true"],input[type="number"]'))return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
    const node=scrollerFor(element,delta);
    if(!node)return;
    const now=performance.now();
    if(target!==node||now-lastWheel>250)destination=node.scrollTop;
    target=node;lastWheel=now;
    const next=Math.max(0,Math.min(node.scrollHeight-node.clientHeight,destination+delta));
    event.preventDefault();
    if(next!==destination){destination=next;node.scrollTo({top:destination,behavior:'smooth'});}
  },{passive:false});
})();
