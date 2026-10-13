import * as THREE from './vendor/three.module.js';

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
 return {draw(shots,visible){root.visible=visible;const ids=new Set(shots.map(s=>s.id));for(const [id,m] of meshes)if(!ids.has(id)){root.remove(m);meshes.delete(id);}for(const s of shots){let m=meshes.get(s.id);if(!m){m=new THREE.Mesh(geometries[s.item],materials[s.item]);root.add(m);meshes.set(s.id,m);}m.position.set(s.x,s.y,s.z);if(s.item==='arrow')m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(s.vx,s.vy,s.vz).normalize());}}};
}
