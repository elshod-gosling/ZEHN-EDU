import * as THREE from './vendor/three.module.js';
import {POTIONS,SPLASH_RADIUS} from './projectiles.mjs';

// Original voxel equipment: the same geometry is used in both fighters' hands.
export function createExtraItems(){
 const mat=color=>new THREE.MeshLambertMaterial({color});
 const wood=mat('#996833'),white=mat('#edf2e6'),glass=mat('#c7e8e8'),cork=mat('#875c39');
 const block=(g,size,pos,material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...pos);g.add(mesh);return mesh;};
 const bow=new THREE.Group();
 for(const [x,y] of [[0,0],[.06,.12],[.1,.24],[.06,.36],[0,.48],[-.07,-.1],[-.07,.58]])block(bow,[.065,.14,.065],[x,y,0],wood);
 block(bow,[.012,.72,.015],[-.12,.24,0],white);
 const orb=color=>{const g=new THREE.Group(),m=mat(color);block(g,[.25,.25,.22],[0,.2,0],m);block(g,[.15,.33,.17],[0,.2,0],m);block(g,[.05,.05,.01],[-.06,.26,.12],white);return g;};
 const potion=color=>{const g=new THREE.Group();block(g,[.24,.25,.2],[0,.18,0],glass);block(g,[.18,.19,.21],[0,.15,0],mat(color));block(g,[.09,.13,.09],[0,.37,0],glass);block(g,[.11,.06,.11],[0,.45,0],cork);return g;};
 return [bow,orb('#258b81'),orb('#edf5ff'),potion('#f05d77'),potion('#65c5ed'),potion('#bc64d7')];
}
export function createProjectileVisuals(scene){
 const root=new THREE.Group();scene.add(root);
 const materials={arrow:new THREE.MeshLambertMaterial({color:'#c2a16c'}),pearl:new THREE.MeshLambertMaterial({color:'#27b3a4'}),snowball:new THREE.MeshLambertMaterial({color:'#f6faff'})};
 const geometries={arrow:new THREE.BoxGeometry(.055,.055,.65),pearl:new THREE.BoxGeometry(.18,.18,.18),snowball:new THREE.BoxGeometry(.14,.14,.14)},meshes=new Map();
 const bottles=createExtraItems().slice(3);for(const bottle of bottles){bottle.scale.setScalar(.55);for(const part of bottle.children)part.position.y-=.2;}
 const colors={healing:'#f05d77',speed:'#65c5ed',strength:'#bc64d7'},splashes=[];
 const ringGeometry=new THREE.RingGeometry(SPLASH_RADIUS-.06,SPLASH_RADIUS,48),particleGeometry=new THREE.BoxGeometry(.08,.08,.08);
 const removeSplash=s=>{root.remove(s.group);s.material.dispose();};
 return {
  splash(event,now=performance.now()){
   if(!POTIONS.includes(event.item)||!['x','y','z'].every(k=>Number.isFinite(event[k])&&Math.abs(event[k])<200))return;
   if(splashes.length>=16)removeSplash(splashes.shift());
   const group=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:colors[event.item],transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
   group.position.set(event.x,event.y+.04,event.z);root.add(group);
   const ring=new THREE.Mesh(ringGeometry,material);ring.rotation.x=-Math.PI/2;group.add(ring);
   for(let n=0;n<16;n++){const particle=new THREE.Mesh(particleGeometry,material),angle=n/16*Math.PI*2;particle.userData.direction=new THREE.Vector3(Math.cos(angle),.4+(n%3)*.2,Math.sin(angle));group.add(particle);}
   splashes.push({group,material,ring,start:now});
  },
  draw(shots,visible,now=0){
   root.visible=visible;
   for(let n=splashes.length-1;n>=0;n--){const s=splashes[n],t=Math.max(0,(now-s.start)/650);if(t>=1){removeSplash(s);splashes.splice(n,1);continue;}s.material.opacity=.7*(1-t);s.ring.scale.setScalar(.15+.85*t);for(const particle of s.group.children.slice(1)){particle.position.copy(particle.userData.direction).multiplyScalar(t*SPLASH_RADIUS);particle.position.y-=t*t*.8;}}
   const ids=new Set(shots.map(s=>s.id));for(const [id,m] of meshes)if(!ids.has(id)){root.remove(m);meshes.delete(id);}
   for(const s of shots){let m=meshes.get(s.id);if(!m){m=POTIONS.includes(s.item)?bottles[POTIONS.indexOf(s.item)].clone():new THREE.Mesh(geometries[s.item],materials[s.item]);root.add(m);meshes.set(s.id,m);}m.position.set(s.x,s.y,s.z);if(s.item==='arrow')m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(s.vx,s.vy,s.vz).normalize());else if(POTIONS.includes(s.item))m.rotation.set(s.age*.3,0,s.age*.4);}
  }
 };
}
