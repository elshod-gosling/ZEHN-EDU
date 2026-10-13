import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from './dist/arena/vendor/three.module.js';
import {createPodium,celebrationPose,celebrationWinner} from './dist/arena/podium.mjs';
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(75,16/9,.1,110);
camera.position.set(3,1.62,-5);camera.rotation.set(.1,.4,0);const before=camera.clone();
const heldWeapon=new THREE.Group(),otherFighter=new THREE.Group();scene.add(otherFighter);camera.add(heldWeapon);scene.add(camera);
const mat=new THREE.MeshBasicMaterial(),materials=Object.fromEntries(['stone','gold','armor','darkArmor','face'].map(key=>[key,mat]));
const stage=createPodium({scene,camera,materials,hiddenDuringResult:[heldWeapon,otherFighter],makeNumberMaterial:()=>mat});
stage.show(0,1000);stage.draw(2500);
assert(stage.active);assert.equal(heldWeapon.visible,false,'First-person equipment cannot cover the podium');assert.equal(otherFighter.visible,false);
assert(stage.winner.root.position.y>stage.loser.root.position.y);
for(const now of [1000,1400,2500,4000,5600,8000]){stage.draw(now);assert.equal(stage.loser.torso.rotation.x,0,'Loser stays upright throughout the celebration');assert.equal(stage.loser.head.rotation.x,0,'Loser keeps their head upright');}
assert.equal(stage.loser.root.rotation.y,stage.winner.root.rotation.y,'Both fighters face the podium camera');assert(stage.winner.arms[1].rotation.x<-2,'Winner raises the trophy');
assert.equal(stage.winner.root.scale.x,1);assert.equal(stage.loser.root.scale.x,1,'Both fighters remain full-size');
camera.aspect=.5;stage.draw(3000);assert(camera.position.z>10,'Narrow viewports pull the camera back');
stage.hide();assert.equal(stage.group.visible,false);assert.equal(heldWeapon.visible,true);assert.equal(otherFighter.visible,true);
assert.equal(camera.fov,before.fov);assert(camera.position.equals(before.position));assert(camera.quaternion.equals(before.quaternion));
stage.show(1,4000);stage.draw(5500);assert.equal(stage.winnerId,1);assert.equal(stage.loser.torso.rotation.x,0);stage.hide();
stage.show(-1,6000);stage.draw(7500);assert.equal(stage.winner.root.position.y,stage.loser.root.position.y);assert.equal(stage.loser.torso.rotation.x,0);
assert.equal(celebrationWinner(-1,[1,0],true),0,'Final podium follows match score, even after a drawn last round');
assert.equal(celebrationWinner(1,[1,1],true),-1);assert.equal(celebrationWinner(1,[1,0],false),1);
assert.equal(celebrationPose(2,true).wave,0);
const staticStage=createPodium({scene,camera,materials,makeNumberMaterial:()=>mat,reducedMotion:true});
staticStage.show(0,1000);staticStage.draw(2500);assert.equal(staticStage.loser.torso.rotation.x,0,'Reduced motion also keeps the loser upright');assert.equal(staticStage.loser.head.rotation.x,0);staticStage.hide();

// Exercise the actual game render branch with the match marked as started.
const source=fs.readFileSync('dist/arena/game.mjs','utf8');
const render=source.slice(source.indexOf('function frame(now,'),source.indexOf("window.addEventListener('resize'"));
let draws=0,renders=0;const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',style:{}});return nodes.get(id);};
const context=vm.createContext({Math,console,started:true,roundEnded:true,running:false,podium:{active:true,draw(){draws++;}},weaponRoot:heldWeapon,shieldModel:new THREE.Group(),avatar:otherFighter,$:node,t:x=>x,quality:'low',highGraphics:null,players:[{slot:0}],projectiles:[],projectileVisuals:null,scene,camera,renderer:{render(){renders++;}},noticeUntil:0,hitUntil:0,hudSince:10000,frames:0,fpsSince:10000});
vm.runInContext(render,context);vm.runInContext('frame(8000,16,0)',context);
assert.equal(draws,1);assert.equal(renders,1);assert.equal(heldWeapon.visible,false,'Started must not re-enable the foreground axe after a round');
context.podium.active=false;otherFighter.scale.setScalar(.2);vm.runInContext('frame(8016,16,0)',context);
assert.equal(heldWeapon.visible,false,'Returning to the menu after a round keeps equipment hidden');assert.equal(otherFighter.scale.x,1,'Menu preview restores full-size fighters');
console.log('PASS: podium framing, full-size fighters, winner celebration, upright loser, draws, match winner, reduced motion, camera restoration and foreground-weapon regression.');
