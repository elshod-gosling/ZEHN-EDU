import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('dist/arena/game.mjs','utf8');
const begin=source.slice(source.indexOf('async function begin(){'),source.indexOf("$('#start').onclick=begin;"));
function setup({fullscreen=false}={}){
 let lockResolve,fullscreenResolve;const order=[],nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{checked:fullscreen,hidden:false,disabled:false});return nodes.get(id);};
 const scope={unlocked:true,capturePending:false,mode:'bot',peerReady:true,entryRequest:0,dragControls:false,$:node,t:k=>k,Promise,mouseCapture:{locked:true,request(){order.push('lock');return new Promise(resolve=>lockResolve=resolve);}},document:{fullscreenElement:null,documentElement:{requestFullscreen(){order.push('fullscreen');return new Promise(resolve=>fullscreenResolve=resolve);}}},captureGate(failed,key){order.push(failed?'denied':key);},play(){order.push('play');},updateStart(){}};
 const context=vm.createContext(scope);vm.runInContext(begin,context);
 return {scope,order,run:()=>vm.runInContext('begin()',context),resolveLock:value=>lockResolve(value),resolveFullscreen:()=>fullscreenResolve()};
}
let test=setup({fullscreen:true});let pending=test.run();assert.deepEqual(test.order,['lock','fullscreen'],'Both requests happen in the click, in activation-safe order');test.resolveLock(true);test.resolveFullscreen();await pending;assert.equal(test.order.at(-1),'play');
test=setup();pending=test.run();test.resolveLock(false);await pending;assert.equal(test.order.at(-1),'denied');assert(!test.order.includes('play'),'Rejected capture never starts unlocked gameplay');assert.equal(test.scope.capturePending,false);
test=setup();pending=test.run();test.scope.entryRequest++;test.resolveLock(true);await pending;assert(!test.order.includes('play'),'Cancelled entry cannot start after a late result');
test=setup({fullscreen:true});pending=test.run();test.scope.mouseCapture.locked=false;test.resolveLock(true);test.resolveFullscreen();await pending;assert.equal(test.order.at(-1),'captureFullscreen','Fullscreen transitions that release capture require a new click');
console.log('PASS: lock/fullscreen activation order, rejection gate, cancelled entry, capture after fullscreen transition.');
